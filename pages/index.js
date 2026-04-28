import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// ✅ ENV CONFIG (यहीं use होगा)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Home() {
  const API = "https://br-traders-backend.vercel.app/api";

  const [history, setHistory] = useState([]);
  const [active, setActive] = useState([]);
  const [user, setUser] = useState(null);

  // =========================
  // 🔁 FETCH
  // =========================
  const fetchHistory = async () => {
    const res = await fetch(`${API}/history`);
    const data = await res.json();
    setHistory(data.trades || []);
  };

  const fetchActive = async () => {
    const res = await fetch(`${API}/active`);
    const data = await res.json();
    setActive(data.trades || []);
  };

  // =========================
  // 🔐 AUTH
  // =========================
  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginEmail = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // =========================
  // 🔔 NOTIFICATION
  // =========================
  const initNotifications = async () => {
    try {
      if (typeof window === "undefined") return;

      const messaging = getMessaging(app);

      await Notification.requestPermission();

      const token = await getToken(messaging, {
        vapidKey: vapidKey,
      });

      console.log("TOKEN:", token);

      onMessage(messaging, (payload) => {
        alert(payload.notification?.title || "New Trade");
      });
    } catch (e) {
      console.log("Notification error:", e);
    }
  };

  // =========================
  // 🚀 INIT
  // =========================
  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));

    fetchHistory();
    fetchActive();

    const interval = setInterval(() => {
      fetchHistory();
      fetchActive();
    }, 5000);

    initNotifications();

    return () => clearInterval(interval);
  }, []);

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div style={{ padding: 20, background: "#07121f", minHeight: "100vh", color: "white" }}>
      <h1 style={{ color: "#00ffc3" }}>TRADE WITH</h1>

      {!user ? (
        <div>
          <button onClick={loginGoogle}>Google Login</button>
        </div>
      ) : (
        <>
          <p>👤 {user.email}</p>
          <button onClick={logout}>Logout</button>

          <h2>Active Trades</h2>
          {active.map((t, i) => (
            <div key={i}>{t.dir} @ {t.entry}</div>
          ))}

          <h2>History</h2>
          {history.map((t, i) => (
            <div key={i}>
              {t.dir} | {t.entry} → {t.exitPrice} ({t.exitType})
            </div>
          ))}
        </>
      )}
    </div>
  );
        }
