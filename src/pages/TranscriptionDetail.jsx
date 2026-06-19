import { Link, useParams } from 'react-router-dom'
import { getTranscription } from '../data/transcriptions.js'
import DownloadButton from '../components/DownloadButton.jsx'
import RefreshBar from '../components/RefreshBar.jsx'
import { useRefreshableQuery } from '../hooks/useRefreshableQuery.js'
import { formatDateTime } from '../format.js'

export default function TranscriptionDetail() {
  const { id } = useParams()
  const { data: t, loading, error, lastUpdated, refresh } = useRefreshableQuery(
    () => getTranscription(id),
    { deps: [id] }
  )

  if (loading && !t) return <p className="muted">Carregando…</p>
  if (error && !t) return <p className="error">{error}</p>
  if (!t) return null

  return (
    <div>
      <h2>Transcrição</h2>
      <RefreshBar lastUpdated={lastUpdated} loading={loading} onRefresh={refresh} />
      {error && <p className="error">{error}</p>}
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
