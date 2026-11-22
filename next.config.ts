import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tunnel (cloudflared / ngrok / localtunnel) orqali `npm run dev` ishlatilganda kerak
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.ngrok-free.app",
    "*.ngrok.app",
    "*.loca.lt",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Telegram (web.telegram.org va ilovalar) mini appni iframe/webview ichida ochadi
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org https://telegram.org",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
