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
    rollupOptions: {
      external: [],
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Isolate recharts to prevent circular dependencies
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) {
              return 'chart-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor';
            }
            if (id.includes('@supabase') || id.includes('@tanstack/react-query')) {
              return 'supabase-vendor';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority') || id.includes('date-fns')) {
              return 'utils';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            return 'vendor';
          }
          
          // App chunks
          if (id.includes('src/components/admin')) {
            return 'admin';
          }
          if (id.includes('src/pages')) {
            return 'pages';
          }
          if (id.includes('src/components/ui')) {
            return 'ui';
          }
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Optimize bundle size
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    // Enable source maps for debugging in production
    sourcemap: mode === 'development',
    // Optimize CSS
    cssCodeSplit: true,
    // Set target for better compatibility
    target: 'es2015',
    // Enable tree shaking
    treeshake: {
      preset: 'recommended',
      moduleSideEffects: false,
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'recharts'
    ],
    exclude: []
  },
  // Add server configuration for development
  server: {
    port: 3000,
    host: true,
  },
}));
