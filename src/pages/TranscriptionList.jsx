import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listTranscriptions } from '../data/transcriptions.js'
import { formatDateTime } from '../format.js'

export default function TranscriptionList() {
  const [params] = useSearchParams()
  const reuniaoId = params.get('reuniao_id')
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listTranscriptions(reuniaoId ? { reuniao_id: reuniaoId } : {})
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [reuniaoId])

  return (
    <div>
      <h2>Transcrições{reuniaoId ? ' (de uma ocorrência)' : ''}</h2>
      {loading && <p className="muted">Carregando…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="muted">Nenhuma transcrição.</p>}
      {!loading && !error && rows.length > 0 && (
        <table>
          <thead>
            <tr><th>Tipo</th><th>Ocorrência</th><th>Criada em</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td>{t.tipo}</td>
                <td>{t.reuniao_id}</td>
                <td>{formatDateTime(t.timestamp_criacao)}</td>
                <td><Link to={`/transcriptions/${t.id}`}>Abrir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
