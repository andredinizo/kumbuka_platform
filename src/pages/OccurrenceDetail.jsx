import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOccurrence } from '../data/occurrences.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatDateTime } from '../format.js'

const STATUS_FIELDS = [
  ['Transcrição Whisper', 'status_transcricao_whisper'],
  ['VTT', 'status_vtt'],
  ['Enriquecimento', 'status_enriquecimento'],
  ['Sumarização', 'status_sumarizacao'],
  ['Entrega', 'status_entrega'],
]

export default function OccurrenceDetail() {
  const { id } = useParams()
  const [o, setO] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOccurrence(id)
      .then(setO)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="muted">Carregando…</p>
  if (error) return <p className="error">{error}</p>
  if (!o) return null

  return (
    <div>
      <h2>Ocorrência</h2>
      <div className="toolbar">
        <Link className="btn" to={`/transcriptions?reuniao_id=${o.id}`}>Ver transcrições</Link>
        <Link className="btn" to={`/summarizations?reuniao_id=${o.id}`}>Ver sumarizações</Link>
        {o.serie_id && <Link to={`/recurrences/${o.serie_id}`}>Recorrência</Link>}
      </div>
      <div className="detail">
        <dl>
          <dt>ID</dt><dd>{o.id}</dd>
          <dt>Recorrência</dt><dd>{o.serie_id || '—'}</dd>
          <dt>Início</dt><dd>{formatDateTime(o.timestamp_inicio)}</dd>
          <dt>Fim</dt><dd>{formatDateTime(o.timestamp_fim)}</dd>
          <dt>Local da gravação</dt><dd>{o.local_gravacao || '—'}</dd>
          <dt>Criada em</dt><dd>{formatDateTime(o.timestamp_criacao)}</dd>
          <dt>Atualizada em</dt><dd>{formatDateTime(o.timestamp_atualizacao)}</dd>
        </dl>
        <h3>Status do pipeline</h3>
        <div className="status-grid">
          {STATUS_FIELDS.map(([label, key]) => (
            <div className="cell" key={key}>
              <span className="k">{label}</span>
              <StatusBadge value={o[key]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
