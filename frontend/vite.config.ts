import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/')
          if (
            normalized.includes('/node_modules/react/') ||
            normalized.includes('/node_modules/react-dom/') ||
            normalized.includes('/node_modules/react-router') ||
            normalized.includes('/node_modules/scheduler/')
          ) {
            return 'vendor'
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
