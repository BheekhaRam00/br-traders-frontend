import { useEffect, useState } from "react";
import { getActiveTrades, getHistory } from "../lib/api";

export default function Home() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);

  // 🔄 auto refresh
  useEffect(() => {
    load();

    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  async function load() {
    const a = await getActiveTrades();
    const h = await getHistory();

    setActive(a || []);
    setHistory(h || []);
  }

  return (
    <div className="container">
      <div className="title">TRADE WITH</div>

      {/* ACTIVE */}
      <div className="card">
        <h3>ACTIVE TRADES</h3>

        {active.length === 0 && <p>No active trades</p>}

        {active.map((t, i) => (
          <div key={i} className="trade">
            <div className={t.dir === "CALL" ? "buy" : "sell"}>
              {t.dir}
            </div>
            <div>Entry: {t.entry}</div>
            <div>SL: {t.sl}</div>
            <div>TP: {t.tp}</div>
            <div>TF: {t.tf}</div>
          </div>
        ))}
      </div>

      {/* HISTORY */}
      <div className="card">
        <h3>TRADE HISTORY</h3>

        {history.length === 0 && <p>No history</p>}

        {history.map((t, i) => (
          <div key={i} className="trade">
            <div className={t.dir === "CALL" ? "buy" : "sell"}>
              {t.dir}
            </div>
            <div>{t.exitType}</div>
            <div>RR: {t.rr}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
