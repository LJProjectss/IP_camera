import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relatieve paden, zodat de site ook in een submap werkt (GitHub Pages).
  base: './',
})
