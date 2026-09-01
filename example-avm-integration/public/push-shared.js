// Shared helpers used by both public/push-sw.js (generic Web Push demo) and
// public/firebase-messaging-sw.js (Firebase Cloud Messaging demo).
//
// This file is loaded with `importScripts()` from a service worker, so it
// runs in the same global (`self`) scope as its caller — everything declared
// here becomes directly available to the importing script.

const AVM_PUSH_DB_NAME = "avm-push-inbox";
const AVM_PUSH_STORE_NAME = "notifications";

async function handlePush(event) {
  const payload = await readPushPayload(event.data);
  const item = normalizeNotificationPayload(payload);
  await saveNotification(item);
  await broadcast({ type: "avm-push-received", item });

  await self.registration.showNotification(item.title, {
    body: item.body || "Open the AVM example to review this request.",
    tag: `avm-push-${item.id}`,
    data: { notificationId: item.id },
  });
}

async function handleMessage(event) {
  const data = event.data || {};

  if (data.type === "avm-push-get-notifications") {
    const items = await getNotifications();
    event.source?.postMessage({ type: "avm-push-sync", items });
    return;
  }

  if (data.type === "avm-push-clear-notifications") {
    await clearNotifications();
    event.source?.postMessage({ type: "avm-push-sync", items: [] });
  }
}

async function handleNotificationClick(event) {
  const notificationId = event.notification.data?.notificationId;
  const item = notificationId ? await getNotification(notificationId) : null;
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  const existingClient = clients[0] || null;
  if (existingClient) {
    await existingClient.focus();
    if (item) {
      existingClient.postMessage({ type: "avm-push-activate", item });
    }
    return;
  }

  await self.clients.openWindow("./");
}

async function readPushPayload(data) {
  if (!data) {
    return {};
  }

  try {
    return data.json();
  } catch {
    try {
      return data.text();
    } catch {
      return {};
    }
  }
}

function normalizeNotificationPayload(payload) {
  const objectPayload =
    typeof payload === "string" ? { source: payload } : payload || {};
  const source =
    objectPayload.source ||
    objectPayload.url ||
    objectPayload.avmUrl ||
    objectPayload.query ||
    objectPayload.data?.source ||
    objectPayload.data?.url ||
    buildSourceFromFields(objectPayload);

  return {
    id:
      objectPayload.id ||
      (self.crypto?.randomUUID
        ? self.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
    title: objectPayload.title || "AVM push notification",
    body:
      objectPayload.body ||
      (source
        ? "Push payload contains an AVM URL that can be activated in the demo."
        : "Push payload received."),
    source: source || "",
    receivedAt: new Date().toISOString(),
    rawPayload: payload,
  };
}

function buildSourceFromFields(payload) {
  const guid = payload.guid || payload.data?.guid;
  const key = payload.key || payload.data?.key;
  const integration = payload.integration || payload.data?.integration;

  if (!guid || !key) {
    return "";
  }

  const params = new URLSearchParams({ guid, key });
  if (integration) {
    params.set("integration", integration);
  }
  return `?${params.toString()}`;
}

async function broadcast(message) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const client of clients) {
    client.postMessage(message);
  }
}

async function openAvmPushDatabase() {
  return await new Promise((resolve, reject) => {
    const request = indexedDB.open(AVM_PUSH_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(AVM_PUSH_STORE_NAME)) {
        database.createObjectStore(AVM_PUSH_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB."));
  });
}

async function saveNotification(item) {
  const database = await openAvmPushDatabase();
  await runAvmPushTransaction(database, "readwrite", (store) => store.put(item));
}

async function getNotifications() {
  const database = await openAvmPushDatabase();
  const items = await runAvmPushTransaction(database, "readonly", (store) =>
    store.getAll()
  );
  return items.sort((left, right) =>
    right.receivedAt.localeCompare(left.receivedAt)
  );
}

async function getNotification(id) {
  const database = await openAvmPushDatabase();
  return await runAvmPushTransaction(database, "readonly", (store) => store.get(id));
}

async function clearNotifications() {
  const database = await openAvmPushDatabase();
  await runAvmPushTransaction(database, "readwrite", (store) => store.clear());
}

async function runAvmPushTransaction(database, mode, operation) {
  return await new Promise((resolve, reject) => {
    const transaction = database.transaction(AVM_PUSH_STORE_NAME, mode);
    const store = transaction.objectStore(AVM_PUSH_STORE_NAME);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error("IndexedDB transaction failed."));
    };
  });
}
