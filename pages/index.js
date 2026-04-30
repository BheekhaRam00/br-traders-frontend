// ==============================================
// 🚀 MAIN DASHBOARD (PRODUCTION READY)
// ==============================================

import { useEffect, useState } from "react";
import TradeCard from "../components/TradeCard";
import { getActiveTrades, getHistory } from "../lib/api";

export default function Home() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================================
  // 🔄 FETCH DATA
  // ================================
  const loadData = async () => {
    try {
      const [a, h] = await Promise.all([
        getActiveTrades(),
        getHistory(),
      ]);

      setActive(a || []);
      setHistory(h || []);
    } catch (err) {
      console.log("❌ load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // 🔁 AUTO REFRESH (SAFE 2s)
  // ================================
  useEffect(() => {
    let running = false;

    const safeLoad = async () => {
      if (running) return; // ❌ prevent overlap
      running = true;
      await loadData();
      running = false;
    };

    // 🔥 first load
    safeLoad();

    const interval = setInterval(() => {
      safeLoad();
    }, 2000); // 🔥 2 sec refresh

    return () => clearInterval(interval);
  }, []);

  // ================================
  // 📊 STATS
  // ================================
  const total = history.length;

  const wins = history.filter((t) => t.result === "WIN").length;
  const losses = history.filter((t) => t.result === "LOSS").length;

  const pnl = history.reduce((sum, t) => sum + (t.pnl || 0), 0);

  // ================================
  // 🎯 UI
  // ================================
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚀 BR Traders Dashboard</h2>

      {/* ============================= */}
      {/* 📊 STATS */}
      {/* ============================= */}
      <div style={styles.stats}>
        <Stat label="Trades" value={total} />
        <Stat label="Wins" value={wins} />
        <Stat label="Loss" value={losses} />
        <Stat label="PnL" value={pnl.toFixed(2)} />
      </div>

      {/* ============================= */}
      {/* 🔄 LOADING */}
      {/* ============================= */}
      {loading && <p>Loading...</p>}

      {/* ============================= */}
      {/* 🔥 ACTIVE */}
      {/* ============================= */}
      <h3 style={styles.section}>🟢 Active Trades</h3>

      {active.length === 0 && <p>No active trades</p>}

      {active.map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}

      {/* ============================= */}
      {/* 📜 HISTORY */}
      {/* ============================= */}
      <h3 style={styles.section}>📜 Trade History</h3>

      {history.length === 0 && <p>No history</p>}

      {history.slice(0, 20).map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}
    </div>
  );
}

// ================================
// 📊 STAT COMPONENT
// ================================
function Stat({ label, value }) {
  return (
    <div style={styles.statBox}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

// ================================
// 🎨 STYLES
// ================================
const styles = {
  container: {
    background: "#020617",
    minHeight: "100vh",
    padding: "15px",
    color: "white",
    fontFamily: "sans-serif",
  },

  title: {
    marginBottom: "15px",
  },

  section: {
    marginTop: "20px",
    marginBottom: "10px",
  },

  stats: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  statBox: {
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
    flex: "1",
    textAlign: "center",
  },

  statValue: {
    fontSize: "16px",
    fontWeight: "bold",
  },

  statLabel: {
    fontSize: "12px",
    color: "#9ca3af",
  },
};
