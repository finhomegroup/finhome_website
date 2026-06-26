import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Static export: `next build` emits a fully static site into `out/`,
  // deployable on Vercel (or any static host) without a Node server.
  output: "export",

  // Emit `route/index.html` instead of `route.html` so every static host
  // (incl. Vercel) resolves clean URLs without extra rewrite rules.
  trailingSlash: true,

  // Pin the workspace root to this app (multiple lockfiles exist in the repo).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
