import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Proxy API requests in development to avoid CORS issues
        proxy: mode === 'development' ? {
          '/api': {
            target: env.VITE_BACKEND_URL || 'http://127.0.0.1:8000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
          }
        } : undefined
      },
      plugins: [react()],
      build: {
        // Production build optimizations
        sourcemap: mode !== 'production',
        minify: 'esbuild',
        target: 'es2020',
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'chart-vendor': ['recharts']
            }
          }
        }
      },
      define: {
        // Only expose necessary env variables to client
        'process.env.NODE_ENV': JSON.stringify(mode)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Optimize dependencies
      optimizeDeps: {
        include: ['react', 'react-dom', 'recharts']
      }
    };
});
