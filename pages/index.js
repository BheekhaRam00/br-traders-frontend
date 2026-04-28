import { useEffect, useState } from "react";

export default function Home() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchTrades() {
    try {
      const res = await fetch(
        "https://br-traders-backend.vercel.app/api/backtest"
      );

      const data = await res.json();

      console.log("API RESPONSE:", data);

      // 🔥 handle different formats
      let tradesData = [];

      if (Array.isArray(data)) {
        tradesData = data;
      } else if (data.trades) {
        tradesData = data.trades;
      } else if (data.total !== undefined) {
        // backtest summary → ignore trades
        tradesData = [];
      }

      setTrades(tradesData);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrades();

    const interval = setInterval(fetchTrades, 3000); // 🔁 auto refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: "#0b1220",
        minHeight: "100vh",
        color: "white",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      {/* HEADER */}
      <h1 style={{ color: "#00ffcc", marginBottom: 20 }}>
        TRADE WITH
      </h1>

      {/* ACTIVE TRADES */}
      <h2 style={{ marginBottom: 10 }}>Active Trades</h2>

      {loading ? (
        <p style={{ opacity: 0.6 }}>Loading...</p>
      ) : trades.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No trades</p>
      ) : (
        trades.map((t, i) => (
          <div
            key={i}
            style={{
              background: "#111827",
              padding: 15,
              borderRadius: 12,
              marginBottom: 12,
              border: "1px solid #1f2937",
              boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            }}
          >
            <h3
              style={{
                color: t.dir === "CALL" ? "#00ff88" : "#ff4d4d",
                marginBottom: 10,
              }}
            >
              {t.dir}
            </h3>

            <p>Entry: {t.entry}</p>
            <p>SL: {t.sl}</p>
            <p>TP: {t.tp}</p>
            <p>RR: {t.rr}</p>
            <p>TF: {t.tf}</p>
          </div>
        ))
      )}
    </div>
  );
        }
