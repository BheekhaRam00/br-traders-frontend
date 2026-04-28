const BASE = "https://br-traders-backend.vercel.app";

export async function getActiveTrades() {
  try {
    const res = await fetch(`${BASE}/api/active`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function getHistory() {
  try {
    const res = await fetch(`${BASE}/api/history`);
    return await res.json();
  } catch {
    return [];
  }
}
