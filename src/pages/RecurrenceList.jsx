import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRecurrences } from '../data/recurrences.js'

// Prova o fluxo ponta-a-ponta da fundacao: pagina -> data/* -> proxy /sql -> Databricks (recorrencias_reuniao).
export default function RecurrenceList() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listRecurrences()
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2>Recorrências de reunião</h2>
      <p>
        <Link className="btn" to="/recurrences/new">+ Nova recorrência</Link>
      </p>
      {loading && <p className="muted">Carregando…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="muted">Nenhuma recorrência cadastrada.</p>
      )}
      {!loading && !error && rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ativa</th>
              <th>Descrição</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.nome}</td>
                <td>{r.recorrencia_ativa ? 'Sim' : 'Não'}</td>
                <td>{r.descricao}</td>
                <td><Link to={`/recurrences/${r.id}`}>Abrir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
