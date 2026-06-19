// Cliente unico para o proxy /sql. Sem logica de entidade — executa SQL no Databricks
// (via proxy local que injeta token/warehouse/catalog/schema) e devolve as linhas como objetos.
// Erros viram excecao com status + texto.

// params: array de { name, value, type } referenciados no SQL como :name (sempre parametrizar
// valores vindos do usuario — nunca interpolar strings na query). Use o helper `param`.
export async function dbQuery(sql, params = []) {
  const res = await fetch('/sql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ statement: sql, parameters: params }),
  })
  const text = await res.text()
  if (!res.ok) {
    // O proxy devolve { error } com a mensagem do Databricks.
    let msg = text
    try {
      msg = JSON.parse(text).error || text
    } catch {
      /* mantem o texto cru */
    }
    throw new Error(`SQL falhou (${res.status}): ${msg}`)
  }
  const { columns = [], rows = [] } = text ? JSON.parse(text) : {}
  // "Zip" colunas + linha -> objeto. ATENCAO: todos os valores vem como string (ou null);
  // a coercao de tipo (bool/int/timestamp) e responsabilidade de cada data/*.js.
  return rows.map((row) => {
    const obj = {}
    columns.forEach((name, i) => {
      obj[name] = row[i]
    })
    return obj
  })
}

// Monta um parametro tipado para a Statement Execution API. type: STRING (default), BOOLEAN,
// INT, BIGINT, DOUBLE, DATE, TIMESTAMP... O value sempre vai como string (a API converte).
export const param = (name, value, type = 'STRING') => ({
  name,
  value: value == null ? null : String(value),
  type,
})
