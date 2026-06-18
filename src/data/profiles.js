// REGRA #4: unico arquivo que conhece a lista PerfisSumarizacao e seus campos.
import { graphGet, graphPost, graphPatch, SITE_ID } from './graphClient.js'

const LIST = 'PerfisSumarizacao'
const base = () => `/sites/${SITE_ID}/lists/${LIST}`

function fromItem(item) {
  const f = item.fields || {}
  return {
    id: item.id,
    serie_id: f.serie_id ?? '',
    nome: f.nome ?? f.Title ?? '',
    descricao: f.descricao ?? '',
    versao: f.versao ?? 1,
    perfil_ativo: !!f.perfil_ativo,
    prompt: f.prompt ?? '',
  }
}

function toFields(data) {
  return {
    serie_id: data.serie_id,
    nome: data.nome,
    descricao: data.descricao,
    versao: Number(data.versao) || 1,
    perfil_ativo: data.perfil_ativo,
    prompt: data.prompt,
  }
}

export async function listProfiles() {
  const data = await graphGet(`${base()}/items?expand=fields`)
  return (data.value || []).map(fromItem)
}

export async function listProfilesByRecurrence(serieId) {
  // Filtro feito no cliente para o MVP (volume baixo); evita depender de indexacao do campo.
  const all = await listProfiles()
  return all.filter((p) => p.serie_id === serieId)
}

export async function getProfile(id) {
  const item = await graphGet(`${base()}/items/${id}?expand=fields`)
  return fromItem(item)
}

export async function createProfile(data) {
  const item = await graphPost(`${base()}/items`, { fields: toFields(data) })
  return fromItem(item)
}

export async function updateProfile(id, data) {
  await graphPatch(`${base()}/items/${id}/fields`, toFields(data))
  return getProfile(id)
}
