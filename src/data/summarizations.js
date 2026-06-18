// REGRA #4: unico arquivo que conhece a lista Sumarizacoes e seus campos.
import { graphGet, SITE_ID } from './graphClient.js'

const LIST = 'Sumarizacoes'
const base = () => `/sites/${SITE_ID}/lists/${LIST}`

function fromItem(item) {
  const f = item.fields || {}
  return {
    id: item.id,
    reuniao_id: f.reuniao_id ?? '',
    transcricao_id: f.transcricao_id ?? '',
    perfil_id: f.perfil_id ?? '',
    texto: f.texto ?? '',
    status: f.status ?? '',
    timestamp_criacao: f.timestamp_criacao ?? '',
  }
}

export async function listSummarizations(filters = {}) {
  const data = await graphGet(`${base()}/items?expand=fields`)
  let rows = (data.value || []).map(fromItem)
  if (filters.reuniao_id) rows = rows.filter((s) => s.reuniao_id === filters.reuniao_id)
  return rows
}

export async function getSummarization(id) {
  const item = await graphGet(`${base()}/items/${id}?expand=fields`)
  return fromItem(item)
}
