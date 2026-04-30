// ==============================================
// 🚀 DASHBOARD + LIVE UPDATE + FILTERS + GROUPING
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

  // ================================
  // FETCH + LIVE UPDATE
  // ================================
  const loadData = async () => {
    try {
      const [a, h] = await Promise.all([
        getActiveTrades(),
        getHistory(),
      ]);

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

  // ================================
  // FILTER VALUES
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

  // ================================
  // FILTER APPLY
  // ================================
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
  const filteredHistory = applyFilter(oldHistory);

  // ================================
  // 🔥 GROUPING FUNCTION
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
  const losses = filteredHistory.filter((t) => t.exitType === "SL").length;
  const pnl = filteredHistory.reduce((s, t) => s + calcPnL(t), 0);

  // ================================
  // UI
  // ================================
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚀 BR Traders Dashboard</h2>

      {/* FILTERS */}
      <div style={styles.filters}>
        <Select label="Symbol" value={symbol} set={setSymbol} options={symbols} />
        <Select label="TF" value={tf} set={setTf} options={tfs} />
        <Select label="Strategy" value={strategy} set={setStrategy} options={strategies} />
      </div>

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
      {Object.entries(groupedActive).map(([key, trades]) => (
        <div key={key}>
          <h4 style={styles.groupTitle}>📦 {key}</h4>
          {trades.map((t) => (
            <TradeCard key={t.id} t={t} />
          ))}
        </div>
      ))}

      {/* TODAY */}
      <h3 style={styles.section}>🟡 Today Closed</h3>
      {Object.entries(groupedToday).map(([key, trades]) => (
        <div key={key}>
          <h4 style={styles.groupTitle}>📦 {key}</h4>
          {trades.map((t) => (
            <TradeCard key={t.id} t={t} />
          ))}
        </div>
      ))}

      {/* HISTORY */}
      <h3 style={styles.section}>📜 History</h3>
      {Object.entries(groupedHistory).map(([key, trades]) => (
        <div key={key}>
          <h4 style={styles.groupTitle}>📦 {key}</h4>
          {trades.slice(0, 20).map((t) => (
            <TradeCard key={t.id} t={t} />
          ))}
        </div>
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

  filters: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },

  selectBox: {
    background: "#111827",
    padding: "6px",
    borderRadius: "8px",
    fontSize: "12px",
  },

  groupTitle: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#38bdf8",
  },

  title: { marginBottom: "10px" },
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
