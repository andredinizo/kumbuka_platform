import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy local que autentica no Databricks (token de acesso) e executa SQL via a
// SQL Statement Execution API (POST /api/2.0/sql/statements + poll ate concluir).
// Guarda o token fora do browser. E um repassador "burro": conhece a CONEXAO
// (host/token/warehouse/catalog/schema) mas NAO conhece tabelas nem entidades — toda essa
// logica fica em src/data/*. Expoe um unico endpoint /sql que recebe { statement, parameters }
// e devolve { columns, rows }.
function databricksProxy(env) {
  const {
    DATABRICKS_HOST,
    DATABRICKS_TOKEN,
    DATABRICKS_WAREHOUSE_ID,
    DATABRICKS_CATALOG,
    DATABRICKS_SCHEMA,
  } = env

  function readBody(req) {
    return new Promise((resolve) => {
      const chunks = []
      req.on('data', (c) => chunks.push(c))
      req.on('end', () => resolve(chunks.length ? Buffer.concat(chunks).toString('utf8') : ''))
    })
  }

  function requireConfig() {
    if (!DATABRICKS_HOST || !DATABRICKS_TOKEN || !DATABRICKS_WAREHOUSE_ID) {
      throw new Error(
        'Faltam variaveis no .env: DATABRICKS_HOST, DATABRICKS_TOKEN, DATABRICKS_WAREHOUSE_ID. ' +
          'Copie .env.example para .env e preencha.'
      )
    }
  }

  const apiBase = () => DATABRICKS_HOST.replace(/\/$/, '') + '/api/2.0/sql/statements'

  function dbFetch(path, options) {
    return fetch(apiBase() + path, {
      ...options,
      headers: {
        Authorization: `Bearer ${DATABRICKS_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  }

  // Token e um PAT estatico (lido do .env): nao ha fluxo OAuth nem cache/renovacao.
  // Executa o statement e faz poll ate estado terminal; devolve o JSON final da API.
  async function runStatement(statement, parameters) {
    const res = await dbFetch('/', {
      method: 'POST',
      body: JSON.stringify({
        statement,
        warehouse_id: DATABRICKS_WAREHOUSE_ID,
        catalog: DATABRICKS_CATALOG || undefined,
        schema: DATABRICKS_SCHEMA || undefined,
        parameters: parameters && parameters.length ? parameters : undefined,
        wait_timeout: '30s',
        on_wait_timeout: 'CONTINUE',
        format: 'JSON_ARRAY',
        disposition: 'INLINE',
      }),
    })
    let data = await res.json()
    if (!res.ok) throw new Error(`Databricks ${res.status}: ${JSON.stringify(data)}`)

    const RUNNING = new Set(['PENDING', 'RUNNING'])
    while (data.status && RUNNING.has(data.status.state)) {
      await new Promise((r) => setTimeout(r, 1000))
      const poll = await dbFetch(`/${data.statement_id}`, { method: 'GET' })
      data = await poll.json()
      if (!poll.ok) throw new Error(`Databricks ${poll.status}: ${JSON.stringify(data)}`)
    }
    return data
  }

  const middleware = async (req, res, next) => {
    if (!req.url || req.method !== 'POST' || req.url.split('?')[0] !== '/sql') return next()
    try {
      requireConfig()
      const raw = await readBody(req)
      const { statement, parameters } = raw ? JSON.parse(raw) : {}
      if (!statement) throw new Error('Corpo invalido: faltou "statement".')

      const data = await runStatement(statement, parameters)
      const state = data.status && data.status.state
      if (state !== 'SUCCEEDED') {
        const msg = data.status && data.status.error ? data.status.error.message : `estado ${state}`
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: `Query nao concluiu (${state}): ${msg}` }))
        return
      }
      // Resultado columnar: nomes em manifest.schema.columns; linhas em result.data_array.
      const columns = (
        (data.manifest && data.manifest.schema && data.manifest.schema.columns) || []
      ).map((c) => c.name)
      const rows = (data.result && data.result.data_array) || []
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ columns, rows }))
    } catch (err) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: String(err.message || err) }))
    }
  }

  // Registrado em dev (npm run dev) E no preview do build (npm run preview), para que a app
  // rodada em outra maquina funcione tanto em dev quanto a partir do build. Use corpo de bloco,
  // nunca arrow com retorno implicito (o Vite trataria o retorno como post-hook e quebraria).
  return {
    name: 'databricks-proxy',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig(({ mode }) => {
  // Carrega .env tornando DATABRICKS_* visiveis ao proxy (lado servidor). Nenhuma var e exposta
  // ao client (sem prefixo VITE_): o token nunca chega ao browser.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), databricksProxy(env)],
  }
})
