// ==============================
// 🔧 UTILS (DATE + PNL)
// ==============================

export const formatTime = (time) => {
  if (!time) return "-";
  return new Date(time).toLocaleString();
};

export const calcPnL = (trade) => {
  if (!trade.exitType || !trade.entry || !trade.exitPrice) return 0;

  if (trade.dir === "CALL") {
    return trade.exitPrice - trade.entry;
  } else {
    return trade.entry - trade.exitPrice;
  }
};
