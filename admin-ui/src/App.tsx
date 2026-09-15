/**
 * Admin UI scaffold (Phase 12). Tokens stay on this origin only.
 * Admin API routes also require this Origin (ADMIN_UI_ORIGINS).
 */
import { Route, Routes } from 'react-router-dom'
import './App.css'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

function HomePage() {
  return (
    <main className="container py-5">
      <h1 className="display-5">ResearchHub Admin</h1>
      <p className="lead text-secondary">
        Platform admin dashboard (stats, proposal review)
      </p>
      <p className="text-muted small mb-0">
        Admin UI · API base: {apiBaseUrl || '(not set)'}
      </p>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  )
}

export default App
