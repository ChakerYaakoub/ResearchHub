/**
 * Top-level routes. Domain pages land in later phases.
 * VITE_API_BASE_URL is public API origin from Compose/env.
 */
import { Route, Routes } from 'react-router-dom'
import './App.css'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

function HomePage() {
  return (
    <main className="container py-5">
      <h1 className="display-5">ResearchHub</h1>
      <p className="lead text-secondary">
        Simplified Scientific Proposal &amp; Experiment Management
      </p>
      <p className="text-muted small mb-0">
        API base: {apiBaseUrl || '(not set)'}
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
