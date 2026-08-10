import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native module — it must stay outside the bundle.
  serverExternalPackages: ["better-sqlite3"],

  // The "@/…" alias is declared in tsconfig.json; it is repeated here so the
  // webpack build resolves it identically to the type-checker.
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.join(root, "src"),
    };
    return config;
  },

  turbopack: {
    root,
    resolveAlias: {
      "@/*": "./src/*",
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // The app is never meant to be embedded — blocks clickjacking.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing in the app uses these device APIs.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Force HTTPS once a browser has seen the site over it.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            // 'unsafe-inline' is required by Next's bootstrap script and the
            // generated styles; dev mode additionally needs 'unsafe-eval' for
            // hot reload, which production does not get. frame-ancestors
            // doubles up on X-Frame-Options for modern browsers.
            value:
              `default-src 'self'; script-src 'self' 'unsafe-inline'${
                process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""
              }; style-src 'self' 'unsafe-inline'; ` +
              "img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; " +
              "frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://checkout.paystack.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
