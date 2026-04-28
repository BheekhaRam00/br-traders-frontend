import { useEffect, useState } from "react";

export default function Home() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchTrades() {
    try {
      const res = await fetch(
        "https://br-traders-backend.vercel.app/api/active"
      );
      const data = await res.json();

      console.log("API DATA:", data);

      setTrades(data);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrades();

    const interval = setInterval(fetchTrades, 3000); // 🔥 live update every 3s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#0b1220", minHeight: "100vh", color: "white", padding: 20 }}>
      
      <h1 style={{ color: "#00ffcc" }}>TRADE WITH</h1>

      <h2>Active Trades</h2>

      {loading ? (
        <p>Loading...</p>
      ) : trades.length === 0 ? (
        <p>No trades</p>
      ) : (
        trades.map((t, i) => (
          <div key={i} style={{
            background: "#111827",
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            border: "1px solid #1f2937"
          }}>
            <h3>{t.dir}</h3>
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
