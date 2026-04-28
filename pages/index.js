import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// =========================
// 🔥 FIREBASE CONFIG
// =========================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Home() {
  const API = "https://br-traders-backend.vercel.app/api";

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // 🔐 AUTH
  // =========================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("👤 AUTH STATE:", u);
      setUser(u);
    });
    return () => unsub();
  }, []);

  const loginGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("LOGIN ERROR:", err);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // =========================
  // 📡 FETCH HISTORY (SUPER FIXED)
  // =========================
  const fetchHistory = async () => {
    try {
      console.log("🚀 FETCH START");

      const res = await fetch(
        `${API}/history?ts=${Date.now()}`, // 🔥 cache break
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🌐 STATUS:", res.status);

      const data = await res.json();

      console.log("🔥 RAW API:", data);

      // 🔥 HARD SAFE PARSE
      const trades = Array.isArray(data?.trades)
        ? data.trades
        : [];

      console.log("✅ PARSED TRADES:", trades);

      setHistory(trades);
    } catch (err) {
      console.error("❌ FETCH ERROR:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🔁 AUTO REFRESH
  // =========================
  useEffect(() => {
    fetchHistory();

    const interval = setInterval(() => {
      fetchHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // 🧠 FILTER LOGIC (SAFE)
  // =========================
  const activeTrades = history.filter(
    (t) => !t.exitType
  );

  const todayExit = history.filter((t) => {
    if (!t.exitType || !t.exitTime) return false;
    return (
      new Date(t.exitTime).toDateString() ===
      new Date().toDateString()
    );
  });

  const fullHistory = history.filter((t) => t.exitType);

  console.log("📊 FINAL STATES:", {
    total: history.length,
    active: activeTrades.length,
    today: todayExit.length,
    history: fullHistory.length,
  });

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>BR TRADERS</h1>

      {!user ? (
        <button style={styles.btn} onClick={loginGoogle}>
          Google Login
        </button>
      ) : (
        <>
          <p style={styles.user}>👤 {user.email}</p>

          <button style={styles.logout} onClick={logout}>
            Logout
          </button>

          {/* ================= ACTIVE ================= */}
          <h2 style={styles.section}>🟢 Active Trades</h2>

          {activeTrades.length > 0 ? (
            activeTrades.map((t, i) => (
              <div key={i} style={styles.card}>
                <b>{t.dir}</b> @ {t.entry}
                <br />
                SL: {t.sl} | TP: {t.tp}
              </div>
            ))
          ) : (
            <p style={styles.empty}>
              {loading ? "Loading..." : "No Active Trades"}
            </p>
          )}

          {/* ================= TODAY EXIT ================= */}
          <h2 style={styles.section}>📅 Today’s Exits</h2>

          {todayExit.length > 0 ? (
            todayExit.map((t, i) => (
              <div key={i} style={styles.card}>
                <b>{t.dir}</b> → {t.exitType}
                <br />
                Exit: {t.exitPrice}
              </div>
            ))
          ) : (
            <p style={styles.empty}>No exits today</p>
          )}

          {/* ================= HISTORY ================= */}
          <h2 style={styles.section}>📊 History</h2>

          {loading ? (
            <p style={styles.empty}>Loading...</p>
          ) : fullHistory.length > 0 ? (
            fullHistory.map((t, i) => (
              <details key={i} style={styles.card}>
                <summary>
                  {t.dir} | {t.exitType}
                </summary>
                <div style={{ marginTop: 6 }}>
                  Entry: {t.entry} <br />
                  Exit Price: {t.exitPrice} <br />
                  Time: {t.exitTime} <br />
                  RR: {t.rr}
                </div>
              </details>
            ))
          ) : (
            <p style={styles.empty}>No trades</p>
          )}
        </>
      )}
    </div>
  );
}

// =========================
// 🎨 STYLES
// =========================
const styles = {
  container: {
    background: "#020617",
    minHeight: "100vh",
    padding: "20px",
    color: "white",
    fontFamily: "sans-serif",
  },
  title: {
    color: "#00ffd0",
    fontSize: "34px",
    marginBottom: "15px",
    fontWeight: "bold",
  },
  user: {
    marginBottom: "10px",
    opacity: 0.8,
  },
  btn: {
    padding: "10px 15px",
    background: "#00ffd0",
    border: "none",
    cursor: "pointer",
    borderRadius: "6px",
  },
  logout: {
    padding: "10px 15px",
    background: "#ff3b3b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    marginBottom: "20px",
  },
  section: {
    marginTop: "25px",
    marginBottom: "10px",
    fontSize: "20px",
  },
  card: {
    background: "#111827",
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "10px",
  },
  empty: {
    opacity: 0.6,
  },
};
