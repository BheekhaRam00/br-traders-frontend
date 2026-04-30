// ==============================================
// 🚀 GLOBAL APP (FCM + THEME SAFE)
// ==============================================

import { useEffect, useState } from "react";
import "../styles/globals.css";

// 🔥 FCM
import {
  getFCMToken,
  listenForeground,
} from "../lib/firebase";

export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState("dark");

  // ================================
  // 🎨 LOAD THEME
  // ================================
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") || "dark";
      setTheme(saved);

      if (saved === "light") {
        document.documentElement.classList.add("light");
      }
    } catch {}
  }, []);

  // ================================
  // 🎨 TOGGLE THEME
  // ================================
  const toggleTheme = () => {
    try {
      const next = theme === "dark" ? "light" : "dark";
      setTheme(next);
      localStorage.setItem("theme", next);

      if (next === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    } catch {}
  };

  // ================================
  // 🔔 FCM INIT (UNCHANGED LOGIC)
  // ================================
  useEffect(() => {
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

    const initFCM = async () => {
      try {
        const token = await getFCMToken();

        if (token) {
          console.log("🔥 FCM READY");
        }

        listenForeground();
      } catch (err) {
        console.log("❌ FCM init error:", err.message);
      }
    };

    registerSW();
    initFCM();
  }, []);

  // ================================
  // UI
  // ================================
  return (
    <>
      {/* 🌗 THEME TOGGLE (FLOAT BUTTON) */}
      <div style={styles.themeBtn} onClick={toggleTheme}>
        {theme === "dark" ? "🌙" : "☀️"}
      </div>

      <Component {...pageProps} />
    </>
  );
}

// ================================
// 🎨 STYLE
// ================================
const styles = {
  themeBtn: {
    position: "fixed",
    top: "12px",
    right: "12px",
    zIndex: 999,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(10px)",
    padding: "6px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};
