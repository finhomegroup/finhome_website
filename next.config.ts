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

  // Expose the shared Cognito/API config to the client bundle. The repo's `.env`
  // stores these under the app-native `EXPO_PUBLIC_*` names; Next only inlines
  // `NEXT_PUBLIC_*`, so re-map them here. Values are ALWAYS bundled — same
  // public-exposure model as the mobile app's `EXPO_PUBLIC_*` vars. Used by the
  // client-side account-deletion flow (Cognito self-delete + RDS cleanup call).
  env: {
    NEXT_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    NEXT_PUBLIC_API_TOKEN: process.env.EXPO_PUBLIC_API_TOKEN,
    NEXT_PUBLIC_COGNITO_USER_POOL_ID: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID,
    NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID:
      process.env.EXPO_PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
  },
};

export default nextConfig;
