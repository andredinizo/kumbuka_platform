// REGRA #4: este e o UNICO arquivo que conhece a lista MeetingSeries e seus campos.
// Se a recorrencia mudar de lugar (outra lista, outro backend), muda-se SO aqui.
import { graphGet, graphPost, graphPatch, SITE_ID } from './graphClient.js'

const LIST = 'MeetingSeries'
const base = () => `/sites/${SITE_ID}/lists/${LIST}`

// SharePoint guarda os dados em item.fields. Traduz fields -> objeto da app.
function fromItem(item) {
  const f = item.fields || {}
  return {
    id: item.id,
    nome: f.nome ?? f.Title ?? '',
    serie_ativa: !!f.serie_ativa,
    descricao: f.descricao ?? '',
    local_gravacao: f.local_gravacao ?? '',
  }
}

// objeto da app -> fields para POST/PATCH.
function toFields(data) {
  return {
    nome: data.nome,
    serie_ativa: data.serie_ativa,
    descricao: data.descricao,
    local_gravacao: data.local_gravacao,
  }
}

export async function listRecurrences() {
  const data = await graphGet(`${base()}/items?expand=fields`)
  return (data.value || []).map(fromItem)
}

export async function getRecurrence(id) {
  const item = await graphGet(`${base()}/items/${id}?expand=fields`)
  return fromItem(item)
}

export async function createRecurrence(data) {
  const item = await graphPost(`${base()}/items`, { fields: toFields(data) })
  return fromItem(item)
}

export async function updateRecurrence(id, data) {
  await graphPatch(`${base()}/items/${id}/fields`, toFields(data))
  return getRecurrence(id)
}
