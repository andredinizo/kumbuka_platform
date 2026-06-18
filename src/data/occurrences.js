// REGRA #4: unico arquivo que conhece a lista Ocorrencias e seus campos.
import { graphGet, SITE_ID } from './graphClient.js'

const LIST = 'Ocorrencias'
const base = () => `/sites/${SITE_ID}/lists/${LIST}`

function fromItem(item) {
  const f = item.fields || {}
  return {
    id: item.id,
    serie_id: f.serie_id ?? '',
    timestamp_inicio: f.timestamp_inicio ?? '',
    timestamp_fim: f.timestamp_fim ?? '',
    local_gravacao: f.local_gravacao ?? '',
    status_transcricao_whisper: f.status_transcricao_whisper ?? '',
    status_vtt: f.status_vtt ?? '',
    status_enriquecimento: f.status_enriquecimento ?? '',
    status_sumarizacao: f.status_sumarizacao ?? '',
    status_entrega: f.status_entrega ?? '',
    timestamp_criacao: f.timestamp_criacao ?? '',
    timestamp_atualizacao: f.timestamp_atualizacao ?? '',
  }
}

export async function listOccurrences(filters = {}) {
  const data = await graphGet(`${base()}/items?expand=fields`)
  let rows = (data.value || []).map(fromItem)
  if (filters.serie_id) rows = rows.filter((o) => o.serie_id === filters.serie_id)
  return rows
}

export async function getOccurrence(id) {
  const item = await graphGet(`${base()}/items/${id}?expand=fields`)
  return fromItem(item)
}
