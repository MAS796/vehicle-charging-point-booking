import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function isPrivateIPv4(hostname) {
  const octets = hostname.split(".").map((value) => Number(value));
  if (octets.length !== 4 || octets.some((value) => Number.isNaN(value) || value < 0 || value > 255)) {
    return false;
  }
  const [a, b] = octets;
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

function validateProductionApiUrl(mode, env) {
  if (mode !== "production") return;
  const allowLocalApiUrl = (env.ALLOW_LOCAL_API_URL || "").trim() === "1";

  const apiUrl = (env.VITE_API_URL || "").trim();
  if (!apiUrl) {
    throw new Error(
      "Missing VITE_API_URL for production build. Set it to your public HTTPS backend URL."
    );
  }

  let parsed;
  try {
    parsed = new URL(apiUrl);
  } catch {
    throw new Error(`Invalid VITE_API_URL "${apiUrl}". Expected absolute URL like https://api.example.com`);
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!allowLocalApiUrl && parsed.protocol !== "https:") {
    throw new Error(`Invalid VITE_API_URL "${apiUrl}". Production API URL must use https://`);
  }

  if (!allowLocalApiUrl && (LOCAL_HOSTS.has(hostname) || isPrivateIPv4(hostname))) {
    throw new Error(`Invalid VITE_API_URL "${apiUrl}". Production API URL cannot point to localhost/private network.`);
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  validateProductionApiUrl(mode, env);

  return {
    plugins: [react()],
    base: "/",
    server: {
      port: 5173,
    },
  };
});
