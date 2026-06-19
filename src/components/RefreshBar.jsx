import { useEffect, useState } from 'react'

// Barra "atualizado há X" + botão Atualizar, em toda página de lista/detalhe
// (ver 08-conexao-warehouse.md). `stale` (dados de cache aguardando revalidação) destaca em amarelo.
function ago(ts) {
  if (!ts) return '—'
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'agora há pouco'
  const m = Math.floor(s / 60)
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  return `há ${h} h`
}

export default function RefreshBar({ lastUpdated, loading, stale, onRefresh }) {
  const [, tick] = useState(0)
  // Re-renderiza 1×/min para o "há X min" acompanhar o relógio.
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 60000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={`refreshbar ${stale ? 'refreshbar-stale' : ''}`}>
      <span className="refreshbar-status">
        {loading
          ? 'Atualizando…'
          : stale
            ? 'Mostrando dados em cache — atualizando…'
            : `Atualizado ${ago(lastUpdated)}`}
      </span>
      <button type="button" className="btn-secondary" onClick={onRefresh} disabled={loading}>
        Atualizar
      </button>
    </div>
  )
}
