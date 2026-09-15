/**
 * Client app: marketing + login (Phase 9). Dashboard is Phase 10.
 * Tokens stay on this origin only.
 */
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { HomePage } from './pages/Home'
import './App.css'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="container py-5">
      <h1 className="h2">{title}</h1>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/facilities" element={<Placeholder title="Facilities" />} />
        <Route path="/instruments" element={<Placeholder title="Instruments" />} />
        <Route path="/how-it-works" element={<Placeholder title="How it works" />} />
        <Route path="/documentation" element={<Placeholder title="Documentation" />} />
        <Route path="/login" element={<Placeholder title="Log in" />} />
        <Route path="/register" element={<Placeholder title="Register" />} />
      </Route>
    </Routes>
  )
}

export default App
