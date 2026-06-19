import { Link, useSearchParams } from 'react-router-dom'
import { listOccurrences } from '../data/occurrences.js'
import StatusBadge from '../components/StatusBadge.jsx'
import RefreshBar from '../components/RefreshBar.jsx'
import { useRefreshableQuery } from '../hooks/useRefreshableQuery.js'
import { formatDateTime } from '../format.js'

export default function OccurrenceList() {
  const [params] = useSearchParams()
  const serieId = params.get('serie_id')

  const { data, stale, loading, error, lastUpdated, refresh } = useRefreshableQuery(
    () => listOccurrences(serieId ? { serie_id: serieId } : {}),
    { cacheKey: serieId ? `occurrences:serie=${serieId}` : 'occurrences', deps: [serieId] }
  )
  const rows = data || []

  return (
    <div>
      <h2>Ocorrências de reunião{serieId ? ' (de uma recorrência)' : ''}</h2>
      <RefreshBar lastUpdated={lastUpdated} loading={loading} stale={stale} onRefresh={refresh} />
      {error && <p className="error">{error}</p>}
      {loading && rows.length === 0 && <p className="muted">Carregando…</p>}
      {!loading && !error && rows.length === 0 && <p className="muted">Nenhuma ocorrência.</p>}
      {rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Início</th>
              <th>Recorrência</th>
              <th>Whisper</th>
              <th>VTT</th>
              <th>Enriquec.</th>
              <th>Sumariz.</th>
              <th>Entrega</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td>{formatDateTime(o.timestamp_inicio)}</td>
                <td>{o.serie_id}</td>
                <td><StatusBadge value={o.status_transcricao_whisper} /></td>
                <td><StatusBadge value={o.status_vtt} /></td>
                <td><StatusBadge value={o.status_enriquecimento} /></td>
                <td><StatusBadge value={o.status_sumarizacao} /></td>
                <td><StatusBadge value={o.status_entrega} /></td>
                <td><Link to={`/occurrences/${o.id}`}>Abrir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
