// Generic Web Push demo service worker. Shared IndexedDB inbox and
// notification-handling logic lives in push-shared.js so it can also be
// reused by firebase-messaging-sw.js.
importScripts("./push-shared.js");

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  event.waitUntil(handlePush(event));
});

self.addEventListener("message", (event) => {
  event.waitUntil(handleMessage(event));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(handleNotificationClick(event));
});
