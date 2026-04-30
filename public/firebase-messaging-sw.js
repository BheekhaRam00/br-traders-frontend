// ==============================================
// 🚀 FIREBASE MESSAGING SERVICE WORKER (ENV SAFE)
// ==============================================

importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

// 🔐 BUILD-TIME ENV INJECTION (Vercel replaces this)
const firebaseConfig = {
  apiKey: "%%NEXT_PUBLIC_FIREBASE_API_KEY%%",
  authDomain: "%%NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN%%",
  projectId: "%%NEXT_PUBLIC_FIREBASE_PROJECT_ID%%",
  messagingSenderId: "%%NEXT_PUBLIC_FIREBASE_SENDER_ID%%",
  appId: "%%NEXT_PUBLIC_FIREBASE_APP_ID%%",
};

// 🔥 INIT
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// ==============================================
// 🔔 BACKGROUND MESSAGE
// ==============================================
messaging.onBackgroundMessage(function (payload) {
  console.log("📩 FCM Background:", payload);

  const title =
    payload?.notification?.title ||
    payload?.data?.title ||
    "Trade Update";

  const body =
    payload?.notification?.body ||
    payload?.data?.body ||
    "New trade event";

  const options = {
    body,
    icon: "/icon.png",
    badge: "/icon.png",
    data: {
      url: payload?.data?.url || "/",
    },
  };

  self.registration.showNotification(title, options);
});

// ==============================================
// 🔥 CLICK ACTION
// ==============================================
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const url = event.notification?.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
