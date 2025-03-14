import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Asegura que Vite use siempre este puerto
    proxy: {
      "/users": {
        target: "http://localhost:8000", // Redirige las peticiones al backend
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  base: "/",
});
