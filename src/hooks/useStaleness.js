import { useEffect, useState } from 'react'

// Limiar de staleness das paginas de edicao (ver 08-conexao-warehouse.md): acima disso, o form
// trava o Salvar e pede recarregar, para nunca escrever a partir de dados muito antigos.
export const STALE_THRESHOLD_MS = 15 * 60 * 1000

// Retorna true quando o baseline carregado (em `loadedAt`, epoch ms) passou do limiar.
// Mede o tempo desde o LOAD — editar nao rejuvenesce o baseline. Faz tick periodico para virar
// stale com a pagina aberta.
export function useStaleness(loadedAt) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!loadedAt) return
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [loadedAt])
  return loadedAt ? now - loadedAt >= STALE_THRESHOLD_MS : false
}
