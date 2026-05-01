// ==============================================
// 🚀 DASHBOARD (FINAL STABLE + BACKTEST + INTELLIGENCE)
// ==============================================

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { getActiveTrades, getHistory, getBacktest } from "../lib/api";
import { calcPnL } from "../lib/utils";

const TradeCard = dynamic(() => import("../components/TradeCard"), {
  ssr: false,
});

export default function Home() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [backtest, setBacktest] = useState(null);
  const [btStrategy, setBtStrategy] = useState("v2");
  const [btDays, setBtDays] = useState(30);
  const [btLoading, setBtLoading] = useState(false);

  const historyLoaded = useRef(false);
  const isFetching = useRef(false);

  // ================================
  // 🔥 DATA LOAD (FIXED)
  // ================================
  const loadData = async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      const a = await getActiveTrades();
      setActive(Array.isArray(a) ? a : []);

      // ✅ FIXED HISTORY LOAD
      const h = await getHistory();

      if (Array.isArray(h)) {
        setHistory(h);

        if (h.length > 0) {
          historyLoaded.current = true;
        }
      }

    } catch (err) {
      console.log("❌ load error:", err.message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // ================================
  // 🔁 REFRESH
  // ================================
  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // ================================
  // 📊 STATS
  // ================================
  const total = history.length;
  const wins = history.filter((t) => t.exitType === "TP").length;
  const pnl = history.reduce((s, t) => s + calcPnL(t), 0);
  const winrate = total ? ((wins / total) * 100).toFixed(1) : 0;

  // ================================
  // 📅 TODAY
  // ================================
  const today = new Date().toDateString();

  const todayTrades = history.filter((t) => {
    if (!t.exitTime) return false;
    try {
      return new Date(t.exitTime).toDateString() === today;
    } catch {
      return false;
    }
  });

  // ================================
  // 🚀 BACKTEST RUN
  // ================================
  const runBacktest = async () => {
    try {
      setBtLoading(true);
      const res = await getBacktest(btDays, btStrategy);
      setBacktest(res);
    } catch (e) {
      console.log("❌ Backtest error:", e.message);
    } finally {
      setBtLoading(false);
    }
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="container">

      {/* HEADER */}
      <div style={styles.header}>
        🚀 BR Traders
      </div>

      {/* INTELLIGENCE DASHBOARD */}
      <div className="stats">
        <Stat label="Trades" value={total} />
        <Stat label="Win %" value={winrate} />
        <Stat label="PnL" value={pnl.toFixed(2)} />
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      {/* BACKTEST SECTION */}
      <Section title="🧪 Strategy Backtest">
        <div style={styles.btControls}>
          <select value={btStrategy} onChange={(e) => setBtStrategy(e.target.value)}>
            <option value="v1">Start 1</option>
            <option value="v2">Start 2</option>
          </select>

          <select value={btDays} onChange={(e) => setBtDays(Number(e.target.value))}>
            {[...Array(30)].map((_, i) => (
              <option key={i} value={i + 1}>{i + 1} Days</option>
            ))}
          </select>

          <button onClick={runBacktest} disabled={btLoading}>
            {btLoading ? "Running..." : "Run"}
          </button>
        </div>

        {backtest && (
          <div style={styles.btCard}>
            <Stat label="Trades" value={backtest.total} />
            <Stat label="Win %" value={backtest.winrate} />
            <Stat label="PnL" value={backtest.pnl} />
          </div>
        )}
      </Section>

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
        {history.length === 0 ? (
          <Empty text="No history" />
        ) : (
          history.slice(0, 20).map((t) => (
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

  btControls: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "10px",
  },

  btCard: {
    display: "flex",
    justifyContent: "space-around",
    background: "#020617",
    padding: "10px",
    borderRadius: "10px",
  },
};
