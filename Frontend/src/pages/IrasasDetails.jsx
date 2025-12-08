import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getIrasasById, getCommentsForIrasas, createComment, getNaudotojai, createIrasasNaudotojas, getIrasasViewers } from '../assets/api.jsx'

export default function IrasasDetails() {
  const { id } = useParams()
  const [irasas, setIrasas] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userQuery, setUserQuery] = useState('')
  const [existingViewerIds, setExistingViewerIds] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [sharing, setSharing] = useState(false)
  const [shareError, setShareError] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const d = await getIrasasById(id)
        if (!mounted) return
        setIrasas(d)
        const c = await getCommentsForIrasas(id)
        if (!mounted) return
        setComments(c || [])
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Klaida užkraunant įrašą')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

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
        <div style={{ marginTop: 12 }}><Link to="/">Grįžti</Link></div>
      </div>
    </div>
  )

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>{irasas?.Pavadinimas ?? irasas?.pavadinimas}</h1>
          <div style={{ color: 'var(--muted)' }}>{irasas?.Id_dokumento ?? ''}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/" className="btn">Grįžti</Link>
          <button className="btn" onClick={async () => {
            setShowShare(true)
            setShareError('')
            setExistingViewerIds([])
            setUsers([])
            setUserQuery('')
            setSelectedUsers([])
            setUsersLoading(true)
            try {
              // fetch users and existing viewers in parallel
              const [u, v] = await Promise.all([
                getNaudotojai(),
                getIrasasViewers(Number(id)).catch(e => [])
              ])
              setUsers(u || [])
              const vids = (v || []).map(x => x.Id ?? x.id).filter(Boolean)
              setExistingViewerIds(vids)
            } catch (err) {
              setShareError(err.response?.data?.message || err.message || 'Klaida užkraunant vartotojus')
            } finally {
              setUsersLoading(false)
            }
          }}>Pridėti peržiūros vartotojus</button>
          <Link to={`/irasas/${id}/edit`} className="btn" style={{ background: '#4caf50' }}>Redaguoti</Link>
        </div>
      </div>

      <div style={{ marginTop: 16 }} className="card">
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>Galiojimo pradžia:</strong> {irasas?.isigaliojimo_data}</div>
          <div><strong>Galiojimo pabaiga:</strong> {irasas?.pabaigos_data}</div>
          <div><strong>Pašto kreiptis:</strong> {irasas?.pastas_kreiptis}</div>
          <div><strong>Ar archyvuotas:</strong> {irasas?.archyvuotas ? 'Taip' : 'Ne'}</div>
        </div>
      </div>

      {showShare && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 30 }}>
          <div style={{ width: 720, maxWidth: '95%', background: 'var(--surface, #000000ff)', padding: 16, borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.3)' }}>
            <h3>Pridėti peržiūros vartotojus</h3>
            {shareError && <div className="error">{shareError}</div>}
            {usersLoading ? (
              <div>Užkraunama vartotojai...</div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <input
                  placeholder="Ieškoti vartotojo pagal vardą, pavardę arba el. paštą"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}
                />
                <div style={{ maxHeight: 300, overflow: 'auto', marginTop: 8 }}>
                  {users.filter(u => {
                    const uid = u.Id ?? u.id
                    if (existingViewerIds.includes(uid)) return false
                    if (!userQuery) return true
                    const q = userQuery.toLowerCase()
                    const name = `${u.Vardas ?? u.vardas ?? ''} ${u.Pavarde ?? u.pavarde ?? ''}`.toLowerCase()
                    const email = (u.El_pastas ?? u.el_pastas ?? '').toLowerCase()
                    return name.includes(q) || email.includes(q)
                  }).map(u => {
                    const uid = u.Id ?? u.id
                    const name = `${u.Vardas ?? u.vardas ?? ''} ${u.Pavarde ?? u.pavarde ?? ''}`.trim() || (u.El_pastas ?? u.el_pastas)
                    const checked = selectedUsers.includes(uid)
                    return (
                      <label key={uid} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                        <input type="checkbox" checked={checked} onChange={() => {
                          setSelectedUsers(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid])
                        }} />
                        <span>{name} <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{u.El_pastas ?? u.el_pastas}</span></span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn" disabled={sharing || selectedUsers.length === 0} onClick={async () => {
                setSharing(true)
                setShareError('')
                try {
                  for (const uid of selectedUsers) {
                    try {
                      await createIrasasNaudotojas({ IrasasId: Number(id), NaudotojasId: uid })
                    } catch (err) {
                      console.warn('error adding viewer', uid, err)
                    }
                  }
                  setShowShare(false)
                  setSelectedUsers([])
                  setUserQuery('')
                } catch (err) {
                  setShareError(err.response?.data?.message || err.message || 'Klaida pridedant vartotojus')
                } finally {
                  setSharing(false)
                }
              }}>{sharing ? 'Pridedama...' : 'Pridėti pasirinkti'}</button>
              <button className="btn" style={{ background: '#666' }} onClick={() => { setShowShare(false); setShareError(''); setUserQuery('') }}>Uždaryti</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <h2>Komentarai ({comments.length})</h2>
        <div style={{ marginTop: 8, marginBottom: 12 }}>
          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Parašykite komentarą..."
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text)' }}
          />
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button className="btn" disabled={posting || !newComment.trim()} onClick={async () => {
              setPosting(true)
              setError('')
                try {
                const payload = { CommentText: newComment.trim(), IrasasId: Number(id) }
                await createComment(payload)
                // re-fetch comments so we get author names
                const refreshed = await getCommentsForIrasas(id)
                setComments(refreshed || [])
                setNewComment('')
              } catch (err) {
                setError(err.response?.data?.message || err.message || 'Klaida siunčiant komentarą')
              } finally {
                setPosting(false)
              }
            }}>{posting ? 'Siunčiama...' : 'Siųsti komentarą'}</button>
            <button className="btn" style={{ background: '#666' }} onClick={() => setNewComment('')}>Atšaukti</button>
          </div>
          {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}
        </div>
        {comments.length === 0 ? (
          <div className="note">Nėra komentarų</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {comments.map(c => (
              <div key={c.Id ?? c.id} className="card">
                <div style={{ fontWeight: 700 }}>{(c.authorVardas || c.authorPavarde) ? `${c.authorVardas ?? ''} ${c.authorPavarde ?? ''}`.trim() : (c.naudotojasId ?? c.naudotojasId)}</div>
                <div style={{ color: 'var(--muted)', marginTop: 6 }}>{c.commentText ?? c.commentText}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
