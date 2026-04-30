// ==============================================
// 🚀 MAIN DASHBOARD (SSR SAFE FINAL)
// ==============================================

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getActiveTrades, getHistory } from "../lib/api";
import { calcPnL } from "../lib/utils";

// ✅ TradeCard SSR safe load
const TradeCard = dynamic(() => import("../components/TradeCard"), {
  ssr: false,
});

export default function Home() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");

      const [a, h] = await Promise.all([
        getActiveTrades(),
        getHistory(),
      ]);

      setActive(a || []);
      setHistory(h || []);
    } catch (err) {
      console.log("❌ load error:", err.message);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let running = false;

    const safeLoad = async () => {
      if (running) return;
      running = true;
      await loadData();
      running = false;
    };

    safeLoad();

    const interval = setInterval(() => {
      safeLoad();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ================================
  // SORT
  // ================================
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.exitTime || 0) - new Date(a.exitTime || 0)
  );

  // ================================
  // STATS
  // ================================
  const total = sortedHistory.length;

  const wins = sortedHistory.filter(
    (t) => t.exitType === "TP"
  ).length;

  const losses = sortedHistory.filter(
    (t) => t.exitType === "SL"
  ).length;

  const pnl = sortedHistory.reduce(
    (sum, t) => sum + calcPnL(t),
    0
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚀 BR Traders Dashboard</h2>

      <div style={styles.stats}>
        <Stat label="Trades" value={total} />
        <Stat label="Wins" value={wins} />
        <Stat label="Loss" value={losses} />
        <Stat label="PnL" value={pnl.toFixed(2)} />
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading && <p>Loading...</p>}

      {/* ACTIVE */}
      <h3 style={styles.section}>🟢 Active Trades</h3>

      {active.length === 0 && !loading && (
        <p>No active trades</p>
      )}

      {active.map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}

      {/* HISTORY */}
      <h3 style={styles.section}>📜 Trade History</h3>

      {sortedHistory.length === 0 && !loading && (
        <p>No history</p>
      )}

      {sortedHistory.slice(0, 20).map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}
    </div>
  );
}

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
const styles = {
  container: {
    background: "#020617",
    minHeight: "100vh",
    padding: "15px",
    color: "white",
    fontFamily: "sans-serif",
  },
  title: { marginBottom: "15px" },
  section: { marginTop: "20px", marginBottom: "10px" },
  stats: { display: "flex", gap: "10px", flexWrap: "wrap" },
  statBox: {
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
    flex: "1",
    textAlign: "center",
  },
  statValue: { fontSize: "16px", fontWeight: "bold" },
  statLabel: { fontSize: "12px", color: "#9ca3af" },
  error: {
    background: "#7f1d1d",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    fontSize: "12px",
  },
};
