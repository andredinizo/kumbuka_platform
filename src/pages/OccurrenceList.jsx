import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listOccurrences } from '../data/occurrences.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatDateTime } from '../format.js'

export default function OccurrenceList() {
  const [params] = useSearchParams()
  const serieId = params.get('serie_id')
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listOccurrences(serieId ? { serie_id: serieId } : {})
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [serieId])

  return (
    <div>
      <h2>Ocorrências de reunião{serieId ? ' (de uma recorrência)' : ''}</h2>
      {loading && <p className="muted">Carregando…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="muted">Nenhuma ocorrência.</p>}
      {!loading && !error && rows.length > 0 && (
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
