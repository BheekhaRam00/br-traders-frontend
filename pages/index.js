import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// 🔥 FIREBASE CONFIG (ENV से)
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
      setUser(u);
    });
    return () => unsub();
  }, []);

  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // =========================
  // 📡 FETCH HISTORY (FIXED)
  // =========================
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/history`, {
        cache: "no-store",
      });

      const data = await res.json();

      console.log("API DATA:", data);

      if (data && data.trades) {
        setHistory(data.trades);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 AUTO REFRESH (5 sec)
  useEffect(() => {
    fetchHistory();

    const interval = setInterval(() => {
      fetchHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // 🧠 FILTER LOGIC
  // =========================
  const activeTrades = history.filter((t) => !t.exitType);

  const todayExit = history.filter(
    (t) =>
      t.exitType &&
      t.exitTime &&
      new Date(t.exitTime).toDateString() === new Date().toDateString()
  );

  const fullHistory = history.filter((t) => t.exitType);

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
                {t.dir} @ {t.entry}
              </div>
            ))
          ) : (
            <p>Loading / No Active</p>
          )}

          {/* ================= TODAY EXIT ================= */}
          <h2 style={styles.section}>📅 Today’s Exits</h2>

          {todayExit.length > 0 ? (
            todayExit.map((t, i) => (
              <div key={i} style={styles.card}>
                {t.dir} → {t.exitType} @ {t.exitPrice}
              </div>
            ))
          ) : (
            <p>No exits today</p>
          )}

          {/* ================= HISTORY ================= */}
          <h2 style={styles.section}>📊 History</h2>

          {loading ? (
            <p>Loading...</p>
          ) : fullHistory.length > 0 ? (
            fullHistory.map((t, i) => (
              <div key={i} style={styles.card}>
                {t.dir} | Entry: {t.entry} | Exit: {t.exitType}
              </div>
            ))
          ) : (
            <p>No trades</p>
          )}
        </>
      )}
    </div>
  );
}

// =========================
// 🎨 STYLES (MODERN DARK)
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
    fontSize: "32px",
    marginBottom: "10px",
  },
  user: {
    marginBottom: "10px",
  },
  btn: {
    padding: "10px",
    background: "#00ffd0",
    border: "none",
    cursor: "pointer",
  },
  logout: {
    padding: "10px",
    background: "red",
    color: "white",
    border: "none",
    marginBottom: "20px",
  },
  section: {
    marginTop: "20px",
    marginBottom: "10px",
  },
  card: {
    background: "#111827",
    padding: "10px",
    marginBottom: "8px",
    borderRadius: "8px",
  },
};
