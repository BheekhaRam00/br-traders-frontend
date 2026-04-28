import { useEffect, useState } from "react";

const BASE = "https://br-traders-backend.vercel.app/api";

export default function Home() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, []);

  const load = async () => {
    try {
      const res = await fetch(`${BASE}/active`);
      const data = await res.json();
      setTrades(data || []);
    } catch {}
  };

  return (
    <div style={{ padding: 16, background: "#0b1220", minHeight: "100vh", color: "white" }}>
      
      <h1 style={{ color: "#00ffaa" }}>TRADE WITH</h1>

      <h3>ACTIVE TRADES</h3>

      {trades.length === 0 ? (
        <p>Fetching live market data...</p>
      ) : (
        trades.map((t, i) => (
          <div key={i} style={{ margin: 10, padding: 10, background: "#111a2e" }}>
            <p>{t.dir} | {t.tf}m</p>
            <p>Entry: {t.entry}</p>
            <p>SL: {t.sl}</p>
            <p>TP: {t.tp}</p>
          </div>
        ))
      )}

    </div>
  );
}
