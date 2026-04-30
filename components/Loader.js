// ==============================
// ⏳ LOADER (PRO UI)
// ==============================

export default function Loader() {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <div style={styles.text}>Loading...</div>
    </div>
  );
}

// ==============================
// 🎨 STYLES
// ==============================
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    color: "#9ca3af",
  },

  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #1f2937",
    borderTop: "3px solid #00ff9f",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  text: {
    marginTop: "8px",
    fontSize: "12px",
  },
};

// ==============================
// 🔄 KEYFRAMES (INLINE FIX)
// ==============================
const styleSheet = document.styleSheets[0];
const keyframes =
  `@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`;

if (styleSheet && styleSheet.insertRule) {
  try {
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  } catch {}
}
