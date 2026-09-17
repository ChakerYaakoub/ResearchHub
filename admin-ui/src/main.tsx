/**
 * App bootstrap: BrowserRouter, AuthProvider, Bootstrap + toast CSS.
 * Admin session keys differ from client-ui (`rh_admin_*` vs `rh_*`).
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './auth'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          theme="colored"
          newestOnTop
          closeOnClick
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
