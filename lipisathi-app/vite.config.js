import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative base: the built app works from any folder, and from a mobile webview (Capacitor) without a server root.
  base: './',
})
