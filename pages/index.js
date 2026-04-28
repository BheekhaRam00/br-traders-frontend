import { useEffect, useState, useRef } from "react";
 
export default function Home() {
  const [trades, setTrades] = useState([]);
  const prevCount = useRef(0);

  // 🔥 Fetch Function
  const loadTrades = async () => {
    try {
      const res = await fetch(
        "https://br-traders-backend.vercel.app/api/history"
      );
      const data = await res.json();

      const newTrades = data.trades || [];

      // 🔔 New Trade Notification
      if (newTrades.length > prevCount.current) {
        notify("📈 New Trade Added!");
      }

      prevCount.current = newTrades.length;
      setTrades(newTrades);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  // 🔄 Auto Refresh
  useEffect(() => {
    loadTrades();

    const interval = setInterval(() => {
      loadTrades();
    }, 5000); // हर 5 सेकंड में refresh

    return () => clearInterval(interval);
  }, []);

  // 🔔 Notification Function
  const notify = (msg) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(msg);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>TRADE WITH</h1>
      <h2 style={styles.subtitle}>Live Trade History</h2>

      {trades.length === 0 ? (
        <p style={styles.noTrade}>No trades</p>
      ) : (
        <div style={styles.grid}>
          {trades.map((t) => (
            <div key={t.id} style={styles.card}>
              <div style={styles.row}>
                <span style={styles.label}>Type</span>
                <span
                  style={{
                    ...styles.value,
                    color: t.dir === "CALL" ? "#00ffcc" : "#ff4d4d",
                  }}
                >
                  {t.dir}
                </span>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>Entry</span>
                <span style={styles.value}>{t.entry}</span>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>Exit</span>
                <span style={styles.value}>{t.exitPrice}</span>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>SL</span>
                <span style={styles.value}>{t.sl}</span>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>TP</span>
                <span style={styles.value}>{t.tp}</span>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>RR</span>
                <span style={styles.value}>{t.rr}</span>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>TF</span>
                <span style={styles.value}>{t.tf}</span>
              </div>

              <div style={styles.time}>
                {new Date(t.time).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

//
// 🎨 STYLES (Modern Black Theme)
//
const styles = {
  container: {
    background: "#0a0f1c",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "sans-serif",
    color: "#fff",
  },

  title: {
    color: "#00ffcc",
    fontSize: "32px",
    marginBottom: "5px",
  },

  subtitle: {
    color: "#ccc",
    marginBottom: "20px",
  },

  noTrade: {
    color: "#888",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "15px",
  },

  card: {
    background: "#111827",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 0 10px rgba(0,255,204,0.1)",
    transition: "0.3s",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
  },

  label: {
    color: "#888",
    fontSize: "13px",
  },

  value: {
    fontWeight: "bold",
  },

  time: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#666",
    textAlign: "right",
  },
};
