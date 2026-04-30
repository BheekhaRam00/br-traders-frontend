// ==============================
// 📦 TRADE CARD (UPGRADED)
// ==============================

import { calcPnL, formatTime } from "../lib/utils";

export default function TradeCard({ t }) {
  const pnl = calcPnL(t);

  const isActive = t.status === "ACTIVE";
  const isPending = t.status === "PENDING";
  const isClosed = t.status === "CLOSED";

  return (
    <div style={styles.card}>
      {/* HEADER */}
      <div style={styles.header}>
        <span style={styles.symbol}>{t.symbol || "-"}</span>
        <span style={styles.status(isActive, isPending, isClosed)}>
          {t.status}
        </span>
      </div>

      {/* STRATEGY INFO */}
      <div style={styles.sub}>
        {t.strategy} | {t.tf}
      </div>

      {/* DIRECTION */}
      <div style={styles.dir(t.dir)}>
        {t.dir}
      </div>

      {/* PRICES */}
      <div style={styles.row}>
        <span>Entry:</span>
        <span>{t.entry}</span>
      </div>

      <div style={styles.row}>
        <span>SL:</span>
        <span>{t.sl}</span>
      </div>

      <div style={styles.row}>
        <span>TP:</span>
        <span>{t.tp}</span>
      </div>

      {/* ACTIVE INFO */}
      {isActive && (
        <>
          <div style={styles.row}>
            <span>Live Price:</span>
            <span>{t.entryPrice}</span>
          </div>

          <div style={styles.row}>
            <span>Probability:</span>
            <span>{t.probability || 50}%</span>
          </div>
        </>
      )}

      {/* CLOSED INFO */}
      {isClosed && (
        <>
          <div style={styles.row}>
            <span>Exit:</span>
            <span>{t.exitPrice}</span>
          </div>

          <div style={styles.row}>
            <span>Type:</span>
            <span>{t.exitType}</span>
          </div>

          <div style={styles.row}>
            <span>Time:</span>
            <span>{formatTime(t.exitTime)}</span>
          </div>

          <div
            style={{
              ...styles.pnl,
              color: pnl >= 0 ? "#00ff9f" : "#ff4d4d",
            }}
          >
            PnL: {pnl}
          </div>
        </>
      )}
    </div>
  );
}

// ==============================
// 🎨 STYLES
// ==============================
const styles = {
  card: {
    background: "#111827",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "12px",
    border: "1px solid #1f2937",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
  },

  symbol: {
    fontWeight: "bold",
    fontSize: "14px",
  },

  status: (a, p, c) => ({
    fontSize: "12px",
    padding: "2px 8px",
    borderRadius: "6px",
    background: a ? "#065f46" : p ? "#92400e" : "#1f2937",
    color: "#fff",
  }),

  sub: {
    fontSize: "11px",
    color: "#9ca3af",
    marginBottom: "6px",
  },

  dir: (d) => ({
    fontSize: "13px",
    fontWeight: "bold",
    color: d === "CALL" ? "#00ff9f" : "#ff4d4d",
    marginBottom: "6px",
  }),

  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    marginBottom: "4px",
  },

  pnl: {
    marginTop: "8px",
    fontWeight: "bold",
    fontSize: "14px",
  },
};
