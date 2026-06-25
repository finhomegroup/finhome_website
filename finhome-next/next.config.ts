import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app (multiple lockfiles exist in the repo).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
