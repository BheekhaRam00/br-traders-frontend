// ==============================================
// 🚀 GLOBAL APP ENTRY (FCM ENABLED)
// ==============================================

import { useEffect } from "react";
import "../styles/globals.css";

// 🔥 FCM IMPORT
import {
  getFCMToken,
  listenForeground,
} from "../lib/firebase";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // ================================
    // 🔐 REGISTER SERVICE WORKER
    // ================================
    const registerSW = async () => {
      try {
        if ("serviceWorker" in navigator) {
          await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
          );
          console.log("✅ Service Worker Registered");
        }
      } catch (err) {
        console.log("❌ SW error:", err.message);
      }
    };

    // ================================
    // 🔔 INIT FCM
    // ================================
    const initFCM = async () => {
      try {
        const token = await getFCMToken();

        if (token) {
          console.log("🔥 FCM READY");

          // 👉 OPTIONAL (future use)
          // यहाँ तुम backend को token भेज सकते हो
        }

        // 🔊 foreground listener
        listenForeground();

      } catch (err) {
        console.log("❌ FCM init error:", err.message);
      }
    };

    // ================================
    // 🚀 START
    // ================================
    registerSW();
    initFCM();

  }, []);

  return <Component {...pageProps} />;
}
