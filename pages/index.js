import { useEffect, useState } from "react";

export default function Home() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE = "https://br-traders-backend.vercel.app";

  async function fetchData() {
    try {
      // 🔥 ACTIVE TRADES
      const a = await fetch(`${BASE}/api/active`);
      const activeData = await a.json();

      // 🔥 HISTORY (Firebase)
      const h = await fetch(`${BASE}/api/history`);
      const historyData = await h.json();

      console.log("ACTIVE:", activeData);
      console.log("HISTORY:", historyData);

      setActive(Array.isArray(activeData) ? activeData : []);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 3000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{
      background: "#0b1220",
      minHeight: "100vh",
      color: "white",
      padding: 16,
      fontFamily: "sans-serif"
    }}>

      {/* HEADER */}
      <h1 style={{ color: "#00ffc8" }}>TRADE WITH</h1>

      {/* ================= ACTIVE ================= */}
      <Section title="ACTIVE TRADES" live>
        {loading ? (
          <p>Loading...</p>
        ) : active.length === 0 ? (
          <p>No active trades</p>
        ) : (
          active.map((t, i) => <TradeCard key={i} t={t} />)
        )}
      </Section>

      {/* ================= TODAY EXIT ================= */}
      <Section title="TODAY'S EXITS">
        {history.length === 0 ? (
          <p>No exits</p>
        ) : (
          history
            .filter(t => t.exitType)
            .slice(0, 5)
            .map((t, i) => <TradeCard key={i} t={t} exit />)
        )}
      </Section>

      {/* ================= HISTORY ================= */}
      <Section title="TRADE HISTORY">
        {history.length === 0 ? (
          <p>No history</p>
        ) : (
          history.map((t, i) => <TradeCard key={i} t={t} />)
        )}
      </Section>

    </div>
  );
}

// ================= COMPONENTS =================

function Section({ title, children, live }) {
  return (
    <div style={{
      marginTop: 20,
      padding: 15,
      borderRadius: 14,
      background: "#111827",
      border: "1px solid #1f2937"
    }}>
      <h2>
        {title} {live && <span style={{ color: "#00ff88" }}>● LIVE</span>}
      </h2>
      {children}
    </div>
  );
}

function TradeCard({ t, exit }) {
  const color = t.dir === "CALL" ? "#00ff88" : "#ff4d4d";

  return (
    <div style={{
      marginTop: 10,
      padding: 12,
      borderRadius: 10,
      background: "#0f172a",
      border: "1px solid #1f2937"
    }}>
      <h3 style={{ color }}>{t.dir}</h3>

      <p>Entry: {t.entry}</p>
      <p>SL: {t.sl}</p>
      <p>TP: {t.tp}</p>
      <p>RR: {t.rr}</p>
      <p>TF: {t.tf}</p>

      {exit && (
        <p style={{
          color: t.exitType === "TP" ? "#00ff88" : "#ff4d4d"
        }}>
          Result: {t.exitType}
        </p>
      )}
    </div>
  );
  }
