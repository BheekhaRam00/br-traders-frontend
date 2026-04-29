import { pnl } from "../lib/utils";

export default function Stats({ data }) {
  const total = data.length;
  const wins = data.filter((t) => t.exitType === "TP").length;
  const loss = total - wins;

  const profit = data.reduce((sum, t) => sum + pnl(t), 0);

  const winrate = total ? ((wins / total) * 100).toFixed(1) : 0;

  return (
    <div style={styles.box}>
      <div>Total: {total}</div>
      <div>Wins: {wins}</div>
      <div>Loss: {loss}</div>
      <div>Winrate: {winrate}%</div>
      <div>PnL: ₹ {profit}</div>
    </div>
  );
}

const styles = {
  box: {
    background: "#020617",
    padding: "15px",
    border: "1px solid #333",
    borderRadius: "10px",
    marginBottom: "20px",
  },
};
