import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Backend runs on :8000 in dev (uvicorn app.main:app). Proxying
      // avoids CORS entirely during local development.
      '/api': {
        target: 'https://imadi-customerp.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
