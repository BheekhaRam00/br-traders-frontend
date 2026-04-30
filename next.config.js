const fs = require("fs");
const path = require("path");

module.exports = {
  webpack: (config) => {
    const swPath = path.resolve(__dirname, "public/firebase-messaging-sw.js");

    let content = fs.readFileSync(swPath, "utf8");

    content = content
      .replace(/%%NEXT_PUBLIC_FIREBASE_API_KEY%%/g, process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
      .replace(/%%NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN%%/g, process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
      .replace(/%%NEXT_PUBLIC_FIREBASE_PROJECT_ID%%/g, process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
      .replace(/%%NEXT_PUBLIC_FIREBASE_SENDER_ID%%/g, process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID)
      .replace(/%%NEXT_PUBLIC_FIREBASE_APP_ID%%/g, process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

    fs.writeFileSync(swPath, content);

    return config;
  },
};
