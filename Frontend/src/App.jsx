import './App.css'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import IrasasDetails from './pages/IrasasDetails.jsx'
import IrasasEdit from './pages/IrasasEdit.jsx'
import IrasasCreate from './pages/IrasasCreate.jsx'
import { getCurrentUser, logout } from './assets/api.jsx'

function App() {
  const [user, setUser] = useState(() => getCurrentUser())

  useEffect(() => {
    const onAuthChange = () => setUser(getCurrentUser())
    window.addEventListener('authChange', onAuthChange)
    return () => window.removeEventListener('authChange', onAuthChange)
  }, [])

  return (
    <div className="app">
      <div className="container">
      <nav className="nav">
        <Link to="/" className="brand">Sutarčių Kontrolė</Link>
        <div className="spacer" />
        {user ? (
          <>
            <span>Prisijungęs: {user?.email || user?.name || user?.El_pastas || 'Naudotojas'}</span>
            <button onClick={logout}>Atsijungti</button>
          </>
        ) : (
          <>
            <Link to="/login">Prisijungti</Link>
            <Link to="/register" style={{ marginLeft: 12 }}>Registruotis</Link>
          </>
        )}
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
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App

// Home is now provided by `src/pages/Home.jsx`
