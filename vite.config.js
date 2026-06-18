import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

// Proxy local que autentica no Microsoft Graph com a app registration (client_credentials)
// e repassa qualquer requisicao /graph/* para o Graph. Guarda o segredo fora do browser.
// E um repassador "burro": nao conhece listas nem entidades (regra do plano).
function graphProxy(env) {
  const { TENANT_ID, CLIENT_ID, CLIENT_SECRET } = env
  let cached = { token: null, exp: 0 }

  async function getToken() {
    const now = Date.now()
    if (cached.token && now < cached.exp - 60_000) return cached.token
    if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
      throw new Error(
        'Faltam variaveis no .env: TENANT_ID, CLIENT_ID, CLIENT_SECRET. Copie .env.example para .env e preencha.'
      )
    }
    const res = await fetch(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'https://graph.microsoft.com/.default',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      }
    )
    if (!res.ok) {
      throw new Error(`Falha ao obter token (${res.status}): ${await res.text()}`)
    }
    const data = await res.json()
    cached = { token: data.access_token, exp: now + data.expires_in * 1000 }
    return cached.token
  }

  function readBody(req) {
    return new Promise((resolve) => {
      const chunks = []
      req.on('data', (c) => chunks.push(c))
      req.on('end', () => resolve(chunks.length ? Buffer.concat(chunks) : null))
    })
  }

  const middleware = async (req, res, next) => {
    if (!req.url || !req.url.startsWith('/graph/')) return next()
    try {
      const token = await getToken()
      const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readBody(req)
      const target = GRAPH_BASE + req.url.slice('/graph'.length)
      const upstream = await fetch(target, {
        method: req.method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': req.headers['content-type'] || 'application/json',
          Accept: 'application/json',
        },
        body,
      })
      const text = await upstream.text()
      res.statusCode = upstream.status
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
      res.end(text)
    } catch (err) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: String(err.message || err) }))
    }
  }

  // Registrado em dev (npm run dev) E no preview do build (npm run preview), para que a
  // app rodada em outra maquina funcione tanto em dev quanto a partir do build.
  return {
    name: 'graph-proxy',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig(({ mode }) => {
  // Carrega .env tornando TENANT_ID/CLIENT_ID/CLIENT_SECRET visiveis ao proxy (lado servidor).
  // VITE_SITE_ID fica exposto ao client (nao e segredo).
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), graphProxy(env)],
  }
})
