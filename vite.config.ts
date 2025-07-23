import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
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
    // Ensure proper chunking for production
    chunkSizeWarningLimit: 1000,
  },
  // Add server configuration for development
  server: {
    port: 3000,
    host: true,
  },
}));
