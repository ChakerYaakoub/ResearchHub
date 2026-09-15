import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Dev server reachable from Docker host; port from CLIENT_UI_PORT (.env / Compose).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.CLIENT_UI_PORT || process.env.CLIENT_UI_PORT || 5173)

  return {
    plugins: [react()],
    server: {
      host: true,
      port,
      watch: {
        usePolling: true,
      },
    },
  }
})
