import { useCallback, useEffect, useRef, useState } from 'react'
import { readCache, writeCache } from '../data/databricksClient.js'

// Base de toda pagina de lista/detalhe (ver 08-conexao-warehouse.md). Carrega via `fn`, expoe
// refresh manual e a idade do dado. Se `cacheKey` for dado (so listas/overview), faz
// stale-while-revalidate: mostra o cache na hora (stale=true) e revalida em background.
//
// fn: () => Promise<data>. options: { cacheKey?: string, deps?: any[] }.
// Retorna { data, stale, loading, error, lastUpdated, refresh }.
export function useRefreshableQuery(fn, { cacheKey, deps = [] } = {}) {
  const fnRef = useRef(fn)
  fnRef.current = fn

  const [data, setData] = useState(() => (cacheKey ? readCache(cacheKey) : null))
  const [stale, setStale] = useState(() => Boolean(cacheKey && readCache(cacheKey) != null))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    return fnRef
      .current()
      .then((d) => {
        setData(d)
        setStale(false)
        setLastUpdated(Date.now())
        if (cacheKey) writeCache(cacheKey, d)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [cacheKey])

  useEffect(() => {
    // Ao (re)entrar ou mudar de filtro: parte do cache da chave atual, depois revalida.
    if (cacheKey) {
      const cached = readCache(cacheKey)
      setData(cached)
      setStale(cached != null)
    } else {
      setData(null)
      setStale(false)
    }
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, ...deps])

  return { data, stale, loading, error, lastUpdated, refresh }
}
