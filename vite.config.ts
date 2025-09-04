import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Add bundle analyzer in production
    ...(mode === 'production' ? [
      visualizer({
        filename: 'dist/bundle-analyzer.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      })
    ] : [])
  ],
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Simplified build config without manual chunk optimization
    chunkSizeWarningLimit: 1000,
    sourcemap: mode === 'development',
  },
  // Minimal dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  // Add server configuration for development
  server: {
    port: 3000,
    host: true,
  },
}));
