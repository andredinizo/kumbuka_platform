import { Link, useSearchParams } from 'react-router-dom'
import { listSummarizations } from '../data/summarizations.js'
import RefreshBar from '../components/RefreshBar.jsx'
import { useRefreshableQuery } from '../hooks/useRefreshableQuery.js'
import { formatDateTime } from '../format.js'

export default function SummarizationList() {
  const [params] = useSearchParams()
  const reuniaoId = params.get('reuniao_id')

  const { data, stale, loading, error, lastUpdated, refresh } = useRefreshableQuery(
    () => listSummarizations(reuniaoId ? { reuniao_id: reuniaoId } : {}),
    { cacheKey: reuniaoId ? `summarizations:reuniao=${reuniaoId}` : 'summarizations', deps: [reuniaoId] }
  )
  const rows = data || []

  return (
    <div>
      <h2>Sumarizações{reuniaoId ? ' (de uma ocorrência)' : ''}</h2>
      <RefreshBar lastUpdated={lastUpdated} loading={loading} stale={stale} onRefresh={refresh} />
      {error && <p className="error">{error}</p>}
      {loading && rows.length === 0 && <p className="muted">Carregando…</p>}
      {!loading && !error && rows.length === 0 && <p className="muted">Nenhuma sumarização.</p>}
      {rows.length > 0 && (
        <table>
          <thead>
            <tr><th>Perfil</th><th>Ocorrência</th><th>Status</th><th>Criada em</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>{s.perfil_id}</td>
                <td>{s.reuniao_id}</td>
                <td>{s.status}</td>
                <td>{formatDateTime(s.timestamp_criacao)}</td>
                <td><Link to={`/summarizations/${s.id}`}>Abrir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
