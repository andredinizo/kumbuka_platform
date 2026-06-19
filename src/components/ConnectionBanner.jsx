import { useEffect, useState } from 'react'
import { getStatus, subscribeStatus, warmUp } from '../data/databricksClient.js'

// Banner global de conexao (ver 08-conexao-warehouse.md). Some quando 'ready'; explica a espera de
// cold start com contador quando 'warming'; oferece "Tentar de novo" em erro ou se passar do teto.
const CEILING_S = 90

export default function ConnectionBanner() {
  const [status, setStatus] = useState(getStatus())
  const [secs, setSecs] = useState(0)

  useEffect(() => subscribeStatus(setStatus), [])

  useEffect(() => {
    if (status !== 'warming') {
      setSecs(0)
      return
    }
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [status])

  if (status === 'ready') return null

  const tooLong = secs >= CEILING_S
  const isError = status === 'error' || tooLong

  return (
    <div className={`conn-banner ${isError ? 'conn-error' : 'conn-warn'}`}>
      <span>
        {status === 'error'
          ? 'Não foi possível conectar ao Databricks.'
          : tooLong
            ? `Está demorando mais que o esperado (${secs}s). O warehouse pode estar ocupado.`
            : `Ligando o warehouse do Databricks… a primeira consulta após um tempo ocioso pode levar até ~1 min (${secs}s).`}
      </span>
      {isError && (
        <button type="button" className="btn" onClick={() => warmUp()}>
          Tentar de novo
        </button>
      )}
    </div>
  )
}
