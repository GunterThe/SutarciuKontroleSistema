import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getTags, createTag, updateTag, deleteTag,
  getAllComments, updateComment, deleteComment,
  getIrasaiAll, deleteIrasas,
  getNaudotojai, createNaudotojas, updateNaudotojas, deleteNaudotojas
} from '../assets/api.jsx'

function SimpleList({ title, items, renderItem }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {items && items.length > 0 ? items.map(renderItem) : <div className="note">Nėra</div>}
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const [tags, setTags] = useState([])
  const [comments, setComments] = useState([])
  const [irasai, setIrasai] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTagName, setNewTagName] = useState('')

  const loadAll = async () => {
    setLoading(true)
    try {
      const [t, c, i, u] = await Promise.all([
        getTags(),
        getAllComments(),
        getIrasaiAll(),
        getNaudotojai()
      ])
      setTags(t || [])
      setComments(c || [])
      setIrasai(i || [])
      setUsers(u || [])
    } catch (err) {
      console.error(err)
      alert('Klaida užkraunant admin duomenis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      await createTag({ Name: newTagName.trim() })
      setNewTagName('')
      await loadAll()
    } catch (err) { alert('Klaida kuriant žymą') }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin valdymo skydas</h1>
        <div>
          <Link to="/" className="btn">Grįžti</Link>
        </div>
      </div>

      {loading ? <div className="card"><h3>Užkraunama...</h3></div> : (
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <div className="card">
            <h3>Žymos</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="Naujos žymos pavadinimas" />
              <button className="btn" onClick={handleCreateTag}>Sukurti</button>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {tags.map(t => (
                <div key={t.Id ?? t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>{t.Name ?? t.name}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link className="btn" to={`/tag/${t.Id ?? t.id}`} >Atidaryti</Link>
                    <button className="btn" onClick={async () => { if (confirm('Trinti žymą?')) { await deleteTag(t.Id ?? t.id); await loadAll() } }}>Ištrinti</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SimpleList title="Komentarai" items={comments} renderItem={(c) => (
            <div key={c.Id ?? c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ maxWidth: '70%' }}>{c.CommentText ?? c.commentText}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link className="btn" to={`/irasas/${c.IrasasId ?? c.irasasId}`}>Atidaryti įrašą</Link>
                <button className="btn" onClick={async () => { if (confirm('Trinti komentarą?')) { await deleteComment(c.Id ?? c.id); await loadAll() } }}>Ištrinti</button>
              </div>
            </div>
          )} />

          <SimpleList title="Įrašai" items={irasai} renderItem={(ir) => (
            <div key={ir.Id ?? ir.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>{ir.Pavadinimas ?? ir.pavadinimas}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link className="btn" to={`/irasas/${ir.Id ?? ir.id}`}>Atidaryti</Link>
                <Link className="btn" to={`/irasas/${ir.Id ?? ir.id}/edit`}>Redaguoti</Link>
                <button className="btn" onClick={async () => { if (confirm('Trinti įrašą?')) { await deleteIrasas(ir.Id ?? ir.id); await loadAll() } }}>Ištrinti</button>
              </div>
            </div>
          )} />

          <SimpleList title="Naudotojai" items={users} renderItem={(u) => (
            <div key={u.Id ?? u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>{u.Vardas ?? u.vardas} {u.Pavarde ?? u.pavarde} ({u.El_pastas ?? u.el_pastas})</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={async () => { if (confirm('Trinti naudotoją?')) { await deleteNaudotojas(u.Id ?? u.id); await loadAll() } }}>Ištrinti</button>
              </div>
            </div>
          )} />
        </div>
      )}
    </div>
  )
}
