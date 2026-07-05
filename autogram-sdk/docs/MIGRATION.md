# Migration guide

## 0.1.x → 0.2.0

0.2.0 hardens error handling and untangles internal module dependencies.
No call sites *must* change — all 0.1.x exports keep working — but error
classification code *should* move to the new `AutogramError` API.

### Errors now carry machine-readable codes

Every SDK error extends the new `AutogramError` base class and carries a
`code` (`AutogramErrorCode`):

| Class (unchanged) | `code` |
| --- | --- |
| `UserCancelledSigningException` | `user-cancelled` |
| `AutogramAppNotInstalledException` | `app-not-installed` |
| `AutogramSdkException` | `unknown` (or the code passed to its new optional second constructor argument) |

**Before (0.1.x):**

```typescript
try {
  await client.sign(...);
} catch (e) {
  if (e instanceof UserCancelledSigningException) { ... }
  // fragile: fails when the error crossed postMessage or a duplicate bundle
  if ((e as Error)?.name === "UserCancelledSigningException") { ... }
}
```

**After (0.2.0):**

```typescript
import { AutogramError } from "autogram-sdk";

try {
  await client.sign(...);
} catch (e) {
  if (AutogramError.is(e, "user-cancelled")) { ... }
  else if (AutogramError.is(e, "app-not-installed")) { ... }
}
```

`AutogramError.is()` matches real instances, serialized plain objects
(`{ code, message }`), and legacy 0.1.x error names, so it is safe on
errors received from any execution context.

`instanceof` checks against the concrete classes still work within a
single bundle — nothing breaks — but new code should use `is()`.

### Serializing errors across execution contexts

If you forward SDK errors over `postMessage` (custom channel
implementations, workers), use the new round-trip helpers instead of
ad-hoc `JSON.stringify` + name matching:

```typescript
// sending side
port.postMessage({ id, error: AutogramError.is(e) ? e.toJSON() : { message: String(e) } });

// receiving side
reject(AutogramError.fromJSON(data.error));
```

`fromJSON` also understands the 0.1.x extension-bridge envelope
(`{ message, name, cause, error: { name } }`), so mixed-version
extension/SDK deployments keep working.

### `SignedObject` moved (import path only)

`SignedObject` is now defined in the dependency-free core module and
exported from the package root:

```typescript
// before
import type { SignedObject } from "autogram-sdk/with-ui";
// after (old path still re-exports it)
import type { SignedObject } from "autogram-sdk";
```

The shape is unchanged (`{ content, signedBy, issuedBy }`). This removes a
circular dependency between `with-ui` and `avm-api`; importing the type no
longer implies the custom-elements side effects of `with-ui`.

### Deprecations (still functional)

- `new AutogramSdkException(message)` — prefer
  `new AutogramError(code, message)` with a specific code.
- Catching by class name string — prefer `AutogramError.is()`.

### For the browser extension (this repository)

- The injected↔background bridge now serializes errors with
  `toJSON`/`fromJSON`; the background worker includes `code` in its error
  envelope. Older extension versions talking to a newer SDK (or vice
  versa) degrade gracefully through the legacy-name fallback.
- Ditec `onError` callbacks now receive `{ code, message }` objects with
  D.Bridge-compatible codes (`ditec.utils.ERROR_CANCELLED` etc.), mapped
  from SDK errors via `toDitecError`.
