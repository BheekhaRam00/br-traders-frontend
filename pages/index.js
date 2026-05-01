// ==============================================
// 🚀 DASHBOARD (STEP 2: INTELLIGENCE PANEL SAFE)
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
  const [error, setError] = useState("");

  const prevHistoryRef = useRef([]);
  const historyLoadedRef = useRef(false); // ✅ NEW

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
      setError("");

      // 🔥 ACTIVE ALWAYS
      const a = await getActiveTrades();

      // 🔥 HISTORY ONLY ONCE
      let h = history;
      if (!historyLoadedRef.current) {
        h = await getHistory();
        historyLoadedRef.current = true;
      }

      // 🔊 SOUND DETECT
      (h || []).forEach((t) => {
        const old = prevHistoryRef.current.find((p) => p.id === t.id);
        if (!old && t.exitType) playSound(t.exitType);
      });

      prevHistoryRef.current = h || [];

      setActive(a || []);
      if (h) setHistory(h);

    } catch (err) {
      console.log(err);

      // ❌ QUOTA ERROR HANDLE
      if (err?.message?.includes("Quota")) {
        setError("⚠️ Server Busy (Quota Limit). Try later.");
      } else {
        setError("❌ Data load failed");
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // ⏱ FIXED (8000ms)
    const i = setInterval(loadData, 8000);

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

  let winStreak = 0;
  let lossStreak = 0;

  for (let t of sortedHistory) {
    if (t.exitType === "TP") winStreak++;
    else break;
  }

  for (let t of sortedHistory) {
    if (t.exitType === "SL") lossStreak++;
    else break;
  }

  const callCount = active.filter((t) => t.dir === "CALL").length;
  const putCount = active.filter((t) => t.dir === "PUT").length;

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

      {/* ERROR */}
      {error && <div style={styles.error}>{error}</div>}

      {/* STATS */}
      <div className="stats">
        <Stat label="Trades" value={total} />
        <Stat label="Win %" value={winrate} />
        <Stat label="PnL" value={pnl.toFixed(2)} />
      </div>

      {/* INTELLIGENCE */}
      <div style={styles.intelCard}>
        <h3 style={styles.center}>📊 Intelligence</h3>

        <div style={styles.row}>
          🔥 Win: {winStreak} | ❌ Loss: {lossStreak}
        </div>

        <div style={styles.row}>
          CALL: {callCount} | PUT: {putCount}
        </div>

        <div style={styles.row}>
          Avg Prob: {avgProb.toFixed(1)}% | RR: {avgRR.toFixed(2)}
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
