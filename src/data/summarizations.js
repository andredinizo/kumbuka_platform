// REGRA #4: unico arquivo que conhece a tabela sumarizacoes e suas colunas. Somente leitura.
import { dbQuery, param } from './databricksClient.js'

const TABLE = 'sumarizacoes'
// A lista NAO traz `texto` (pode ser grande); o texto so e carregado no detalhe.
const LIST_COLS = 'id, reuniao_id, transcricao_id, perfil_id, status, timestamp_criacao'
const DETAIL_COLS = 'id, reuniao_id, transcricao_id, perfil_id, texto, status, timestamp_criacao'

function fromRow(r) {
  return {
    id: r.id ?? '',
    reuniao_id: r.reuniao_id ?? '',
    transcricao_id: r.transcricao_id ?? '',
    perfil_id: r.perfil_id ?? '',
    texto: r.texto ?? '',
    status: r.status ?? '',
    timestamp_criacao: r.timestamp_criacao ?? '',
  }
}

export async function listSummarizations(filters = {}) {
  const where = filters.reuniao_id ? 'WHERE reuniao_id = :reuniao_id' : ''
  const params = filters.reuniao_id ? [param('reuniao_id', filters.reuniao_id)] : []
  const rows = await dbQuery(
    `SELECT ${LIST_COLS} FROM ${TABLE} ${where} ORDER BY timestamp_criacao DESC`,
    params
  )
  return rows.map(fromRow)
}

export async function getSummarization(id) {
  const rows = await dbQuery(`SELECT ${DETAIL_COLS} FROM ${TABLE} WHERE id = :id`, [param('id', id)])
  if (!rows.length) throw new Error(`Sumarizacao ${id} nao encontrada.`)
  return fromRow(rows[0])
}
