// ==============================================
// 🚀 DASHBOARD FINAL PRO (INTELLIGENCE UPGRADE)
// ==============================================

import { useEffect, useState, useRef, useMemo } from "react";
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

  const [symbol, setSymbol] = useState("ALL");
  const [tf, setTf] = useState("ALL");
  const [strategy, setStrategy] = useState("ALL");

  const prevActiveRef = useRef([]);
  const prevHistoryRef = useRef([]);
  const scrollRef = useRef(null);

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

      const [a, h] = await Promise.all([
        getActiveTrades(),
        getHistory(),
      ]);

      // 🔊 detect new closed trade
      const prevH = prevHistoryRef.current;

      h.forEach((t) => {
        const old = prevH.find((p) => p.id === t.id);
        if (!old && t.exitType) {
          playSound(t.exitType);
        }
      });

      prevHistoryRef.current = h || [];

      const prev = prevActiveRef.current;

      const processed = (a || []).map((t) => {
        const old = prev.find((p) => p.id === t.id);

        if (!old) return { ...t, _new: true };

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
      setError("❌ Failed to load data");
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
    const i = setInterval(safeLoad, 2000);
    return () => clearInterval(i);
  }, []);

  // ================================
  // AUTO SCROLL
  // ================================
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active]);

  // ================================
  // DATA SPLIT
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
  // 🔥 STRATEGY ANALYTICS
  // ================================
  const strategyStats = {};
  sortedHistory.forEach((t) => {
    const key = t.strategy || "default";

    if (!strategyStats[key]) {
      strategyStats[key] = {
        trades: 0,
        wins: 0,
        pnl: 0,
      };
    }

    strategyStats[key].trades++;
    if (t.exitType === "TP") strategyStats[key].wins++;
    strategyStats[key].pnl += calcPnL(t);
  });

  // ================================
  // 🔥 STREAK
  // ================================
  let winStreak = 0;
  let lossStreak = 0;

  for (let t of sortedHistory) {
    if (t.exitType === "TP") {
      winStreak++;
      break;
    }
  }

  for (let t of sortedHistory) {
    if (t.exitType === "SL") {
      lossStreak++;
      break;
    }
  }

  // ================================
  // 🔥 RISK
  // ================================
  const callCount = active.filter((t) => t.dir === "CALL").length;
  const putCount = active.filter((t) => t.dir === "PUT").length;

  // ================================
  // 🔥 ACTIVE INTEL
  // ================================
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
    <div style={styles.container}>
      <h2>🚀 BR Traders Dashboard</h2>

      <button style={styles.refresh} onClick={loadData}>
        🔄 Refresh
      </button>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={loadData}>Retry</button>
        </div>
      )}

      {/* 🔥 STRATEGY PANEL */}
      <div style={styles.box}>
        <h4>📊 Strategy Stats</h4>
        {Object.entries(strategyStats).map(([k, v]) => (
          <div key={k}>
            {k} → {v.trades} trades |{" "}
            {((v.wins / v.trades) * 100 || 0).toFixed(1)}% | ₹
            {v.pnl.toFixed(2)}
          </div>
        ))}
      </div>

      {/* 🔥 STREAK */}
      <div style={styles.box}>
        🔥 Win Streak: {winStreak} | ❌ Loss Streak: {lossStreak}
      </div>

      {/* 🔥 RISK */}
      <div style={styles.box}>
        CALL: {callCount} | PUT: {putCount}
      </div>

      {/* 🔥 ACTIVE INTEL */}
      <div style={styles.box}>
        Avg Prob: {avgProb.toFixed(1)}% | Avg RR:{" "}
        {avgRR.toFixed(2)}
      </div>

      {loading && <p>Loading...</p>}

      {/* ACTIVE */}
      <h3 ref={scrollRef}>🟢 Active ({active.length})</h3>
      {active.map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}

      {/* HISTORY */}
      <h3>📜 History</h3>
      {sortedHistory.slice(0, 20).map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}
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

  refresh: {
    marginBottom: "10px",
  },

  box: {
    background: "#111827",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
  },

  error: {
    background: "#7f1d1d",
    padding: "10px",
    marginBottom: "10px",
  },
};
