import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../assets/api.jsx'

export default function Register() {
  const navigate = useNavigate()
  const [vardas, setVardas] = useState('')
  const [pavarde, setPavarde] = useState('')
  const [email, setEmail] = useState('')
  const [birthday, setBirthday] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      // Convert date input to ISO string acceptable by backend
      const gimimo_data = new Date(birthday).toISOString()
      await register(vardas, pavarde, gimimo_data, email, password)
      setSuccess('Registracija sėkminga. Galite prisijungti.')
      setTimeout(()=>navigate('/login'), 800)
    } catch (err) {
      setError(err.response?.data?.message || 'Registracija nepavyko')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="centered">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-title">Registracija</div>
          <div className="auth-sub">Sukurkite naują paskyrą</div>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Vardas</label>
            <input type="text" value={vardas} onChange={(e)=>setVardas(e.target.value)} required />
          </div>

          <div>
            <label>Pavardė</label>
            <input type="text" value={pavarde} onChange={(e)=>setPavarde(e.target.value)} required />
          </div>

          <div>
            <label>El. paštas</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>

          <div>
            <label>Gimimo data</label>
            <input type="date" value={birthday} onChange={(e)=>setBirthday(e.target.value)} required />
          </div>

          <div>
            <label>Slaptažodis</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>

          <div>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Kuriama...' : 'Registruotis'}
            </button>
          </div>
        </form>

        <div className="note" style={{ marginTop: 12 }}>
          Jau turite paskyrą? <Link to="/login">Prisijunkite</Link>
        </div>
      </div>
    </main>
  )
}
