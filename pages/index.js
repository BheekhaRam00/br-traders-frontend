const API = "https://s-backend.vercel.app/api"; // ← apna backend URL

async function loadTrades() {
  try {
    const res = await fetch(`${API}/history`);
    const data = await res.json();

    console.log("API DATA:", data); // debug

    const container = document.getElementById("trades");

    if (!data.success || data.trades.length === 0) {
      container.innerHTML = "<p>No trades</p>";
      return;
    }

    container.innerHTML = "";

    data.trades.forEach(t => {
      const pnl = t.exitPrice
        ? (t.dir === "CALL"
            ? t.exitPrice - t.entry
            : t.entry - t.exitPrice)
        : 0;

      const card = document.createElement("div");
      card.style.border = "1px solid #333";
      card.style.margin = "10px";
      card.style.padding = "10px";
      card.style.borderRadius = "10px";
      card.style.background = "#111";

      card.innerHTML = `
        <h3 style="color:${t.dir === "CALL" ? "lime" : "red"}">
          ${t.dir}
        </h3>
        <p>Entry: ${t.entry}</p>
        <p>SL: ${t.sl}</p>
        <p>TP: ${t.tp}</p>
        <p>RR: ${t.rr}</p>
        <p>TF: ${t.tf}</p>
        <p>Exit: ${t.exitPrice || "-"}</p>
        <p>PnL: ${pnl}</p>
      `;

      container.appendChild(card);
    });

  } catch (e) {
    console.error("Frontend error:", e);
  }
}

loadTrades();
