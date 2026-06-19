// REGRA #4: unico arquivo que conhece a tabela meeting_occurrence e suas colunas. Somente leitura
// (os dados vem do pipeline).
import { dbQuery, param } from './databricksClient.js'

const TABLE = 'meeting_occurrence'
const COLS = `id, serie_id, timestamp_inicio, timestamp_fim, local_gravacao,
  status_transcricao_whisper, status_vtt, status_enriquecimento, status_sumarizacao,
  status_entrega, timestamp_criacao, timestamp_atualizacao`

function fromRow(r) {
  return {
    id: r.id ?? '',
    serie_id: r.serie_id ?? '',
    timestamp_inicio: r.timestamp_inicio ?? '',
    timestamp_fim: r.timestamp_fim ?? '',
    local_gravacao: r.local_gravacao ?? '',
    status_transcricao_whisper: r.status_transcricao_whisper ?? '',
    status_vtt: r.status_vtt ?? '',
    status_enriquecimento: r.status_enriquecimento ?? '',
    status_sumarizacao: r.status_sumarizacao ?? '',
    status_entrega: r.status_entrega ?? '',
    timestamp_criacao: r.timestamp_criacao ?? '',
    timestamp_atualizacao: r.timestamp_atualizacao ?? '',
  }
}

export async function listOccurrences(filters = {}) {
  // Filtro por serie_id feito no SQL (WHERE), nao no cliente.
  const where = filters.serie_id ? 'WHERE serie_id = :serie_id' : ''
  const params = filters.serie_id ? [param('serie_id', filters.serie_id)] : []
  const rows = await dbQuery(
    `SELECT ${COLS} FROM ${TABLE} ${where} ORDER BY timestamp_inicio DESC`,
    params
  )
  return rows.map(fromRow)
}

export async function getOccurrence(id) {
  const rows = await dbQuery(`SELECT ${COLS} FROM ${TABLE} WHERE id = :id`, [param('id', id)])
  if (!rows.length) throw new Error(`Ocorrencia ${id} nao encontrada.`)
  return fromRow(rows[0])
}
