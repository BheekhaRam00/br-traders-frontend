import { useEffect, useState } from "react";

export default function Home() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://s-backend.vercel.app/api/history")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrades(data.trades);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 20, background: "#0b1220", minHeight: "100vh", color: "white" }}>
      <h1 style={{ color: "#00ffc3" }}>TRADE WITH</h1>

      <h2>Trade History</h2>

      {loading && <p>Loading...</p>}

      {!loading && trades.length === 0 && <p>No trades</p>}

      {trades.map((t, i) => {
        const pnl = t.exitPrice
          ? (t.dir === "CALL"
              ? t.exitPrice - t.entry
              : t.entry - t.exitPrice)
          : 0;

        return (
          <div key={i} style={{
            border: "1px solid #333",
            marginBottom: 10,
            padding: 10,
            borderRadius: 10,
            background: "#111"
          }}>
            <h3 style={{ color: t.dir === "CALL" ? "lime" : "red" }}>
              {t.dir}
            </h3>
            <p>Entry: {t.entry}</p>
            <p>SL: {t.sl}</p>
            <p>TP: {t.tp}</p>
            <p>RR: {t.rr}</p>
            <p>TF: {t.tf}</p>
            <p>Exit: {t.exitPrice || "-"}</p>
            <p>PnL: {pnl}</p>
          </div>
        );
      })}
    </div>
  );
      }
