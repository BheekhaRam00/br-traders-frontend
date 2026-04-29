import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [active, setActive] = useState([]);
  const [fullHistory, setFullHistory] = useState([]);
  const [todayExit, setTodayExit] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // 🔄 FETCH DATA
  // =========================
  const fetchData = async () => {
    try {
      const [activeRes, historyRes] = await Promise.all([
        axios.get("/api/active"),
        axios.get("/api/history"),
      ]);

      const activeData = activeRes?.data || [];
      const historyData = historyRes?.data?.trades || [];

      setActive(activeData);
      setFullHistory(historyData);

      // ✅ TODAY EXIT FILTER FIX
      const today = new Date().toDateString();

      const todayFiltered = historyData.filter((t) => {
        if (!t.exitTime) return false;
        return new Date(t.exitTime).toDateString() === today;
      });

      setTodayExit(todayFiltered);
    } catch (err) {
      console.log("❌ FETCH ERROR:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🔁 AUTO REFRESH (2 sec)
  // =========================
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 2000); // 🔥 every 2 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚀 BR Traders</h1>

      {/* ================= ACTIVE ================= */}
      <h2 style={styles.section}>🟢 Active Trades</h2>

      {active.length > 0 ? (
        active.map((t, i) => (
          <div key={i} style={styles.card}>
            <b>{t.dir}</b>
            <br />
            Entry: {t.entry}
            <br />
            SL: {t.sl}
            <br />
            TP: {t.tp}
          </div>
        ))
      ) : (
        <p style={styles.empty}>No active trades</p>
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
              {t.dir} | {t.exitType || "OPEN"}
            </summary>
            <div style={{ marginTop: 6 }}>
              Entry: {t.entry} <br />
              Exit Price: {t.exitPrice || "-"} <br />
              Time: {t.exitTime || "-"} <br />
              RR: {t.rr || "-"}
            </div>
          </details>
        ))
      ) : (
        <p style={styles.empty}>No trades</p>
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
