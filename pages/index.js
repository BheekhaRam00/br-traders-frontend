// ==============================================
// 🚀 DASHBOARD WITH TODAY BUFFER + LIVE UPDATE
// ==============================================

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { getActiveTrades, getHistory } from "../lib/api";
import { calcPnL } from "../lib/utils";

const TradeCard = dynamic(() => import("../components/TradeCard"), {
  ssr: false,
});

export default function Home() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 NEW: previous active tracking
  const prevActiveRef = useRef([]);

  // ================================
  // FETCH + LIVE UPDATE DETECTION
  // ================================
  const loadData = async () => {
    try {
      const [a, h] = await Promise.all([
        getActiveTrades(),
        getHistory(),
      ]);

      const prev = prevActiveRef.current;

      // 🔥 detect new + updated trades
      const processed = (a || []).map((t) => {
        const old = prev.find((p) => p.id === t.id);

        // 🆕 new trade
        if (!old) {
          return { ...t, _new: true };
        }

        // 🔄 updated trade (price / probability change)
        if (
          old.entryPrice !== t.entryPrice ||
          old.probability !== t.probability
        ) {
          return { ...t, _updated: true };
        }

        return t;
      });

      prevActiveRef.current = a || [];

      setActive(processed);
      setHistory(h || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // AUTO REFRESH
  // ================================
  useEffect(() => {
    let running = false;

    const safeLoad = async () => {
      if (running) return;
      running = true;
      await loadData();
      running = false;
    };

    safeLoad();

    const i = setInterval(safeLoad, 2000);
    return () => clearInterval(i);
  }, []);

  // ================================
  // 📅 TODAY FILTER
  // ================================
  const today = new Date().toDateString();

  const todayTrades = history.filter(
    (t) =>
      t.exitTime &&
      new Date(t.exitTime).toDateString() === today
  );

  const oldHistory = history.filter(
    (t) =>
      !t.exitTime ||
      new Date(t.exitTime).toDateString() !== today
  );

  // ================================
  // 📊 STATS
  // ================================
  const total = history.length;

  const wins = history.filter(
    (t) => t.exitType === "TP"
  ).length;

  const losses = history.filter(
    (t) => t.exitType === "SL"
  ).length;

  const pnl = history.reduce(
    (sum, t) => sum + calcPnL(t),
    0
  );

  // ================================
  // UI
  // ================================
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚀 BR Traders Dashboard</h2>

      {/* STATS */}
      <div style={styles.stats}>
        <Stat label="Trades" value={total} />
        <Stat label="Wins" value={wins} />
        <Stat label="Loss" value={losses} />
        <Stat label="PnL" value={pnl.toFixed(2)} />
      </div>

      {loading && <p>Loading...</p>}

      {/* ACTIVE */}
      <h3 style={styles.section}>🟢 Active Trades</h3>
      {active.length === 0 && <p>No active trades</p>}
      {active.map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}

      {/* TODAY CLOSED */}
      <h3 style={styles.section}>🟡 Today Closed</h3>
      {todayTrades.length === 0 && <p>No trades today</p>}
      {todayTrades.map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}

      {/* HISTORY */}
      <h3 style={styles.section}>📜 History</h3>
      {oldHistory.length === 0 && <p>No history</p>}
      {oldHistory.slice(0, 20).map((t) => (
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
  },
  title: { marginBottom: "15px" },
  section: { marginTop: "20px" },
  stats: { display: "flex", gap: "10px" },
  statBox: {
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
    flex: 1,
    textAlign: "center",
  },
  statValue: { fontWeight: "bold" },
  statLabel: { fontSize: "12px", color: "#9ca3af" },
};
