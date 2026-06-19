// Cliente unico para o proxy /sql. Sem logica de entidade — executa SQL no Databricks
// (via proxy local que injeta token/warehouse/catalog/schema) e devolve as linhas como objetos.
// Erros viram excecao com status + texto.
//
// Tambem concentra (ver 08-conexao-warehouse.md): o status de conexao (cold start),
// um warm-up do warehouse, e os helpers de cache SWR (localStorage). Nada disso conhece entidades.

// --- Status de conexao (feedback de cold start) -------------------------------------------------
// Estados: 'ready' (ok) | 'warming' (alguma query passou do limiar -> warehouse provavelmente
// subindo) | 'error' (warm-up falhou). O <ConnectionBanner> assina isto.
let status = 'ready'
const listeners = new Set()
function setStatus(next) {
  if (next === status) return
  status = next
  listeners.forEach((fn) => fn(status))
}
export const getStatus = () => status
export function subscribeStatus(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Se uma query passar disto em voo, assume-se cold start e mostra-se "ligando o warehouse".
// Queries quentes voltam em <1s; este limiar evita piscar o aviso em consultas normais.
const WARMING_THRESHOLD_MS = 3500
let inFlight = 0

// --- Cache SWR (so para listas/overview; ver hook useRefreshableQuery) --------------------------
const CACHE_PREFIX = 'kdbx:'
export function readCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
export function writeCache(key, value) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value))
  } catch {
    /* quota cheia ou valor nao serializavel: ignora (cache e best-effort) */
  }
}

// --- Execucao de SQL ----------------------------------------------------------------------------
// params: array de { name, value, type } referenciados no SQL como :name (sempre parametrizar
// valores vindos do usuario — nunca interpolar strings na query). Use o helper `param`.
export async function dbQuery(sql, params = []) {
  inFlight++
  const timer = setTimeout(() => setStatus('warming'), WARMING_THRESHOLD_MS)
  try {
    const res = await fetch('/sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ statement: sql, parameters: params }),
    })
    const text = await res.text()
    if (!res.ok) {
      // O proxy devolve { error } com a mensagem do Databricks.
      let msg = text
      try {
        msg = JSON.parse(text).error || text
      } catch {
        /* mantem o texto cru */
      }
      throw new Error(`SQL falhou (${res.status}): ${msg}`)
    }
    const { columns = [], rows = [] } = text ? JSON.parse(text) : {}
    // "Zip" colunas + linha -> objeto. ATENCAO: todos os valores vem como string (ou null);
    // a coercao de tipo (bool/int/timestamp) e responsabilidade de cada data/*.js.
    return rows.map((row) => {
      const obj = {}
      columns.forEach((name, i) => {
        obj[name] = row[i]
      })
      return obj
    })
  } finally {
    clearTimeout(timer)
    inFlight--
    // Quando nada mais esta em voo, a conexao esta respondendo -> volta a 'ready' (limpa o aviso).
    // Erros de query individuais nao viram 'error' global (a pagina mostra o erro); so o warm-up faz.
    if (inFlight === 0) setStatus('ready')
  }
}

// Sobe o warehouse cedo (chamado no mount do App), para a espera do cold start sobrepor o tempo em
// que o usuario ainda se orienta. Falha -> status 'error' (o banner oferece "Tentar de novo").
export async function warmUp() {
  try {
    await dbQuery('SELECT 1')
    setStatus('ready')
  } catch {
    setStatus('error')
  }
}

// Monta um parametro tipado para a Statement Execution API. type: STRING (default), BOOLEAN,
// INT, BIGINT, DOUBLE, DATE, TIMESTAMP... O value sempre vai como string (a API converte).
export const param = (name, value, type = 'STRING') => ({
  name,
  value: value == null ? null : String(value),
  type,
})
