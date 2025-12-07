import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../assets/api.jsx'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Neteisingi prisijungimo duomenys')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="centered">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-title">Prisijungti</div>
          <div className="auth-sub">Prisijunkite prie savo paskyros</div>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>El. paštas</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>

          <div>
            <label>Slaptažodis</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>

          <div>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Jungiamasi...' : 'Prisijungti'}
            </button>
          </div>
        </form>

        <div className="note" style={{ marginTop: 12 }}>
          Naujas naudotojas? <Link to="/register">Registruokitės</Link>
        </div>
      </div>
    </main>
  )
}
