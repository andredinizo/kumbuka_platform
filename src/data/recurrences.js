// REGRA #4: este e o UNICO arquivo que conhece a tabela recorrencias_reuniao e suas colunas.
// Se a recorrencia mudar de lugar (outra tabela, outro backend), muda-se SO aqui.
import { dbQuery, param } from './databricksClient.js'

const TABLE = 'recorrencias_reuniao'
const COLS = 'id, nome, recorrencia_ativa, descricao, local_gravacao'

// Linha do Databricks (tudo string) -> objeto da app, com coercao de tipos.
function fromRow(r) {
  return {
    id: r.id ?? '',
    nome: r.nome ?? '',
    recorrencia_ativa: r.recorrencia_ativa === 'true',
    descricao: r.descricao ?? '',
    local_gravacao: r.local_gravacao ?? '',
  }
}

export async function listRecurrences() {
  const rows = await dbQuery(`SELECT ${COLS} FROM ${TABLE} ORDER BY nome`)
  return rows.map(fromRow)
}

export async function getRecurrence(id) {
  const rows = await dbQuery(`SELECT ${COLS} FROM ${TABLE} WHERE id = :id`, [param('id', id)])
  if (!rows.length) throw new Error(`Recorrencia ${id} nao encontrada.`)
  return fromRow(rows[0])
}

export async function createRecurrence(data) {
  const id = crypto.randomUUID()
  await dbQuery(
    `INSERT INTO ${TABLE} (id, nome, recorrencia_ativa, descricao, local_gravacao)
     VALUES (:id, :nome, :recorrencia_ativa, :descricao, :local_gravacao)`,
    [
      param('id', id),
      param('nome', data.nome),
      param('recorrencia_ativa', !!data.recorrencia_ativa, 'BOOLEAN'),
      param('descricao', data.descricao),
      param('local_gravacao', data.local_gravacao),
    ]
  )
  return getRecurrence(id)
}

export async function updateRecurrence(id, data) {
  await dbQuery(
    `UPDATE ${TABLE} SET nome = :nome, recorrencia_ativa = :recorrencia_ativa,
       descricao = :descricao, local_gravacao = :local_gravacao
     WHERE id = :id`,
    [
      param('id', id),
      param('nome', data.nome),
      param('recorrencia_ativa', !!data.recorrencia_ativa, 'BOOLEAN'),
      param('descricao', data.descricao),
      param('local_gravacao', data.local_gravacao),
    ]
  )
  return getRecurrence(id)
}
