// ==============================
// 📦 TRADE CARD (CALL/PUT THEME)
// ==============================

import { calcPnL, formatTime } from "../lib/utils";

export default function TradeCard({ t = {} }) {
  // ================================
  // 🧠 NORMALIZE
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
  // 💰 PNL
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

  const pnlColor = pnl >= 0 ? "#00ff9f" : "#ff4d4d";

  // ================================
  // 🎯 DIRECTION COLORS
  // ================================
  const isCall = dir === "CALL";
  const isPut = dir === "PUT";

  // ================================
  // 🔥 FLAGS
  // ================================
  const isNew = t._new;
  const isUpdated = t._updated;

  // ================================
  // 🎨 CARD STYLE (DYNAMIC)
  // ================================
  const cardStyle = {
    ...styles.card,

    // 🎯 ACTIVE BG (CALL/PUT)
    ...(isActive &&
      (isCall
        ? styles.callBg
        : isPut
        ? styles.putBg
        : {})),

    // 🟢🟥 NEW GLOW
    ...(isNew &&
      (isCall
        ? styles.callGlow
        : isPut
        ? styles.putGlow
        : {})),

    // 🔄 UPDATE FLASH
    ...(isUpdated &&
      (isCall
        ? styles.callFlash
        : isPut
        ? styles.putFlash
        : {})),
  };

  return (
    <div style={cardStyle}>
      {/* HEADER */}
      <div style={styles.header}>
        <span style={styles.symbol}>{symbol}</span>
        <span style={styles.status(isActive)}>
          {isClosed ? "CLOSED" : "ACTIVE"}
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

      {/* CORE */}
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
        <>
          <div style={styles.activeBox}>
            🟢 Trade Running
          </div>

          <div style={{ ...styles.pnl, color: pnlColor }}>
            ₹ {pnl}
          </div>
        </>
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
            <span
              style={{
                color:
                  exitType === "TP"
                    ? "#00ff9f"
                    : "#ff4d4d",
              }}
            >
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
    transition: "all 0.3s ease",
  },

  // 🎯 ACTIVE BACKGROUND
  callBg: {
    background: "#052e1b",
  },
  putBg: {
    background: "#3b0a0a",
  },

  // 🟢 CALL EFFECTS
  callGlow: {
    boxShadow: "0 0 14px #00ff9f",
  },
  callFlash: {
    boxShadow: "0 0 10px #00ff9f",
  },

  // 🔴 PUT EFFECTS
  putGlow: {
    boxShadow: "0 0 14px #ff4d4d",
  },
  putFlash: {
    boxShadow: "0 0 10px #ff4d4d",
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
