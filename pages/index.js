// ==============================================
// 🚀 DASHBOARD (REALTIME + NO QUOTA ISSUE)
// ==============================================

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { calcPnL } from "../lib/utils";

// 🔥 FIRESTORE
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import { db } from "../lib/firebase";

const TradeCard = dynamic(() => import("../components/TradeCard"), {
  ssr: false,
});

export default function Home() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================================
  // 🔥 REALTIME LISTENER
  // ================================
  useEffect(() => {
    try {
      // ✅ ACTIVE TRADES
      const unsubActive = onSnapshot(
        collection(db, "activeTrades"),
        (snap) => {
          const data = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setActive(data);
        }
      );

      // ✅ HISTORY (LIMITED)
      const q = query(
        collection(db, "trades"),
        orderBy("createdAt", "desc"),
        limit(50)
      );

      const unsubHistory = onSnapshot(q, (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHistory(data);
        setLoading(false);
      });

      return () => {
        unsubActive();
        unsubHistory();
      };
    } catch (err) {
      console.log("❌ realtime error:", err);
      setLoading(false);
    }
  }, []);

  // ================================
  // 📊 STATS
  // ================================
  const total = history.length;
  const wins = history.filter((t) => t.exitType === "TP").length;
  const pnl = history.reduce((s, t) => s + calcPnL(t), 0);
  const winrate = total ? ((wins / total) * 100).toFixed(1) : 0;

  // ================================
  // TODAY SPLIT
  // ================================
  const today = new Date().toDateString();

  const todayTrades = history.filter(
    (t) =>
      t.exitTime &&
      new Date(t.exitTime).toDateString() === today
  );

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
};
