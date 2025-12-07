import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getTags, createIrasas } from '../assets/api.jsx'

export default function IrasasCreate() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    Id_dokumento: '',
    Pavadinimas: '',
    Isigaliojimo_data: '',
    Pabaigos_data: '',
    Dienos_pries: 0,
    Dienu_daznumas: 0,
    Archyvuotas: false,
    Kita_data: null,
    Pastas_kreiptis: '',
    TagID: null
  })
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const t = await getTags()
        if (!mounted) return
        setTags(t || [])
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Klaida užkraunant žymas')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleCreate = async () => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        Id_dokumento: form.Id_dokumento,
        Pavadinimas: form.Pavadinimas,
        Isigaliojimo_data: form.Isigaliojimo_data,
        Pabaigos_data: form.Pabaigos_data,
        Dienos_pries: Number(form.Dienos_pries) || 0,
        Dienu_daznumas: Number(form.Dienu_daznumas) || 0,
        Archyvuotas: !!form.Archyvuotas,
        Kita_data: form.Kita_data || null,
        Pastas_kreiptis: form.Pastas_kreiptis,
        TagID: form.TagID ? Number(form.TagID) : 0,
        Naudotojai: [],
        Comments: []
      }
      const created = await createIrasas(payload)
      // created likely contains the new Id
      const newId = created?.Id ?? created?.id
      if (newId) nav(`/irasas/${newId}`)
      else nav('/')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Klaida kuriant įrašą')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="centered"><div className="card auth-card"><h2>Užkraunama...</h2></div></div>
  )

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Naujas įrašas</h1>
        <div>
          <Link to="/" className="btn">Atšaukti</Link>
        </div>
      </div>

      <div style={{ marginTop: 12 }} className="card">
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label>Id dokumento</label>
            <input value={form.Id_dokumento} onChange={(e) => updateField('Id_dokumento', e.target.value)} />
          </div>
          <div>
            <label>Pavadinimas</label>
            <input value={form.Pavadinimas} onChange={(e) => updateField('Pavadinimas', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Isigaliojimo data</label>
              <input type="date" value={form.Isigaliojimo_data?.slice?.(0,10) ?? form.Isigaliojimo_data} onChange={(e) => updateField('Isigaliojimo_data', e.target.value)} />
            </div>
            <div>
              <label>Pabaigos data</label>
              <input type="date" value={form.Pabaigos_data?.slice?.(0,10) ?? form.Pabaigos_data} onChange={(e) => updateField('Pabaigos_data', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Dienos prieš</label>
              <input type="number" value={form.Dienos_pries} onChange={(e) => updateField('Dienos_pries', e.target.value)} />
            </div>
            <div>
              <label>Dienų dažnumas</label>
              <input type="number" value={form.Dienu_daznumas} onChange={(e) => updateField('Dienu_daznumas', e.target.value)} />
            </div>
          </div>
          <div>
            <label>Pašto kreiptis</label>
            <input value={form.Pastas_kreiptis} onChange={(e) => updateField('Pastas_kreiptis', e.target.value)} />
          </div>
          <div>
            <label>Žyma</label>
            <select value={form.TagID ?? ''} onChange={(e) => updateField('TagID', e.target.value || null)}>
              <option value="">Pasirinkti žymą</option>
              {tags.map(t => <option key={t.Id ?? t.id} value={t.Id ?? t.id}>{t.Name ?? t.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={handleCreate} disabled={saving}>{saving ? 'Kuriama...' : 'Sukurti'}</button>
            <Link to="/" className="btn" style={{ background: '#666' }}>Atšaukti</Link>
          </div>
          {error && <div className="error">{error}</div>}
        </div>
      </div>
    </div>
  )
}
