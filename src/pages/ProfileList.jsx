import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listProfiles, listProfilesByRecurrence } from '../data/profiles.js'

export default function ProfileList() {
  const [params] = useSearchParams()
  const serieId = params.get('serie_id')
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = serieId ? listProfilesByRecurrence(serieId) : listProfiles()
    setLoading(true)
    load
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [serieId])

  const newHref = serieId ? `/profiles/new?serie_id=${serieId}` : '/profiles/new'

  return (
    <div>
      <h2>Perfis de sumarização{serieId ? ' (filtrados por recorrência)' : ''}</h2>
      <p>
        <Link className="btn" to={newHref}>+ Novo perfil</Link>
      </p>
      {loading && <p className="muted">Carregando…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="muted">Nenhum perfil.</p>}
      {!loading && !error && rows.length > 0 && (
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
