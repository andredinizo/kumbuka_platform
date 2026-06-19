import { Link, useSearchParams } from 'react-router-dom'
import { listProfiles, listProfilesByRecurrence } from '../data/profiles.js'
import { useRefreshableQuery } from '../hooks/useRefreshableQuery.js'
import RefreshBar from '../components/RefreshBar.jsx'

export default function ProfileList() {
  const [params] = useSearchParams()
  const serieId = params.get('serie_id')

  const { data, stale, loading, error, lastUpdated, refresh } = useRefreshableQuery(
    () => (serieId ? listProfilesByRecurrence(serieId) : listProfiles()),
    { cacheKey: serieId ? `profiles:serie=${serieId}` : 'profiles', deps: [serieId] }
  )
  const rows = data || []
  const newHref = serieId ? `/profiles/new?serie_id=${serieId}` : '/profiles/new'

  return (
    <div>
      <h2>Perfis de sumarização{serieId ? ' (filtrados por recorrência)' : ''}</h2>
      <RefreshBar lastUpdated={lastUpdated} loading={loading} stale={stale} onRefresh={refresh} />
      <p>
        <Link className="btn" to={newHref}>+ Novo perfil</Link>
      </p>
      {error && <p className="error">{error}</p>}
      {loading && rows.length === 0 && <p className="muted">Carregando…</p>}
      {!loading && !error && rows.length === 0 && <p className="muted">Nenhum perfil.</p>}
      {rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Versão</th>
              <th>Ativo</th>
              <th>Recorrência</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>{p.versao}</td>
                <td>{p.perfil_ativo ? 'Sim' : 'Não'}</td>
                <td>{p.serie_id}</td>
                <td><Link to={`/profiles/${p.id}`}>Abrir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
