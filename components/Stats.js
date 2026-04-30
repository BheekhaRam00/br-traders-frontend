// ==============================
// 📊 STATS COMPONENT (UPGRADED)
// ==============================

import { calcPnL, formatNumber } from "../lib/utils";

export default function Stats({ data = [] }) {
  const total = data.length;

  const wins = data.filter((t) => t.result === "WIN").length;
  const losses = data.filter((t) => t.result === "LOSS").length;

  const profit = data.reduce((sum, t) => sum + calcPnL(t), 0);

  const winrate = total
    ? ((wins / total) * 100).toFixed(1)
    : "0.0";

  return (
    <div style={styles.container}>
      <Stat label="Trades" value={total} />
      <Stat label="Wins" value={wins} color="#00ff9f" />
      <Stat label="Loss" value={losses} color="#ff4d4d" />
      <Stat label="Win %" value={`${winrate}%`} />
      <Stat
        label="PnL"
        value={`₹ ${formatNumber(profit)}`}
        color={profit >= 0 ? "#00ff9f" : "#ff4d4d"}
      />
    </div>
  );
}

// ==============================
// 📦 SINGLE STAT BOX
// ==============================
function Stat({ label, value, color = "#fff" }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.value, color }}>{value}</div>
      <div style={styles.label}>{label}</div>
    </div>
  );
}

// ==============================
// 🎨 STYLES
// ==============================
const styles = {
  container: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  card: {
    flex: "1",
    minWidth: "90px",
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
    textAlign: "center",
  },

  value: {
    fontSize: "16px",
    fontWeight: "bold",
  },

  label: {
    fontSize: "11px",
    color: "#9ca3af",
  },
};
