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
// 🔐 ENV CONFIG
// ==========================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==========================
// 🚀 MAIN
// ==========================
export default function Home() {
  const API = "https://br-traders-backend.vercel.app/api";

  const [user, setUser] = useState(null);
  const [allTrades, setAllTrades] = useState([]);
  const [expanded, setExpanded] = useState(null);

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
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // ==========================
  // 📡 FETCH (FINAL FIXED)
  // ==========================
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/history`, {
        cache: "no-store",
      });

      const data = await res.json();

      console.log("API RESPONSE:", data);

      if (data?.trades) {
        setAllTrades(data.trades);
      } else {
        setAllTrades([]);
      }
    } catch (e) {
      console.error("FETCH ERROR:", e);
    }
  };

  // 🔁 AUTO REFRESH
  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // ==========================
  // 🧠 DATA LOGIC
  // ==========================
  const now = new Date();

  const activeTrades = allTrades.filter(
    (t) => !t.exitType || t.exitType === ""
  );

  const todayExits = allTrades.filter((t) => {
    if (!t.exitTime) return false;
    const d = new Date(t.exitTime);
    return d.toDateString() === now.toDateString();
  });

  const history = allTrades;

  // ==========================
  // 🎨 UI HELPERS
  // ==========================
  const card = {
    background: "#111827",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    border: "1px solid #1f2937",
  };

  const badge = (text, color) => ({
    padding: "4px 10px",
    borderRadius: 8,
    background: color,
    fontSize: 12,
  });

  // ==========================
  // 🎨 UI
  // ==========================
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "white",
        padding: 16,
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ color: "#00f5c4" }}>BR TRADERS</h1>

      {!user ? (
        <button onClick={loginGoogle}>Google Login</button>
      ) : (
        <>
          <p>👤 {user.email}</p>
          <button onClick={logout}>Logout</button>

          {/* ================= ACTIVE ================= */}
          <h2 style={{ marginTop: 20 }}>🟢 Active Trades</h2>

          {activeTrades.length === 0 ? (
            <p>Loading / No Active</p>
          ) : (
            activeTrades.map((t, i) => (
              <div key={i} style={card}>
                <b style={{ color: t.dir === "CALL" ? "#00ff88" : "#ff4d4d" }}>
                  {t.dir}
                </b>{" "}
                | Entry: {t.entry}
                <br />
                SL: {t.sl} | TP: {t.tp}
              </div>
            ))
          )}

          {/* ================= TODAY EXIT ================= */}
          <h2 style={{ marginTop: 25 }}>📅 Today’s Exits</h2>

          {todayExits.length === 0 ? (
            <p>No exits today</p>
          ) : (
            todayExits.map((t, i) => (
              <div key={i} style={card}>
                <b>{t.dir}</b> | Exit: {t.exitType}
                <br />
                Entry: {t.entry} → Exit: {t.exitPrice}
              </div>
            ))
          )}

          {/* ================= HISTORY ================= */}
          <h2 style={{ marginTop: 25 }}>📊 History</h2>

          {history.length === 0 ? (
            <p>No trades</p>
          ) : (
            history.map((t, i) => (
              <div
                key={i}
                style={{ ...card, cursor: "pointer" }}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <b>{t.dir}</b> | {t.entry}

                {expanded === i && (
                  <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8 }}>
                    <p>SL: {t.sl}</p>
                    <p>TP: {t.tp}</p>
                    <p>Exit: {t.exitType}</p>
                    <p>Time: {t.time}</p>
                    <p>Exit Time: {t.exitTime}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
                                           }
