import {
  BrowserClient,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope,
} from "@sentry/browser";

let scope: Scope | null = null;

if (process.env.NODE_ENV !== "production") {
  // filter integrations that use the global variable
  const integrations = getDefaultIntegrations({}).filter(
    (defaultIntegration) => {
      return !["BrowserApiErrors", "Breadcrumbs", "GlobalHandlers"].includes(
        defaultIntegration.name
      );
    }
  );
  const client = new BrowserClient({
    dsn: "http://91eed826091a4c3692c16ef7bf5b135a@localhost:8099/1",
    release: "autogram-extension@" + __COMMIT_HASH__,
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    integrations: integrations,
  });
  scope = new Scope();
  scope.setClient(client);
  client.init(); // initializing has to be done after setting the client on the scope
  // You can capture exceptions manually for this client like this:
  scope.captureException(new Error("example"));
}

export function captureException(error: Error) {
  if (scope) {
    scope.captureException(error);
  }
}
