import { Link } from 'react-router-dom'
import { listRecurrences } from '../data/recurrences.js'
import { listProfiles } from '../data/profiles.js'
import { listOccurrences } from '../data/occurrences.js'
import { listTranscriptions } from '../data/transcriptions.js'
import { listSummarizations } from '../data/summarizations.js'
import StatusBadge from '../components/StatusBadge.jsx'
import RefreshBar from '../components/RefreshBar.jsx'
import { useRefreshableQuery } from '../hooks/useRefreshableQuery.js'
import { formatDateTime } from '../format.js'

const STATUS_FIELDS = [
  ['Whisper', 'status_transcricao_whisper'],
  ['VTT', 'status_vtt'],
  ['Enriquec.', 'status_enriquecimento'],
  ['Sumariz.', 'status_sumarizacao'],
  ['Entrega', 'status_entrega'],
]

// Cada lista e independente: usa allSettled para exibir o que carregou mesmo se uma falhar.
async function loadDashboard() {
  const results = await Promise.allSettled([
    listRecurrences(),
    listProfiles(),
    listOccurrences(),
    listTranscriptions(),
    listSummarizations(),
  ])
  const [rec, prof, occ, tr, sum] = results
  const val = (r) => (r.status === 'fulfilled' ? r.value : [])
  return {
    counts: {
      recurrences: val(rec).length,
      profiles: val(prof).length,
      occurrences: val(occ).length,
      transcriptions: val(tr).length,
      summarizations: val(sum).length,
    },
    failed: val(occ).filter((o) => STATUS_FIELDS.some(([, k]) => o[k] === 'falhou')),
    errors: results.filter((r) => r.status === 'rejected').map((r) => r.reason.message),
  }
}

const CARDS = [
  { label: 'Recorrências', key: 'recurrences', to: '/recurrences' },
  { label: 'Perfis', key: 'profiles', to: '/profiles' },
  { label: 'Ocorrências', key: 'occurrences', to: '/occurrences' },
  { label: 'Transcrições', key: 'transcriptions', to: '/transcriptions' },
  { label: 'Sumarizações', key: 'summarizations', to: '/summarizations' },
]

export default function Dashboard() {
  const { data, stale, loading, error, lastUpdated, refresh } = useRefreshableQuery(loadDashboard, {
    cacheKey: 'dashboard',
  })
  const counts = data?.counts ?? {}
  const failed = data?.failed ?? []
  const errors = data?.errors ?? []

  return (
    <div>
      <h2>Dashboard</h2>
      <RefreshBar lastUpdated={lastUpdated} loading={loading} stale={stale} onRefresh={refresh} />
      {error && <p className="error">{error}</p>}
      {errors.map((e, i) => (
        <p className="error" key={i}>{e}</p>
      ))}
      {loading && !data && <p className="muted">Carregando…</p>}

      {data && (
        <>
          <div className="cards">
            {CARDS.map((c) => (
              <Link className="card" to={c.to} key={c.key}>
                <span className="card-num">{counts[c.key] ?? 0}</span>
                <span className="card-label">{c.label}</span>
              </Link>
            ))}
          </div>

          <h3>Ocorrências com falha</h3>
          {failed.length === 0 ? (
            <p className="muted">Nenhuma falha. 🎉</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Início</th>
                  <th>Recorrência</th>
                  {STATUS_FIELDS.map(([label]) => <th key={label}>{label}</th>)}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {failed.map((o) => (
                  <tr key={o.id}>
                    <td>{formatDateTime(o.timestamp_inicio)}</td>
                    <td>{o.serie_id}</td>
                    {STATUS_FIELDS.map(([label, k]) => (
                      <td key={k}><StatusBadge value={o[k]} /></td>
                    ))}
                    <td><Link to={`/occurrences/${o.id}`}>Abrir</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}
