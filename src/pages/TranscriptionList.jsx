import { Link, useSearchParams } from 'react-router-dom'
import { listTranscriptions } from '../data/transcriptions.js'
import RefreshBar from '../components/RefreshBar.jsx'
import { useRefreshableQuery } from '../hooks/useRefreshableQuery.js'
import { formatDateTime } from '../format.js'

export default function TranscriptionList() {
  const [params] = useSearchParams()
  const reuniaoId = params.get('reuniao_id')

  const { data, stale, loading, error, lastUpdated, refresh } = useRefreshableQuery(
    () => listTranscriptions(reuniaoId ? { reuniao_id: reuniaoId } : {}),
    { cacheKey: reuniaoId ? `transcriptions:reuniao=${reuniaoId}` : 'transcriptions', deps: [reuniaoId] }
  )
  const rows = data || []

  return (
    <div>
      <h2>Transcrições{reuniaoId ? ' (de uma ocorrência)' : ''}</h2>
      <RefreshBar lastUpdated={lastUpdated} loading={loading} stale={stale} onRefresh={refresh} />
      {error && <p className="error">{error}</p>}
      {loading && rows.length === 0 && <p className="muted">Carregando…</p>}
      {!loading && !error && rows.length === 0 && <p className="muted">Nenhuma transcrição.</p>}
      {rows.length > 0 && (
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
