import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getIrasasById, getCommentsForIrasas, createComment } from '../assets/api.jsx'

export default function IrasasDetails() {
  const { id } = useParams()
  const [irasas, setIrasas] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)

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
