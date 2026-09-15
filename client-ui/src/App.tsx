/**
 * Client app: marketing + login (Phase 9). Dashboard is Phase 10.
 * Tokens stay on this origin only.
 */
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth'
import { AppLayout } from './components/AppLayout'
import { DocumentationPage } from './pages/Documentation'
import { FacilitiesPage } from './pages/Facilities'
import { HomePage } from './pages/Home'
import { HowItWorksPage } from './pages/HowItWorks'
import { InstrumentsPage } from './pages/Instruments'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/instruments" element={<InstrumentsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
