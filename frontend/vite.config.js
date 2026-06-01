import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // Allows access from other devices on the network
    port: 10000,            // Frontend port
    proxy: {
      '/api': {
        target: 'https://finance-app-juzn.onrender.com',   // Backend server URL
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});
