import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Pure logic only — no jsdom, no component tests. Keeps the runner fast
    // and the dependency surface at exactly one package.
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    // Mirror the `@/*` -> repo-root alias from tsconfig.json so test files can
    // import modules the same way app code does.
    alias: { "@": root },
  },
});
