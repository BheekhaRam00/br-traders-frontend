const BASE = "https://br-traders-backend.vercel.app";

// =================================
// 🛡️ SAFE FETCH (COMMON)
// =================================
async function safeFetch(url, timeout = 7000) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);

    // ❌ HTTP error (403, 500, etc)
    if (!res.ok) {
      console.log("❌ HTTP Error:", res.status);
      return null;
    }

    const data = await res.json();

    // ❌ Firestore quota error detect
    if (data?.error?.includes?.("Quota")) {
      console.log("⚠️ Quota error detected");
      return null;
    }

    return data;

  } catch (err) {
    console.log("❌ Fetch failed:", err.message);
    return null;
  }
}

// ================================
// 🔥 ACTIVE TRADES
// ================================
export async function getActiveTrades() {
  try {
    const data = await safeFetch(`${BASE}/api/active`);

    return Array.isArray(data) ? data : [];

  } catch (err) {
    console.log("❌ getActiveTrades:", err.message);
    return [];
  }
}

// ================================
// 📊 HISTORY
// ================================
export async function getHistory() {
  try {
    const data = await safeFetch(`${BASE}/api/history`);

    // backend returns { success, trades }
    return data?.trades || [];

  } catch (err) {
    console.log("❌ getHistory:", err.message);
    return [];
  }
}

// ================================
// 🚀 RUN ENGINE
// ================================
export async function getRunData() {
  try {
    const data = await safeFetch(`${BASE}/api/run`);
    return data || {};

  } catch (err) {
    console.log("❌ getRunData:", err.message);
    return {};
  }
}

// ================================
// 🧪 BACKTEST
// ================================
export async function getBacktest(days = 30) {
  try {
    const data = await safeFetch(
      `${BASE}/api/backtest?days=${days}`
    );

    return data || {};

  } catch (err) {
    console.log("❌ getBacktest:", err.message);
    return {};
  }
}
