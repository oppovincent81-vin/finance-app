import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // Allows access from other devices on the network
    port: 3000,            // Frontend port
    proxy: {
      '/api': {
        target: 'http://localhost:5000',   // Backend server URL
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