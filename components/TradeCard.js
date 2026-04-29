// ==============================
// 📦 TRADE CARD
// ==============================

import { calcPnL, formatTime } from "../lib/utils";

export default function TradeCard({ t }) {
  const pnl = calcPnL(t);

  return (
    <div style={styles.card}>
      <div>📊 {t.dir}</div>
      <div>Entry: {t.entry}</div>

      {t.exitType && (
        <>
          <div>Exit: {t.exitPrice}</div>
          <div>Type: {t.exitType}</div>
          <div>Time: {formatTime(t.exitTime)}</div>
          <div style={{ color: pnl >= 0 ? "lime" : "red" }}>
            PnL: {pnl}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#111827",
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "10px",
  },
};
