import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listSummarizations } from '../data/summarizations.js'
import { formatDateTime } from '../format.js'

export default function SummarizationList() {
  const [params] = useSearchParams()
  const reuniaoId = params.get('reuniao_id')
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listSummarizations(reuniaoId ? { reuniao_id: reuniaoId } : {})
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [reuniaoId])

  return (
    <div>
      <h2>Sumarizações{reuniaoId ? ' (de uma ocorrência)' : ''}</h2>
      {loading && <p className="muted">Carregando…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="muted">Nenhuma sumarização.</p>}
      {!loading && !error && rows.length > 0 && (
        <table>
          <thead>
            <tr><th>Perfil</th><th>Ocorrência</th><th>Status</th><th>Criada em</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>{s.perfil_id}</td>
                <td>{s.reuniao_id}</td>
                <td>{s.status}</td>
                <td>{formatDateTime(s.timestamp_criacao)}</td>
                <td><Link to={`/summarizations/${s.id}`}>Abrir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
