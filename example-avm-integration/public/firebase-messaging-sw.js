// Firebase Cloud Messaging (Web Push) service worker.
//
// This receives real push notifications delivered through Firebase Cloud
// Messaging and stores them in the same IndexedDB inbox used by the generic
// push-sw.js demo (see push-shared.js), so the existing "Browser push inbox"
// UI in the page works for both transports.
//
// IMPORTANT — replace the placeholders below with your own Firebase web app
// config (Firebase Console > Project settings > General > Your apps > SDK
// setup and configuration). This file is served as a static asset (from
// public/) and is NOT processed by Vite, so `import.meta.env` is not
// available here — the values must be filled in directly.
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");
importScripts("./push-shared.js");

firebase.initializeApp({
  apiKey: "REPLACE_WITH_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_FIREBASE_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_FIREBASE_PROJECT_ID",
  storageBucket: "REPLACE_WITH_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_FIREBASE_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_FIREBASE_APP_ID",
});

// Instantiating messaging() lets the Firebase SDK manage token invalidation
// internally. Notification handling itself is done via our own "push"
// listener below (not `onBackgroundMessage`) so that both foreground and
// background pushes are stored in the shared IndexedDB inbox the same way
// push-sw.js does. The AVM server should send data-only FCM messages (no
// top-level "notification" key) so Firebase doesn't also auto-display a
// duplicate notification.
firebase.messaging();

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
