import type { NextConfig } from "next";

/**
 * Every route in this project is static, so it can be exported to plain HTML
 * and hosted anywhere with no Node runtime. That path is opt-in via
 * `STATIC_EXPORT=1` (see the `build:static` script) rather than the default,
 * so adding API routes or server rendering later needs no config change —
 * just drop the static build.
 */
const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT === "1"
    ? { output: "export" as const, images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
