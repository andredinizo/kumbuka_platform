import { Link, useParams } from 'react-router-dom'
import { getSummarization } from '../data/summarizations.js'
import DownloadButton from '../components/DownloadButton.jsx'
import RefreshBar from '../components/RefreshBar.jsx'
import { useRefreshableQuery } from '../hooks/useRefreshableQuery.js'
import { formatDateTime } from '../format.js'

export default function SummarizationDetail() {
  const { id } = useParams()
  const { data: s, loading, error, lastUpdated, refresh } = useRefreshableQuery(
    () => getSummarization(id),
    { deps: [id] }
  )

  if (loading && !s) return <p className="muted">Carregando…</p>
  if (error && !s) return <p className="error">{error}</p>
  if (!s) return null

  return (
    <div>
      <h2>Sumarização</h2>
      <RefreshBar lastUpdated={lastUpdated} loading={loading} onRefresh={refresh} />
      {error && <p className="error">{error}</p>}
      <div className="toolbar">
        <DownloadButton
          filename={`sumarizacao_${s.id}.html`}
          content={s.texto}
          mime="text/html"
          label="Baixar .html"
        />
        {s.reuniao_id && <Link to={`/occurrences/${s.reuniao_id}`}>Ocorrência</Link>}
        {s.transcricao_id && <Link to={`/transcriptions/${s.transcricao_id}`}>Transcrição usada</Link>}
        {s.perfil_id && <Link to={`/profiles/${s.perfil_id}`}>Perfil</Link>}
      </div>
      <div className="detail">
        <dl>
          <dt>ID</dt><dd>{s.id}</dd>
          <dt>Ocorrência</dt><dd>{s.reuniao_id || '—'}</dd>
          <dt>Perfil</dt><dd>{s.perfil_id || '—'}</dd>
          <dt>Status</dt><dd>{s.status || '—'}</dd>
          <dt>Criada em</dt><dd>{formatDateTime(s.timestamp_criacao)}</dd>
        </dl>
      </div>
      <h3>Conteúdo</h3>
      {/* Mostrado como texto puro (o conteudo costuma ser HTML; o download .html preserva a marcacao). */}
      {s.texto ? (
        <div className="text-block">{s.texto}</div>
      ) : (
        <p className="muted">Sem conteúdo.</p>
      )}
    </div>
  )
}
