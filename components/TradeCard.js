// ==============================
// 📦 TRADE CARD (SSR SAFE FINAL)
// ==============================

import { calcPnL, formatTime } from "../lib/utils";

export default function TradeCard({ t = {} }) {
  // ================================
  // 🧠 SAFE NORMALIZATION
  // ================================
  const entry = Number(t.entry ?? t.entryPrice ?? 0);
  const exit = Number(t.exitPrice ?? 0);

  const sl = t.sl ?? "-";
  const tp = t.tp ?? "-";
  const rr = t.rr ?? "-";

  const symbol = t.symbol || "N/A";
  const strategy = t.strategy || "default";
  const tf = t.tf || "-";
  const dir = t.dir || "-";

  const exitType = t.exitType || null;
  const exitTime = t.exitTime || null;

  const isClosed = !!exitType;
  const isActive = !isClosed;

  // ================================
  // 💰 PNL (SAFE)
  // ================================
  let pnl = 0;
  try {
    pnl = calcPnL({
      ...t,
      entry,
      exitPrice: exit,
    });
  } catch {
    pnl = 0;
  }

  // ================================
  // 🎨 STATUS
  // ================================
  const status = isClosed ? "CLOSED" : "ACTIVE";

  const exitColor =
    exitType === "TP"
      ? "#00ff9f"
      : exitType === "SL"
      ? "#ff4d4d"
      : "#9ca3af";

  const pnlColor = pnl >= 0 ? "#00ff9f" : "#ff4d4d";

  // ================================
  // 🎯 UI
  // ================================
  return (
    <div style={styles.card}>
      {/* HEADER */}
      <div style={styles.header}>
        <span style={styles.symbol}>{symbol}</span>
        <span style={styles.status(isActive)}>
          {status}
        </span>
      </div>

      {/* STRATEGY */}
      <div style={styles.sub}>
        {strategy} | {tf}
      </div>

      {/* DIRECTION */}
      <div style={styles.dir(dir)}>
        {dir}
      </div>

      {/* CORE DATA */}
      <div style={styles.row}>
        <span>Entry</span>
        <span>{entry}</span>
      </div>

      <div style={styles.row}>
        <span>SL</span>
        <span>{sl}</span>
      </div>

      <div style={styles.row}>
        <span>TP</span>
        <span>{tp}</span>
      </div>

      <div style={styles.row}>
        <span>RR</span>
        <span>{rr}</span>
      </div>

      {/* ACTIVE */}
      {isActive && (
        <div style={styles.activeBox}>
          🟢 Trade Running
        </div>
      )}

      {/* CLOSED */}
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
              {exitType}
            </span>
          </div>

          <div style={styles.row}>
            <span>Time</span>
            <span>
              {exitTime ? formatTime(exitTime) : "-"}
            </span>
          </div>

          <div style={{ ...styles.pnl, color: pnlColor }}>
            ₹ {pnl}
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
  },

  status: (active) => ({
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
