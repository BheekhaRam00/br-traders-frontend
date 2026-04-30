// ==============================
// 🔧 UTILS (PRODUCTION SAFE)
// ==============================

// ==============================
// 🕒 FORMAT TIME (SMART)
// ==============================
export const formatTime = (time) => {
  try {
    if (!time) return "-";

    const date = new Date(time);

    if (isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "-";
  }
};

// ==============================
// 💰 CALCULATE PNL (SMART FALLBACK)
// ==============================
export const calcPnL = (trade) => {
  try {
    // ✅ अगर backend pnl दे रहा है → वही use करो
    if (typeof trade.pnl === "number") {
      return Number(trade.pnl.toFixed(2));
    }

    // ❌ fallback calculation
    if (!trade.entry || !trade.exitPrice) return 0;

    let pnl = 0;

    if (trade.dir === "CALL") {
      pnl = trade.exitPrice - trade.entry;
    } else if (trade.dir === "PUT") {
      pnl = trade.entry - trade.exitPrice;
    }

    return Number(pnl.toFixed(2));
  } catch {
    return 0;
  }
};

// ==============================
// 📊 FORMAT NUMBER (NEW)
// ==============================
export const formatNumber = (num) => {
  try {
    if (num === null || num === undefined) return "-";
    return Number(num).toLocaleString("en-IN");
  } catch {
    return num;
  }
};
