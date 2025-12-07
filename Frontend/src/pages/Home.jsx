import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNaudotojai, getNaudotojasIrasai, getCurrentUser, getIrasaiAll, getTags } from '../assets/api.jsx'

export default function Home() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const current = getCurrentUser()
        const isAdmin = String(current?.admin ?? current?.Admin ?? '').toLowerCase() === 'true'

        // Fetch tags for grouping
        const tags = await getTags()
        const tagMap = new Map((tags || []).map(t => [t.id ?? t.Id, t]))

        let irasaiList = []
        if (!isAdmin) {
          // only fetch current user's records (returns array of association objects or irasai)
          const id = current?.sub ?? current?.Sub ?? current?.id ?? current?.Id
          if (!id) throw new Error('Neatitinkanti prisijungusio naudotojo informacija')
          const resp = await getNaudotojasIrasai(id, false)
          // backend may return array of Irasas or IrasasNaudotojas; normalize to array of Irasas
          irasaiList = (resp || []).map(item => item?.Irasas ?? item)
        } else {
          // admin: fetch all irasai
          const resp = await getIrasaiAll()
          irasaiList = resp || []
        }

        // group irasai by TagID
        const groups = {}
        for (const ir of irasaiList) {
          const tagId = ir?.TagID ?? ir?.tagID ?? ir?.Tag?.Id ?? ir?.Tag?.id ?? 0
          const key = tagId ?? 0
          if (!groups[key]) groups[key] = []
          groups[key].push(ir)
        }

        // build data model: array of { tag, irasai }
        const grouped = Object.entries(groups).map(([k, list]) => {
          const tag = tagMap.get(Number(k)) || { Id: Number(k), Name: k === '0' ? 'Nėra žymos' : `Žyma ${k}` }
          return { tag, irasai: list }
        })
        // sort groups by tag name
        grouped.sort((a, b) => (a.tag?.Name || a.tag?.name || '').localeCompare(b.tag?.Name || b.tag?.name || ''))
        setUsers(grouped)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Klaida užkraunant duomenis')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) return (
    <div className="centered">
      <div className="card auth-card">
        <h2>Užkraunama...</h2>
      </div>
    </div>
  )

  if (error) return (
    <div className="centered">
      <div className="card auth-card">
        <h2>Klaida</h2>
        <p className="error">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="container">
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Įrašai</h1>
          <div style={{ color: 'var(--muted)' }}>Rūšiuota pagal žymas</div>
        </div>
        <div>
          <Link to="/irasas/new" className="btn">Naujas įrašas</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {users.map((group) => (
          <div key={group.tag?.Id ?? group.tag?.id ?? (group.tag?.Name || group.tag?.name)} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{group.tag?.Name ?? group.tag?.name ?? 'Nėra žymos'}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{group.tag?.Description ?? ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>Įrašų: {group.irasai?.length ?? 0}</div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              {group.irasai && group.irasai.length > 0 ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {group.irasai.map((ir) => (
                    <div key={ir.id ?? ir.Id} style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{ir.pavadinimas ?? ir.Pavadinimas ?? ir.Pavadinimas ?? ir.Id_dokumento}</div>
                        <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>Galioja: {ir.Isigaliojimo_data ?? ir.Isigaliojimo_data}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ color: 'var(--muted)', fontSize: 13 }}>{ir.Archyvuotas ? 'Archiav.' : 'Aktyvus'}</div>
                        <Link className="btn" to={`/irasas/${ir.Id ?? ir.id}`} style={{ textDecoration: 'none' }}>Atidaryti</Link>
                        <Link className="btn" to={`/irasas/${ir.Id ?? ir.id}/edit`} style={{ textDecoration: 'none', background: '#4caf50' }}>Redaguoti</Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="note" style={{ marginTop: 8 }}>Nėra įrašų</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
