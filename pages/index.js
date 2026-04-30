// ==============================================
// 🚀 DASHBOARD FINAL (PHASE 4 COMPLETE)
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

  const [symbol, setSymbol] = useState("ALL");
  const [tf, setTf] = useState("ALL");
  const [strategy, setStrategy] = useState("ALL");

  const prevActiveRef = useRef([]);
  const scrollRef = useRef(null);
  const prevHistoryRef = useRef([]);

  // ================================
  // 🔊 SOUND ALERT
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
  // 📍 AUTO SCROLL
  // ================================
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [active]);

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

  const recentTrades = [...history]
    .filter((t) => t.exitTime)
    .sort(
      (a, b) =>
        new Date(b.exitTime) - new Date(a.exitTime)
    )
    .slice(0, 5);

  // ================================
  // FILTERS
  // ================================
  const symbols = useMemo(() => {
    const set = new Set();
    [...active, ...history].forEach((t) => t.symbol && set.add(t.symbol));
    return ["ALL", ...Array.from(set)];
  }, [active, history]);

  const tfs = useMemo(() => {
    const set = new Set();
    [...active, ...history].forEach((t) => t.tf && set.add(t.tf));
    return ["ALL", ...Array.from(set)];
  }, [active, history]);

  const strategies = useMemo(() => {
    const set = new Set();
    [...active, ...history].forEach((t) => t.strategy && set.add(t.strategy));
    return ["ALL", ...Array.from(set)];
  }, [active, history]);

  const applyFilter = (list) => {
    return list.filter((t) => {
      if (symbol !== "ALL" && t.symbol !== symbol) return false;
      if (tf !== "ALL" && t.tf !== tf) return false;
      if (strategy !== "ALL" && t.strategy !== strategy) return false;
      return true;
    });
  };

  const filteredActive = applyFilter(active);
  const filteredToday = applyFilter(todayTrades);
  const filteredHistory = applyFilter(sortedHistory);

  // ================================
  // GROUPING
  // ================================
  const groupByStrategy = (list) => {
    const map = {};
    list.forEach((t) => {
      const key = t.strategy || "default";
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  };

  const groupedActive = groupByStrategy(filteredActive);
  const groupedToday = groupByStrategy(filteredToday);
  const groupedHistory = groupByStrategy(filteredHistory);

  // ================================
  // STATS
  // ================================
  const total = filteredHistory.length;
  const wins = filteredHistory.filter((t) => t.exitType === "TP").length;
  const pnl = filteredHistory.reduce((s, t) => s + calcPnL(t), 0);

  const winrate = total
    ? ((wins / total) * 100).toFixed(1)
    : 0;

  const todayTotal = filteredToday.length;
  const todayWins = filteredToday.filter((t) => t.exitType === "TP").length;
  const todayPnL = filteredToday.reduce((s, t) => s + calcPnL(t), 0);

  const todayWinrate = todayTotal
    ? ((todayWins / todayTotal) * 100).toFixed(1)
    : 0;

  // ================================
  // UI
  // ================================
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚀 BR Traders Dashboard</h2>

      {/* 🔄 MANUAL REFRESH */}
      <button style={styles.refresh} onClick={loadData}>
        🔄 Refresh
      </button>

      {/* FILTERS */}
      <div style={styles.filters}>
        <Select label="Symbol" value={symbol} set={setSymbol} options={symbols} />
        <Select label="TF" value={tf} set={setTf} options={tfs} />
        <Select label="Strategy" value={strategy} set={setStrategy} options={strategies} />
      </div>

      {/* STATS */}
      <div style={styles.stats}>
        <Stat label="Trades" value={total} />
        <Stat label="Win %" value={winrate} />
        <Stat label="PnL" value={pnl.toFixed(2)} />
      </div>

      {/* TODAY */}
      <div style={styles.todayBox}>
        <h4>📅 Today</h4>
        <div style={styles.stats}>
          <Stat label="Trades" value={todayTotal} />
          <Stat label="Win %" value={todayWinrate} />
          <Stat label="PnL" value={todayPnL.toFixed(2)} />
        </div>
      </div>

      {/* ACTIVITY */}
      <div style={styles.activityBox}>
        <h4>🕒 Activity</h4>
        {recentTrades.map((t) => (
          <div key={t.id}>
            {t.symbol} • {t.exitType} • ₹{calcPnL(t)}
          </div>
        ))}
      </div>

      {loading && <p>Loading...</p>}

      {/* ACTIVE */}
      <h3 ref={scrollRef}>🟢 Active ({filteredActive.length})</h3>
      {Object.values(groupedActive).flat().map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}

      {/* TODAY */}
      <h3>🟡 Today Closed</h3>
      {Object.values(groupedToday).flat().map((t) => (
        <TradeCard key={t.id} t={t} />
      ))}

      {/* HISTORY */}
      <h3>📜 History</h3>
      {Object.values(groupedHistory)
        .flat()
        .slice(0, 20)
        .map((t) => (
          <TradeCard key={t.id} t={t} />
        ))}
    </div>
  );
}

// ================================
function Select({ label, value, set, options }) {
  return (
    <div style={styles.selectBox}>
      <span>{label}</span>
      <select value={value} onChange={(e) => set(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.statBox}>
      <div>{value}</div>
      <div>{label}</div>
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
    padding: "6px 10px",
    background: "#1f2937",
    border: "none",
    color: "white",
    borderRadius: "6px",
  },

  filters: { display: "flex", gap: "10px", flexWrap: "wrap" },

  todayBox: {
    marginTop: "10px",
    padding: "10px",
    background: "#0f172a",
    borderRadius: "10px",
  },

  activityBox: {
    marginTop: "10px",
    padding: "10px",
    background: "#111827",
    borderRadius: "10px",
  },

  stats: { display: "flex", gap: "10px" },

  selectBox: {
    background: "#111827",
    padding: "6px",
    borderRadius: "8px",
  },

  statBox: {
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
  },
};
