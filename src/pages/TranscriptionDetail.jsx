import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTranscription } from '../data/transcriptions.js'
import DownloadButton from '../components/DownloadButton.jsx'
import { formatDateTime } from '../format.js'

export default function TranscriptionDetail() {
  const { id } = useParams()
  const [t, setT] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTranscription(id)
      .then(setT)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="muted">Carregando…</p>
  if (error) return <p className="error">{error}</p>
  if (!t) return null

  return (
    <div>
      <h2>Transcrição</h2>
      <div className="toolbar">
        <DownloadButton filename={`transcricao_${t.id}.txt`} content={t.texto} label="Baixar .txt" />
        {t.reuniao_id && <Link to={`/occurrences/${t.reuniao_id}`}>Ocorrência</Link>}
      </div>
      <div className="detail">
        <dl>
          <dt>ID</dt><dd>{t.id}</dd>
          <dt>Tipo</dt><dd>{t.tipo || '—'}</dd>
          <dt>Ocorrência</dt><dd>{t.reuniao_id || '—'}</dd>
          <dt>Criada em</dt><dd>{formatDateTime(t.timestamp_criacao)}</dd>
        </dl>
      </div>
      <h3>Texto</h3>
      {t.texto ? <div className="text-block">{t.texto}</div> : <p className="muted">Sem conteúdo.</p>}
    </div>
  )
}
