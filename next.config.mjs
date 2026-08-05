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
};

export default nextConfig;
