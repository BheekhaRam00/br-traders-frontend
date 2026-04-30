// ==============================
// 📦 TRADE CARD (FINAL PRO MAX)
// ==============================

import { calcPnL, formatTime } from "../lib/utils";

export default function TradeCard({ t = {} }) {
  // ================================
  // 🧠 NORMALIZE
  // ================================
  const entry = Number(t.entry ?? t.entryPrice ?? 0);
  const live = Number(t.entryPrice ?? entry);
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
    pnl = calcPnL({ ...t, entry, exitPrice: exit });
  } catch {}

  // ================================
  // 📈 MOVE
  // ================================
  let move = 0;

  if (entry && live) {
    move = dir === "CALL" ? live - entry : entry - live;
  }

  const movePct = entry ? (move / entry) * 100 : 0;

  const isUp = move >= 0;
  const moveColor = isUp ? "#00ff9f" : "#ff4d4d";
  const arrow = isUp ? "⬆️" : "⬇️";

  // ================================
  // 🎯 PROBABILITY SCALE
  // ================================
  const prob = Math.max(0, Math.min(100, t.probability ?? 50));

  let probColor = "#ff4d4d";
  if (prob > 70) probColor = "#00ff9f";
  else if (prob > 40) probColor = "#facc15";

  // ================================
  // 🏷️ BADGE
  // ================================
  let badge = styles.activeBadge;

  if (isClosed) {
    if (exitType === "TP") badge = styles.winBadge;
    else if (exitType === "SL") badge = styles.lossBadge;
    else badge = styles.closedBadge;
  }

  // ================================
  // 🎯 DIR
  // ================================
  const isCall = dir === "CALL";
  const isPut = dir === "PUT";

  const isNew = t._new;
  const isUpdated = t._updated;

  // ================================
  // 🎨 CARD STYLE
  // ================================
  const cardStyle = {
    ...styles.card,

    ...(isActive &&
      (isCall ? styles.callBg : isPut ? styles.putBg : {})),

    ...(isNew &&
      (isCall ? styles.callGlow : isPut ? styles.putGlow : {})),

    ...(isUpdated &&
      (isCall ? styles.callFlash : isPut ? styles.putFlash : {})),
  };

  return (
    <div style={cardStyle}>
      {/* HEADER */}
      <div style={styles.header}>
        <span style={styles.symbol}>{symbol}</span>
        <span style={badge}>
          {isClosed
            ? exitType === "TP"
              ? "WIN"
              : exitType === "SL"
              ? "LOSS"
              : "CLOSED"
            : "ACTIVE"}
        </span>
      </div>

      {/* STRATEGY */}
      <div style={styles.sub}>
        {strategy} | {tf}
      </div>

      {/* DIR */}
      <div style={styles.dir(dir)}>{dir}</div>

      {/* CORE */}
      <div style={styles.row}>
        <span>Entry</span>
        <span>{entry}</span>
      </div>

      <div
        style={{
          ...styles.row,
          ...(exitType === "SL" && styles.hitSL),
        }}
      >
        <span>SL</span>
        <span>{sl}</span>
      </div>

      <div
        style={{
          ...styles.row,
          ...(exitType === "TP" && styles.hitTP),
        }}
      >
        <span>TP</span>
        <span>{tp}</span>
      </div>

      <div style={styles.row}>
        <span>RR</span>
        <span>{rr}</span>
      </div>

      {/* MOVE */}
      {isActive && (
        <div style={styles.row}>
          <span>Move</span>
          <span style={{ color: moveColor }}>
            {arrow} {move.toFixed(2)} ({movePct.toFixed(2)}%)
          </span>
        </div>
      )}

      {/* PROBABILITY */}
      {isActive && (
        <div style={styles.probBox}>
          <div style={{ ...styles.probText, color: probColor }}>
            Prob: {prob}%
          </div>
          <div style={styles.probBar}>
            <div
              style={{
                ...styles.probFill,
                width: `${prob}%`,
                background: probColor,
              }}
            />
          </div>
        </div>
      )}

      {/* ACTIVE */}
      {isActive && (
        <>
          <div style={styles.activeBox}>
            🟢 Running
          </div>

          <div style={{ ...styles.pnl, color: moveColor }}>
            ₹ {move.toFixed(2)}
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
            <span>Time</span>
            <span>
              {exitTime ? formatTime(exitTime) : "-"}
            </span>
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

  callBg: { background: "#052e1b" },
  putBg: { background: "#3b0a0a" },

  callGlow: { boxShadow: "0 0 14px #00ff9f" },
  putGlow: { boxShadow: "0 0 14px #ff4d4d" },
  callFlash: { boxShadow: "0 0 10px #00ff9f" },
  putFlash: { boxShadow: "0 0 10px #ff4d4d" },

  header: {
    display: "flex",
    justifyContent: "space-between",
  },

  symbol: { fontWeight: "bold" },

  activeBadge: {
    background: "#064e3b",
    color: "#00ff9f",
    padding: "4px 8px",
    borderRadius: "6px",
  },

  winBadge: {
    background: "#022c22",
    color: "#00ff9f",
    padding: "4px 8px",
    borderRadius: "6px",
  },

  lossBadge: {
    background: "#3b0a0a",
    color: "#ff4d4d",
    padding: "4px 8px",
    borderRadius: "6px",
  },

  closedBadge: {
    background: "#1f2937",
    color: "#9ca3af",
    padding: "4px 8px",
    borderRadius: "6px",
  },

  sub: {
    fontSize: "11px",
    color: "#9ca3af",
  },

  dir: (d) => ({
    fontWeight: "bold",
    color: d === "CALL" ? "#00ff9f" : "#ff4d4d",
  }),

  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    marginTop: "2px",
  },

  pnl: {
    marginTop: "8px",
    fontWeight: "bold",
  },

  activeBox: {
    marginTop: "6px",
    textAlign: "center",
    fontSize: "12px",
    color: "#00ff9f",
  },

  probBox: {
    marginTop: "6px",
  },

  probText: {
    fontSize: "11px",
    marginBottom: "2px",
  },

  probBar: {
    height: "6px",
    background: "#1f2937",
    borderRadius: "4px",
  },

  probFill: {
    height: "6px",
    borderRadius: "4px",
  },

  divider: {
    height: "1px",
    background: "#1f2937",
    margin: "6px 0",
  },

  hitTP: {
    background: "#022c22",
    borderRadius: "4px",
  },

  hitSL: {
    background: "#3b0a0a",
    borderRadius: "4px",
  },
};
