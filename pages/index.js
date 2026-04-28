import { useEffect, useState } from "react";

// 🔥 FIREBASE
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// ==========================
// 🔐 ENV CONFIG (Vercel se)
// ==========================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==========================
// 🚀 MAIN COMPONENT
// ==========================
export default function Home() {
  const API = "https://br-traders-backend.vercel.app/api";

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  // ==========================
  // 🔐 AUTH
  // ==========================
  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  // ==========================
  // 📊 FETCH HISTORY
  // ==========================
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/history`);
      const data = await res.json();

      console.log("DATA:", data);

      if (data.success) {
        setHistory(data.trades || []);
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.error("FETCH ERROR:", e);
    }
  };

  useEffect(() => {
    fetchHistory();

    const interval = setInterval(fetchHistory, 5000); // 🔄 auto refresh
    return () => clearInterval(interval);
  }, []);

  // ==========================
  // 🎨 UI
  // ==========================
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "white",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      {/* HEADER */}
      <h1 style={{ color: "#00f5c4", fontSize: 32 }}>TRADE WITH</h1>

      {/* AUTH */}
      {!user ? (
        <button
          onClick={loginGoogle}
          style={{
            padding: "10px 20px",
            marginTop: 20,
            background: "#00f5c4",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Google Login
        </button>
      ) : (
        <>
          <div style={{ marginTop: 10 }}>
            👤 {user.email}
            <br />
            <button
              onClick={logout}
              style={{
                marginTop: 10,
                padding: "6px 12px",
                background: "#ff4d4d",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>

          {/* HISTORY */}
          <h2 style={{ marginTop: 30 }}>📊 Trade History</h2>

          {history.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No trades</p>
          ) : (
            history.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "#111827",
                  padding: 15,
                  marginTop: 12,
                  borderRadius: 12,
                  border: "1px solid #1f2937",
                }}
              >
                <p>
                  <b style={{ color: "#00f5c4" }}>{t.dir}</b> | Entry:{" "}
                  {t.entry}
                </p>
                <p>
                  SL: {t.sl} | TP: {t.tp}
                </p>
                <p>
                  Result:{" "}
                  <span
                    style={{
                      color:
                        t.exitType === "TP"
                          ? "#00ff88"
                          : t.exitType === "SL"
                          ? "#ff4d4d"
                          : "#ccc",
                    }}
                  >
                    {t.exitType}
                  </span>
                </p>
                <p style={{ fontSize: 12, opacity: 0.6 }}>
                  {t.time}
                </p>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
                }
