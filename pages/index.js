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

// 🔥 FIREBASE CONFIG (अपना डालना)
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export default function Home() {
  const API = "https://br-traders-backend.vercel.app/api";

  const [history, setHistory] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // 🔁 FETCH FUNCTIONS
  // =========================
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/history`);
      const data = await res.json();
      setHistory(data.trades || []);
    } catch (e) {
      console.error("History error:", e);
    }
  };

  const fetchActive = async () => {
    try {
      const res = await fetch(`${API}/active`);
      const data = await res.json();
      setActive(data.trades || []);
    } catch (e) {
      console.error("Active error:", e);
    }
  };

  // =========================
  // 🔐 AUTH
  // =========================
  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginEmail = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // =========================
  // 🔔 NOTIFICATIONS
  // =========================
  const initNotifications = async () => {
    try {
      if (!messaging) return;

      await Notification.requestPermission();

      const token = await getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY",
      });

      console.log("🔔 TOKEN:", token);

      onMessage(messaging, (payload) => {
        alert(payload.notification.title);
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
    <div style={styles.container}>
      <h1 style={styles.title}>BR TRADERS</h1>

      {!user ? (
        <div style={styles.card}>
          <h3>Login</h3>
          <input
            placeholder="Email"
            style={styles.input}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            style={styles.input}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.btn} onClick={loginEmail}>
            Login
          </button>

          <button style={styles.btnGoogle} onClick={loginGoogle}>
            Google Login
          </button>
        </div>
      ) : (
        <>
          <div style={styles.topBar}>
            <span>👤 {user.email}</span>
            <button style={styles.logout} onClick={logout}>
              Logout
            </button>
          </div>

          {/* ACTIVE */}
          <div style={styles.card}>
            <h3>ACTIVE TRADES</h3>
            {active.length === 0 ? (
              <p>No active trades</p>
            ) : (
              active.map((t, i) => (
                <div key={i} style={styles.trade}>
                  {t.dir} @ {t.entry}
                </div>
              ))
            )}
          </div>

          {/* HISTORY */}
          <div style={styles.card}>
            <h3>TRADE HISTORY</h3>
            {history.length === 0 ? (
              <p>No trades</p>
            ) : (
              history.map((t, i) => (
                <div key={i} style={styles.trade}>
                  {t.dir} | Entry: {t.entry} → Exit: {t.exitPrice} ({t.exitType})
                </div>
              ))
            )}
          </div>
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
    background: "#07121f",
    minHeight: "100vh",
    padding: "20px",
    color: "white",
  },
  title: {
    color: "#00ffc3",
  },
  card: {
    background: "#0b1a2a",
    padding: "15px",
    marginTop: "15px",
    borderRadius: "10px",
  },
  input: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "5px",
    border: "none",
  },
  btn: {
    width: "100%",
    padding: "10px",
    background: "#00ffc3",
    border: "none",
    marginBottom: "10px",
  },
  btnGoogle: {
    width: "100%",
    padding: "10px",
    background: "#4285F4",
    border: "none",
    color: "white",
  },
  logout: {
    background: "red",
    color: "white",
    border: "none",
    padding: "5px 10px",
  },
  trade: {
    marginTop: "5px",
    padding: "5px",
    borderBottom: "1px solid #222",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
  },
};
