// ==============================================
// 🚀 DASHBOARD (MODERN UI UPGRADE)
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
  // STATS
  // ================================
  const total = history.length;
  const wins = history.filter((t) => t.exitType === "TP").length;
  const pnl = history.reduce((s, t) => s + calcPnL(t), 0);
  const winrate = total ? ((wins / total) * 100).toFixed(1) : 0;

  // ================================
  // UI
  // ================================
  return (
    <div className="container">

      {/* 🔥 HEADER */}
      <div style={styles.header}>
        🚀 BR Traders
      </div>

      {/* 📊 STATS */}
      <div className="stats">
        <Stat label="Trades" value={total} />
        <Stat label="Win %" value={winrate} />
        <Stat label="PnL" value={pnl.toFixed(2)} />
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      {/* ============================= */}
      {/* 🟢 ACTIVE */}
      {/* ============================= */}
      <Section title="🟢 Active Trades">
        {active.length === 0 ? (
          <Empty text="No active trades" />
        ) : (
          active.map((t) => (
            <TradeCard key={t.id} t={t} />
          ))
        )}
      </Section>

      {/* ============================= */}
      {/* 🟡 TODAY */}
      {/* ============================= */}
      <Section title="🟡 Today Closed">
        {todayTrades.length === 0 ? (
          <Empty text="No trades today" />
        ) : (
          todayTrades.map((t) => (
            <TradeCard key={t.id} t={t} />
          ))
        )}
      </Section>

      {/* ============================= */}
      {/* 📜 HISTORY */}
      {/* ============================= */}
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
// 🔥 SECTION WRAPPER
// ================================
function Section({ title, children }) {
  return (
    <div style={styles.sectionCard}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

// ================================
// 📊 STAT
// ================================
function Stat({ label, value }) {
  return (
    <div className="stat-box">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ================================
// EMPTY STATE
// ================================
function Empty({ text }) {
  return (
    <div style={styles.empty}>
      {text}
    </div>
  );
}

// ================================
// 🎨 STYLES
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

  sectionCard: {
    marginTop: "18px",
    padding: "12px",
    borderRadius: "12px",
    background: "#0f172a",
    border: "1px solid #1f2937",
  },

  sectionTitle: {
    textAlign: "center",
    marginBottom: "10px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#9ca3af",
  },

  empty: {
    textAlign: "center",
    fontSize: "13px",
    color: "#6b7280",
    padding: "10px",
  },
};
