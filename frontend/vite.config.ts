import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Dev server reachable from Docker host; polling helps file watch on Windows mounts.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
})
