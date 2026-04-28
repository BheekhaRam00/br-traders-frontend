import { useEffect, useState } from "react";
import { getActiveTrades, getHistory } from "../lib/api";

export default function Home() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    load();
    const i = setInterval(load, 4000);
    return () => clearInterval(i);
  }, []);

  async function load() {
    const a = await getActiveTrades();
    const h = await getHistory();

    setActive(a || []);
    setHistory(h || []);
  }

  return (
    <div className="app">
      
      {/* HEADER */}
      <div className="header">
        <div className="logo">TRADE WITH</div>
        <div className="live">● LIVE</div>
      </div>

      {/* ACTIVE TRADES */}
      <div className="card">
        <div className="cardHeader">
          ACTIVE TRADES <span className="liveSmall">LIVE</span>
        </div>

        {active.length === 0 && (
          <div className="empty">Fetching live market data...</div>
        )}

        {active.map((t, i) => (
          <div key={i} className="trade">
            <div className={t.dir === "CALL" ? "call" : "put"}>
              {t.dir}
            </div>

            <div className="details">
              <div>Entry: {t.entry}</div>
              <div>SL: {t.sl}</div>
              <div>TP: {t.tp}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TODAY EXIT */}
      <div className="card">
        <div className="cardHeader">
          TODAY'S EXITS <span className="tag">TODAY</span>
        </div>

        {history.length === 0 && (
          <div className="empty">Loading...</div>
        )}

        {history.slice(0, 5).map((t, i) => (
          <div key={i} className="trade">
            <div className={t.dir === "CALL" ? "call" : "put"}>
              {t.dir}
            </div>
            <div className="details">
              <div>{t.exitType}</div>
              <div>RR: {t.rr}</div>
            </div>
          </div>
        ))}
      </div>

      {/* HISTORY */}
      <div className="card">
        <div className="cardHeader">
          TRADE HISTORY <span className="tag2">ARCHIVE</span>
        </div>

        {history.length === 0 && (
          <div className="empty">Loading...</div>
        )}

        {history.map((t, i) => (
          <div key={i} className="trade">
            <div className={t.dir === "CALL" ? "call" : "put"}>
              {t.dir}
            </div>
            <div className="details">
              <div>{t.exitType}</div>
              <div>RR: {t.rr}</div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM NAV */}
      <div className="nav">
        <div className="navItem active">📊 Signals</div>
        <div className="navItem">📈 Markets</div>
        <div className="navItem">🏆 Stats</div>
        <div className="navItem">⚙️ Settings</div>
      </div>
    </div>
  );
              }
