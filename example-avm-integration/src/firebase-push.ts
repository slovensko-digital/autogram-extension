import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;
let messaging: Messaging | null = null;

function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId &&
      firebaseConfig.messagingSenderId
  );
}

async function getMessagingInstance() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env.local and fill in " +
        "your Firebase web app config to use the Firebase push platform."
    );
  }

  if (!(await isSupported())) {
    throw new Error(
      "Firebase Cloud Messaging is not supported in this browser."
    );
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }

  if (!messaging) {
    messaging = getMessaging(firebaseApp);
  }

  return messaging;
}

/**
 * Registers the Firebase messaging service worker, requests notification
 * permission if needed, and returns a Firebase Cloud Messaging registration
 * token that can be sent to the AVM server as the device's `registrationId`.
 */
export async function requestFirebaseRegistrationToken(): Promise<string> {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    throw new Error(
      "VITE_FIREBASE_VAPID_KEY is not set. Add your Web Push certificate key " +
        "from Firebase Console > Project settings > Cloud Messaging to .env.local."
    );
  }

  const messagingInstance = await getMessagingInstance();
  const serviceWorkerRegistration = await navigator.serviceWorker.register(
    "./firebase-messaging-sw.js"
  );
  await waitForActiveServiceWorker(serviceWorkerRegistration);

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission was not granted.");
    }
  }
  if (Notification.permission === "denied") {
    throw new Error("Notification permission is denied for this site.");
  }

  const token = await getToken(messagingInstance, {
    vapidKey,
    serviceWorkerRegistration,
  });

  if (!token) {
    throw new Error("Firebase did not return a registration token.");
  }

  return token;
}

async function waitForActiveServiceWorker(
  registration: ServiceWorkerRegistration
) {
  if (registration.active) {
    return;
  }

  const worker = registration.installing || registration.waiting;
  if (!worker) {
    return;
  }

  await new Promise<void>((resolve) => {
    worker.addEventListener("statechange", () => {
      if (worker.state === "activated") {
        resolve();
      }
    });
  });
}
