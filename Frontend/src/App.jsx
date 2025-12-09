import './App.css'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import IrasasDetails from './pages/IrasasDetails.jsx'
import IrasasEdit from './pages/IrasasEdit.jsx'
import IrasasCreate from './pages/IrasasCreate.jsx'
import Archived from './pages/Archived.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import { getCurrentUser, logout } from './assets/api.jsx'

function App() {
  const [user, setUser] = useState(() => getCurrentUser())
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onAuthChange = () => setUser(getCurrentUser())
    window.addEventListener('authChange', onAuthChange)
    return () => window.removeEventListener('authChange', onAuthChange)
  }, [])

  return (
    <div className="app">
      <div className="container">
      <nav className="nav" aria-label="Primary">
        <Link to="/" className="brand">Sutarčių Kontrolė</Link>
        <div className="spacer" />
        <button className="nav-toggle" aria-controls="main-nav" aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Uždaryti meniu' : 'Atidaryti meniu'} onClick={() => setMobileOpen(v => !v)}>
          {/* hamburger / close icons */}
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div id="main-nav" className={`nav-links ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
        {user ? (
          <>
            <span style={{ color: 'var(--muted)', paddingRight: 8 }}>Prisijungęs: {user?.email || user?.name || user?.El_pastas || 'Naudotojas'}</span>
            {((String(user?.admin ?? user?.Admin ?? user?.Adminas ?? '')).toLowerCase() === 'true') && (
              <Link to="/admin" style={{ marginLeft: 12 }}>Valdymas</Link>
            )}
            <button className="btn" onClick={logout} style={{ marginLeft: 8 }}>Atsijungti</button>
          </>
        ) : (
          <>
            <Link to="/login">Prisijungti</Link>
            <Link to="/register" style={{ marginLeft: 12 }}>Registruotis</Link>
          </>
        )}
        </div>
      </nav>
      </div>
      <main style={{ padding: 20 }}>
        <div className="container">
          <Routes>
            <Route path="/" element={user ? <Home /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
            <Route path="/irasas/:id" element={user ? <IrasasDetails /> : <Navigate to="/login" replace />} />
            <Route path="/irasas/:id/edit" element={user ? <IrasasEdit /> : <Navigate to="/login" replace />} />
            <Route path="/irasas/new" element={user ? <IrasasCreate /> : <Navigate to="/login" replace />} />
            <Route path="/archived" element={user ? <Archived /> : <Navigate to="/login" replace />} />
            <Route path="/admin" element={user ? <AdminPanel /> : <Navigate to="/login" replace />} />
          </Routes>
        </div>
      </main>
      <footer className="site-footer">
        <div className="container">
          <div>© 2025 Sutarčių Kontrolė</div>
          <div>
            <a href="#">Privatumas</a>
            <span style={{ margin: '0 8px' }}>·</span>
            <a href="#">Sąlygos</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

