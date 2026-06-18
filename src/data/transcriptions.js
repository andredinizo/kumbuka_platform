// REGRA #4: unico arquivo que conhece a lista Transcricoes e seus campos.
import { graphGet, SITE_ID } from './graphClient.js'

const LIST = 'Transcricoes'
const base = () => `/sites/${SITE_ID}/lists/${LIST}`

function fromItem(item) {
  const f = item.fields || {}
  return {
    id: item.id,
    reuniao_id: f.reuniao_id ?? '',
    serie_id: f.serie_id ?? '',
    tipo: f.tipo ?? '',
    texto: f.texto ?? '',
    timestamp_criacao: f.timestamp_criacao ?? '',
  }
}

export async function listTranscriptions(filters = {}) {
  const data = await graphGet(`${base()}/items?expand=fields`)
  let rows = (data.value || []).map(fromItem)
  if (filters.reuniao_id) rows = rows.filter((t) => t.reuniao_id === filters.reuniao_id)
  return rows
}

export async function getTranscription(id) {
  const item = await graphGet(`${base()}/items/${id}?expand=fields`)
  return fromItem(item)
}
