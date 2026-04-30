// ==============================================
// 🚀 FIREBASE CLIENT (ENV SAFE + SSR SAFE)
// ==============================================

import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// 🔐 ENV CONFIG (Vercel)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 🔥 INIT (avoid re-init in Next)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ==============================================
// 🔔 SAFE MESSAGING INIT
// ==============================================
let messaging = null;

const initMessaging = async () => {
  try {
    // SSR guard + browser support check
    if (typeof window === "undefined") return null;

    const supported = await isSupported();
    if (!supported) {
      console.log("⚠️ FCM not supported in this browser");
      return null;
    }

    if (!messaging) {
      messaging = getMessaging(app);
    }

    return messaging;
  } catch (err) {
    console.log("❌ messaging init error:", err.message);
    return null;
  }
};

// ==============================================
// 🔔 GET FCM TOKEN (WITH PERMISSION)
// ==============================================
export const getFCMToken = async () => {
  try {
    const msg = await initMessaging();
    if (!msg) return null;

    // 🔥 request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return null;
    }

    const token = await getToken(msg, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.log("✅ FCM Token:", token);
      return token;
    } else {
      console.log("❌ No token received");
      return null;
    }

  } catch (err) {
    console.log("❌ Token error:", err.message);
    return null;
  }
};

// ==============================================
// 🔊 FOREGROUND LISTENER
// ==============================================
export const listenForeground = async () => {
  try {
    const msg = await initMessaging();
    if (!msg) return;

    onMessage(msg, (payload) => {
      console.log("📩 Foreground:", payload);

      const title =
        payload?.notification?.title ||
        payload?.data?.title ||
        "Trade Update";

      const body =
        payload?.notification?.body ||
        payload?.data?.body ||
        "";

      // 🔥 lightweight UI (alert replaceable)
      alert(`${title}\n${body}`);
    });

  } catch (err) {
    console.log("❌ foreground error:", err.message);
  }
};
