import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const buildIso = new Date().toISOString()

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __BUILD_INFO__: JSON.stringify({
      mode,
      timestamp: buildIso,
    }),
  },
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
        secure: false,
      }
    }
  }
}))
