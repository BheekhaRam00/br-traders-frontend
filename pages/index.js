// ==============================================
// 🚀 DASHBOARD (CLEAN PRO UI REBUILD)
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
  // 🔊 SOUND (SAFE)
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

      // 🔊 detect new close
      h.forEach((t) => {
        const old = prevHistoryRef.current.find((p) => p.id === t.id);
        if (!old && t.exitType) {
          playSound(t.exitType);
        }
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

  // ================================
  // AUTO REFRESH (NO SCROLL JUMP)
  // ================================
  useEffect(() => {
    loadData();
    const i = setInterval(loadData, 3000);
    return () => clearInterval(i);
  }, []);

  // ================================
  // TODAY SPLIT (FIXED)
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
  // 📊 STATS (CLEAN)
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

      {/* HEADER */}
      <div className="sticky">
        <h2>🚀 BR Traders</h2>

        {/* STATS */}
        <div className="stats">
          <Stat label="Trades" value={total} />
          <Stat label="Win %" value={winrate} />
          <Stat label="PnL" value={pnl.toFixed(2)} />
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {/* ============================= */}
      {/* 🟢 ACTIVE */}
      {/* ============================= */}
      <h3>🟢 Active Trades</h3>

      {active.length === 0 && <p>No active trades</p>}

      {active.map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}

      {/* ============================= */}
      {/* 🟡 TODAY CLOSED */}
      {/* ============================= */}
      <h3>🟡 Today Closed</h3>

      {todayTrades.length === 0 && <p>No trades today</p>}

      {todayTrades.map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}

      {/* ============================= */}
      {/* 📜 HISTORY */}
      {/* ============================= */}
      <h3>📜 History</h3>

      {sortedHistory.length === 0 && <p>No history</p>}

      {sortedHistory.slice(0, 20).map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}
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
