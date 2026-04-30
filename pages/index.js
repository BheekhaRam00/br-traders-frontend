// ==============================================
// 🚀 DASHBOARD (STEP 2: INTELLIGENCE PANEL)
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

  const prevHistoryRef = useRef([]);

  // ================================
  // 🔊 SOUND
  // ================================
  const playSound = (type) => {
    try {
      const audio = new Audio(
        type === "TP"
          ? "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
          : "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      );
      audio.play();
    } catch {}
  };

  // ================================
  // FETCH
  // ================================
  const loadData = async () => {
    try {
      const [a, h] = await Promise.all([
        getActiveTrades(),
        getHistory(),
      ]);

      h.forEach((t) => {
        const old = prevHistoryRef.current.find((p) => p.id === t.id);
        if (!old && t.exitType) playSound(t.exitType);
      });

      prevHistoryRef.current = h || [];

      setActive(a || []);
      setHistory(h || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const i = setInterval(loadData, 3000);
    return () => clearInterval(i);
  }, []);

  // ================================
  // TODAY SPLIT
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

  const sortedHistory = [...oldHistory].sort(
    (a, b) =>
      new Date(b.exitTime || 0) - new Date(a.exitTime || 0)
  );

  // ================================
  // 📊 BASIC STATS
  // ================================
  const total = history.length;
  const wins = history.filter((t) => t.exitType === "TP").length;
  const pnl = history.reduce((s, t) => s + calcPnL(t), 0);
  const winrate = total ? ((wins / total) * 100).toFixed(1) : 0;

  // ================================
  // 🔥 INTELLIGENCE
  // ================================

  // strategy stats
  const strategyStats = {};
  sortedHistory.forEach((t) => {
    const key = t.strategy || "default";

    if (!strategyStats[key]) {
      strategyStats[key] = { trades: 0, wins: 0, pnl: 0 };
    }

    strategyStats[key].trades++;
    if (t.exitType === "TP") strategyStats[key].wins++;
    strategyStats[key].pnl += calcPnL(t);
  });

  // streak
  let winStreak = 0;
  let lossStreak = 0;

  for (let t of sortedHistory) {
    if (t.exitType === "TP") {
      winStreak++;
    } else break;
  }

  for (let t of sortedHistory) {
    if (t.exitType === "SL") {
      lossStreak++;
    } else break;
  }

  // risk
  const callCount = active.filter((t) => t.dir === "CALL").length;
  const putCount = active.filter((t) => t.dir === "PUT").length;

  // active intel
  const avgProb =
    active.reduce((s, t) => s + (t.probability || 0), 0) /
    (active.length || 1);

  const avgRR =
    active.reduce((s, t) => s + (Number(t.rr) || 0), 0) /
    (active.length || 1);

  // ================================
  // UI
  // ================================
  return (
    <div className="container">

      {/* HEADER */}
      <div style={styles.header}>
        🚀 BR Traders
      </div>

      {/* STATS */}
      <div className="stats">
        <Stat label="Trades" value={total} />
        <Stat label="Win %" value={winrate} />
        <Stat label="PnL" value={pnl.toFixed(2)} />
      </div>

      {/* ============================= */}
      {/* 🔥 INTELLIGENCE PANEL */}
      {/* ============================= */}
      <div style={styles.intelCard}>
        <h3 style={styles.center}>📊 Intelligence</h3>

        <div style={styles.row}>
          🔥 Win Streak: {winStreak} | ❌ Loss: {lossStreak}
        </div>

        <div style={styles.row}>
          CALL: {callCount} | PUT: {putCount}
        </div>

        <div style={styles.row}>
          Avg Prob: {avgProb.toFixed(1)}% | RR: {avgRR.toFixed(2)}
        </div>

        {/* Strategy */}
        <div style={{ marginTop: "8px" }}>
          {Object.entries(strategyStats).map(([k, v]) => (
            <div key={k} style={styles.small}>
              {k} → {v.trades} |{" "}
              {((v.wins / v.trades) * 100 || 0).toFixed(1)}% | ₹
              {v.pnl.toFixed(0)}
            </div>
          ))}
        </div>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      {/* ACTIVE */}
      <Section title="🟢 Active Trades">
        {active.length === 0 ? (
          <Empty text="No active trades" />
        ) : (
          active.map((t) => (
            <TradeCard key={t.id} t={t} />
          ))
        )}
      </Section>

      {/* TODAY */}
      <Section title="🟡 Today Closed">
        {todayTrades.length === 0 ? (
          <Empty text="No trades today" />
        ) : (
          todayTrades.map((t) => (
            <TradeCard key={t.id} t={t} />
          ))
        )}
      </Section>

      {/* HISTORY */}
      <Section title="📜 History">
        {sortedHistory.length === 0 ? (
          <Empty text="No history" />
        ) : (
          sortedHistory.slice(0, 20).map((t) => (
            <TradeCard key={t.id} t={t} />
          ))
        )}
      </Section>

    </div>
  );
}

// ================================
function Section({ title, children }) {
  return (
    <div style={styles.sectionCard}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-box">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Empty({ text }) {
  return <div style={styles.empty}>{text}</div>;
}

// ================================
const styles = {
  header: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "15px",
    background: "linear-gradient(90deg,#00ff9f,#38bdf8)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },

  intelCard: {
    marginTop: "15px",
    padding: "12px",
    borderRadius: "12px",
    background: "#111827",
  },

  center: {
    textAlign: "center",
    marginBottom: "6px",
  },

  row: {
    fontSize: "12px",
    marginBottom: "4px",
  },

  small: {
    fontSize: "11px",
    color: "#9ca3af",
  },

  sectionCard: {
    marginTop: "18px",
    padding: "12px",
    borderRadius: "12px",
    background: "#0f172a",
  },

  sectionTitle: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#9ca3af",
  },

  empty: {
    textAlign: "center",
    fontSize: "12px",
    color: "#6b7280",
  },
};
