// ==============================================
// 🚀 FIREBASE MESSAGING SERVICE WORKER (FINAL)
// ==============================================

importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

// 🔥 IMPORTANT: REAL VALUES डालो
firebase.initializeApp({
  apiKey: "PASTE_REAL_API_KEY",
  authDomain: "PASTE_REAL_AUTH_DOMAIN",
  projectId: "PASTE_REAL_PROJECT_ID",
  messagingSenderId: "PASTE_REAL_SENDER_ID",
  appId: "PASTE_REAL_APP_ID",
});

const messaging = firebase.messaging();

// ==============================================
// 🔔 BACKGROUND MESSAGE HANDLER
// ==============================================
messaging.onBackgroundMessage(function (payload) {
  console.log("📩 FCM Background:", payload);

  // ✅ fallback safe handling
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
    data: {
      url: "/", // 👉 click पर redirect
    },
  };

  self.registration.showNotification(title, options);
});

// ==============================================
// 🔥 CLICK ACTION (VERY IMPORTANT)
// ==============================================
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // अगर app already open है → focus करो
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        // नहीं है → नया tab खोलो
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
  );
});
