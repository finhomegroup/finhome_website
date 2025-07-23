import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Disable stagewise in production
    __STAGEWISE_ENABLED__: mode === 'development',
  },
  build: {
    rollupOptions: {
      external: mode === 'production' ? [
        '@stagewise/toolbar-react',
        '@stagewise-plugins/react'
      ] : [],
    },
  },
}));
