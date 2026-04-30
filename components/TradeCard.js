// ==============================
// 📦 TRADE CARD (PRO ULTRA FINAL)
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

  // ================================
  // 🎯 PROBABILITY
  // ================================
  const prob = Math.max(0, Math.min(100, t.probability ?? 50));

  let probColor = "#ff4d4d";
  if (prob > 70) probColor = "#00ff9f";
  else if (prob > 40) probColor = "#facc15";

  // ================================
  // 🎯 DIR
  // ================================
  const isCall = dir === "CALL";
  const isPut = dir === "PUT";

  const isNew = t._new;
  const isUpdated = t._updated;

  // ================================
  // 🎨 CARD STYLE (ULTRA CLEAN)
  // ================================
  const cardStyle = {
    ...styles.card,

    ...(isActive &&
      (isCall ? styles.callBg : isPut ? styles.putBg : {})),

    ...(isNew &&
      (isCall ? styles.callGlow : isPut ? styles.putGlow : {})),

    ...(isUpdated &&
      (isCall ? styles.callPulse : isPut ? styles.putPulse : {})),
  };

  // ================================
  // 🏷️ BADGE
  // ================================
  const badgeStyle = isClosed
    ? exitType === "TP"
      ? styles.winBadge
      : exitType === "SL"
      ? styles.lossBadge
      : styles.closedBadge
    : styles.activeBadge;

  const badgeText = isClosed
    ? exitType === "TP"
      ? "WIN"
      : exitType === "SL"
      ? "LOSS"
      : "CLOSED"
    : "ACTIVE";

  // ================================
  // UI
  // ================================
  return (
    <div style={cardStyle}>
      {/* HEADER */}
      <div style={styles.header}>
        <span style={styles.symbol}>{symbol}</span>
        <span style={badgeStyle}>{badgeText}</span>
      </div>

      {/* STRATEGY */}
      <div style={styles.sub}>
        {strategy} • {tf}
      </div>

      {/* DIR */}
      <div style={styles.dir(dir)}>{dir}</div>

      {/* CORE GRID */}
      <div style={styles.grid}>
        <Row label="Entry" value={entry} />
        <Row label="SL" value={sl} highlight={exitType === "SL"} />
        <Row label="TP" value={tp} highlight={exitType === "TP"} />
        <Row label="RR" value={rr} />
      </div>

      {/* LIVE MOVE */}
      {isActive && (
        <div style={styles.moveBox}>
          <span>Move</span>
          <span style={{ color: moveColor }}>
            {move.toFixed(2)} ({movePct.toFixed(2)}%)
          </span>
        </div>
      )}

      {/* PROBABILITY */}
      {isActive && (
        <div style={styles.probWrap}>
          <div style={{ ...styles.probText, color: probColor }}>
            Probability {prob}%
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
        <div style={{ ...styles.pnl, color: moveColor }}>
          ₹ {move.toFixed(2)}
        </div>
      )}

      {/* CLOSED */}
      {isClosed && (
        <>
          <div style={styles.divider} />

          <Row label="Exit" value={exit} />
          <Row
            label="Time"
            value={exitTime ? formatTime(exitTime) : "-"}
          />

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
// 🔹 SMALL ROW COMPONENT
// ==============================
function Row({ label, value, highlight }) {
  return (
    <div
      style={{
        ...styles.row,
        ...(highlight ? styles.highlight : {}),
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// ==============================
// 🎨 STYLES (PREMIUM)
// ==============================
const styles = {
  card: {
    background: "#0f172a",
    padding: "14px",
    marginBottom: "14px",
    borderRadius: "16px",
    border: "1px solid #1e293b",
    transition: "all 0.25s ease",
  },

  callBg: { background: "linear-gradient(145deg,#052e1b,#022c22)" },
  putBg: { background: "linear-gradient(145deg,#3b0a0a,#1f0a0a)" },

  callGlow: { boxShadow: "0 0 14px rgba(0,255,159,0.4)" },
  putGlow: { boxShadow: "0 0 14px rgba(255,77,77,0.4)" },

  callPulse: { boxShadow: "0 0 8px rgba(0,255,159,0.3)" },
  putPulse: { boxShadow: "0 0 8px rgba(255,77,77,0.3)" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
  },

  symbol: {
    fontWeight: "600",
    fontSize: "15px",
    letterSpacing: "0.3px",
  },

  sub: {
    fontSize: "11px",
    color: "#9ca3af",
    marginBottom: "6px",
  },

  dir: (d) => ({
    fontWeight: "700",
    fontSize: "13px",
    color: d === "CALL" ? "#00ff9f" : "#ff4d4d",
    marginBottom: "6px",
  }),

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    padding: "4px 6px",
    borderRadius: "6px",
    background: "#020617",
  },

  highlight: {
    background: "#1e293b",
  },

  moveBox: {
    marginTop: "8px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
  },

  probWrap: {
    marginTop: "8px",
  },

  probText: {
    fontSize: "11px",
    marginBottom: "3px",
  },

  probBar: {
    height: "6px",
    background: "#1f2937",
    borderRadius: "6px",
    overflow: "hidden",
  },

  probFill: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.4s ease",
  },

  pnl: {
    marginTop: "10px",
    fontWeight: "700",
    fontSize: "14px",
    textAlign: "right",
  },

  divider: {
    height: "1px",
    background: "#1f2937",
    margin: "8px 0",
  },

  // badges
  activeBadge: {
    background: "#064e3b",
    color: "#00ff9f",
    padding: "4px 8px",
    borderRadius: "8px",
    fontSize: "11px",
  },

  winBadge: {
    background: "#022c22",
    color: "#00ff9f",
    padding: "4px 8px",
    borderRadius: "8px",
    fontSize: "11px",
  },

  lossBadge: {
    background: "#3b0a0a",
    color: "#ff4d4d",
    padding: "4px 8px",
    borderRadius: "8px",
    fontSize: "11px",
  },

  closedBadge: {
    background: "#1f2937",
    color: "#9ca3af",
    padding: "4px 8px",
    borderRadius: "8px",
    fontSize: "11px",
  },
};
