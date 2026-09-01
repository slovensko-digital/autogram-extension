# Extension e2e tests (Playwright)

Load the built extension into Chromium and drive the **live** portals —
the layer above the jest portal contract tests
(`src/dbridge_js/ditecx/portal-*.test.ts`), which replay portal driver
scripts but cannot see injection-level failures (content script timing,
`window.ditec` replacement races, the RPC bridge, the signing UI).

## Prerequisites

```sh
npm run vite:build-dev        # builds dist/ (MV3), loaded into Chromium
npx playwright install chromium
```

- Network access to the portals (the tests drive the real pages).
- The real Autogram desktop app must **not** be running: the tests bind
  its port (37200) with a fake (`fake-autogram-desktop.ts`) that answers
  `GET /info` / `POST /sign`, so signing completes without an eID.

Run with `npm run test:e2e` (rebuilds dist first) or `npx playwright
test` directly.

## What is (and isn't) real

Everything runs for real — the portal page and its D.Bridge scripts, the
extension's content script → inject bundle → `window.ditec` replacement,
the signing dialog, the background worker RPC — except:

- the Autogram desktop app is the local fake on port 37200;
- the final POST of the signed document back to the portal is
  intercepted by `context.route`, so the fake signature never reaches
  the portal's servers.

## Tests

| Spec | Covers |
| --- | --- |
| `justice-live-portal.spec.ts` | <https://obcan.justice.sk/podpisovanie-dokumentov> (login-free): uploads a PDF and signs **twice in a row** — the regression from [issue #101](https://github.com/slovensko-digital/autogram-extension/issues/101#issuecomment-4978486015), where signing fell back to D.Launcher. Root cause found by this test: the inject bundle can run before the parser creates `<body>`; `CombinedClient` UI setup crashed on `document.body.appendChild`, the rejection was swallowed in `inject-ditec.ts`, and `window.ditec` was never replaced. Fixed by `waitForDocumentBody()` (autogram-sdk `with-ui.ts`) + error logging in the conflict resolvers. |
