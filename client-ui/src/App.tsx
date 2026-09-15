/**
 * Client app scaffold: marketing + login (Phase 9) and researcher dashboard (10–11).
 * Tokens stay on this origin only. Admin uses admin-ui separately.
 */
import { Route, Routes } from 'react-router-dom'
import './App.css'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

function HomePage() {
  return (
    <main className="container py-5">
      <h1 className="display-5">ResearchHub</h1>
      <p className="lead text-secondary">
        Client app — public pages, login, and researcher dashboard
      </p>
      <p className="text-muted small mb-0">
        Client UI · API base: {apiBaseUrl || '(not set)'}
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
