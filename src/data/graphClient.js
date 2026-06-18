// Cliente HTTP minimo para o proxy /graph. Sem logica de entidade — so chama o Graph
// atraves do proxy local e devolve JSON. Erros viram excecao com status + texto.

async function request(method, path, body) {
  const res = await fetch('/graph' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body == null ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Graph ${method} ${path} falhou (${res.status}): ${text}`)
  }
  return text ? JSON.parse(text) : null
}

export const graphGet = (path) => request('GET', path)
export const graphPost = (path, body) => request('POST', path, body)
export const graphPatch = (path, body) => request('PATCH', path, body)

// SITE_ID nao e segredo; vem do .env exposto ao client.
export const SITE_ID = import.meta.env.VITE_SITE_ID
