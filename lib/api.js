const BASE = "https://br-traders-backend.vercel.app";

// ================================
// 🔥 ACTIVE TRADES
// ================================
export async function getActiveTrades() {
  try {
    const res = await fetch(`${BASE}/api/active`);
    const data = await res.json();

    // safety normalize
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.log("❌ getActiveTrades:", err.message);
    return [];
  }
}

// ================================
// 📊 HISTORY (FIXED STRUCTURE)
// ================================
export async function getHistory() {
  try {
    const res = await fetch(`${BASE}/api/history`);
    const data = await res.json();

    // backend returns { success, total, trades }
    return data?.trades || [];
  } catch (err) {
    console.log("❌ getHistory:", err.message);
    return [];
  }
}

// ================================
// 🚀 RUN ENGINE (NEW)
// ================================
export async function getRunData() {
  try {
    const res = await fetch(`${BASE}/api/run`);
    const data = await res.json();

    return data || {};
  } catch (err) {
    console.log("❌ getRunData:", err.message);
    return {};
  }
}

// ================================
// 🧪 BACKTEST (NEW)
// ================================
export async function getBacktest(days = 30) {
  try {
    const res = await fetch(
      `${BASE}/api/backtest?days=${days}`
    );

    const data = await res.json();
    return data || {};
  } catch (err) {
    console.log("❌ getBacktest:", err.message);
    return {};
  }
}
