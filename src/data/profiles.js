// REGRA #4: unico arquivo que conhece a tabela perfis_sumarizacao e suas colunas.
import { dbQuery, param } from './databricksClient.js'

const TABLE = 'perfis_sumarizacao'
const COLS = 'id, serie_id, nome, descricao, versao, perfil_ativo, prompt'

function fromRow(r) {
  return {
    id: r.id ?? '',
    serie_id: r.serie_id ?? '',
    nome: r.nome ?? '',
    descricao: r.descricao ?? '',
    versao: Number(r.versao) || 1,
    perfil_ativo: r.perfil_ativo === 'true',
    prompt: r.prompt ?? '',
  }
}

export async function listProfiles() {
  const rows = await dbQuery(`SELECT ${COLS} FROM ${TABLE} ORDER BY nome`)
  return rows.map(fromRow)
}

export async function listProfilesByRecurrence(serieId) {
  // Filtro feito no SQL (WHERE), nao no cliente.
  const rows = await dbQuery(
    `SELECT ${COLS} FROM ${TABLE} WHERE serie_id = :serie_id ORDER BY nome`,
    [param('serie_id', serieId)]
  )
  return rows.map(fromRow)
}

export async function getProfile(id) {
  const rows = await dbQuery(`SELECT ${COLS} FROM ${TABLE} WHERE id = :id`, [param('id', id)])
  if (!rows.length) throw new Error(`Perfil ${id} nao encontrado.`)
  return fromRow(rows[0])
}

export async function createProfile(data) {
  const id = crypto.randomUUID()
  await dbQuery(
    `INSERT INTO ${TABLE} (id, serie_id, nome, descricao, versao, perfil_ativo, prompt)
     VALUES (:id, :serie_id, :nome, :descricao, :versao, :perfil_ativo, :prompt)`,
    [
      param('id', id),
      param('serie_id', data.serie_id),
      param('nome', data.nome),
      param('descricao', data.descricao),
      param('versao', Number(data.versao) || 1, 'INT'),
      param('perfil_ativo', !!data.perfil_ativo, 'BOOLEAN'),
      param('prompt', data.prompt),
    ]
  )
  return getProfile(id)
}

export async function updateProfile(id, data) {
  await dbQuery(
    `UPDATE ${TABLE} SET serie_id = :serie_id, nome = :nome, descricao = :descricao,
       versao = :versao, perfil_ativo = :perfil_ativo, prompt = :prompt
     WHERE id = :id`,
    [
      param('id', id),
      param('serie_id', data.serie_id),
      param('nome', data.nome),
      param('descricao', data.descricao),
      param('versao', Number(data.versao) || 1, 'INT'),
      param('perfil_ativo', !!data.perfil_ativo, 'BOOLEAN'),
      param('prompt', data.prompt),
    ]
  )
  return getProfile(id)
}
