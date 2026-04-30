// ==============================
// 📦 TRADE CARD (PRODUCTION UPGRADE)
// ==============================

import { calcPnL, formatTime } from "../lib/utils";

export default function TradeCard({ t }) {
  // ================================
  // 🧠 NORMALIZE (BACKEND SAFE)
  // ================================
  const entry = t.entry || t.entryPrice || 0;
  const exit = t.exitPrice || 0;

  const pnl = calcPnL({
    ...t,
    entry,
    exitPrice: exit,
  });

  const isClosed = t.exitType ? true : false;
  const isActive = !isClosed;

  // ================================
  // 🎯 STATUS LOGIC (SAFE)
  // ================================
  const status = isClosed ? "CLOSED" : "ACTIVE";

  // ================================
  // 🎨 EXIT TYPE COLOR
  // ================================
  const exitColor =
    t.exitType === "TP"
      ? "#00ff9f"
      : t.exitType === "SL"
      ? "#ff4d4d"
      : "#9ca3af";

  return (
    <div style={styles.card}>
      {/* ============================= */}
      {/* HEADER */}
      {/* ============================= */}
      <div style={styles.header}>
        <span style={styles.symbol}>{t.symbol || "N/A"}</span>

        <span style={styles.status(isActive, isClosed)}>
          {status}
        </span>
      </div>

      {/* ============================= */}
      {/* STRATEGY + TF */}
      {/* ============================= */}
      <div style={styles.sub}>
        {t.strategy || "default"} | {t.tf || "-"}
      </div>

      {/* ============================= */}
      {/* DIRECTION */}
      {/* ============================= */}
      <div style={styles.dir(t.dir)}>
        {t.dir || "-"}
      </div>

      {/* ============================= */}
      {/* CORE DATA */}
      {/* ============================= */}
      <div style={styles.row}>
        <span>Entry</span>
        <span>{entry}</span>
      </div>

      <div style={styles.row}>
        <span>SL</span>
        <span>{t.sl || "-"}</span>
      </div>

      <div style={styles.row}>
        <span>TP</span>
        <span>{t.tp || "-"}</span>
      </div>

      <div style={styles.row}>
        <span>RR</span>
        <span>{t.rr || "-"}</span>
      </div>

      {/* ============================= */}
      {/* ACTIVE INFO */}
      {/* ============================= */}
      {isActive && (
        <>
          <div style={styles.activeBox}>
            🟢 Trade Running
          </div>
        </>
      )}

      {/* ============================= */}
      {/* CLOSED INFO */}
      {/* ============================= */}
      {isClosed && (
        <>
          <div style={styles.divider} />

          <div style={styles.row}>
            <span>Exit</span>
            <span>{exit}</span>
          </div>

          <div style={styles.row}>
            <span>Result</span>
            <span style={{ color: exitColor }}>
              {t.exitType}
            </span>
          </div>

          <div style={styles.row}>
            <span>Time</span>
            <span>{formatTime(t.exitTime)}</span>
          </div>

          <div
            style={{
              ...styles.pnl,
              color: pnl >= 0 ? "#00ff9f" : "#ff4d4d",
            }}
          >
            ₹ {pnl}
          </div>
        </>
      )}
    </div>
  );
}

// ==============================
// 🎨 STYLES (CLEAN + TRADING UI)
// ==============================
const styles = {
  card: {
    background: "#0f172a",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "14px",
    border: "1px solid #1e293b",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
  },

  symbol: {
    fontWeight: "bold",
    fontSize: "14px",
    letterSpacing: "0.3px",
  },

  status: (active, closed) => ({
    fontSize: "11px",
    padding: "3px 8px",
    borderRadius: "6px",
    background: active ? "#064e3b" : "#1f2937",
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
    fontSize: "15px",
  },

  activeBox: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#00ff9f",
    background: "#022c22",
    padding: "6px",
    borderRadius: "6px",
    textAlign: "center",
  },

  divider: {
    height: "1px",
    background: "#1f2937",
    margin: "8px 0",
  },
};
