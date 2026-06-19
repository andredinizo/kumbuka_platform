# 01 — Recorrências (lista + formulário, CRUD) — features 1 e 2

## Objetivo
Ver a lista de recorrências de reunião monitoradas e criar/editar uma. Valida o caminho de
leitura+escrita ponta a ponta contra a tabela Delta de recorrências (SELECT/INSERT/UPDATE via SQL).

## Rotas
- `/recurrences` — lista (já feito na fundação)
- `/recurrences/new` — criar
- `/recurrences/:id` — editar

## Dados
- `data/recurrences.js` (único lugar que conhece a tabela `recorrencias_reuniao` e suas colunas):
  `listRecurrences()`, `getRecurrence(id)`, `createRecurrence(data)`, `updateRecurrence(id, data)`.
- Colunas do objeto: `id` (string/UUID), `nome` (string), `recorrencia_ativa` (bool), `descricao`
  (string), `local_gravacao` (string).
- **SQL** (parametrizado via `dbQuery`, nunca interpolando strings):
  - lista: `SELECT id, nome, recorrencia_ativa, descricao, local_gravacao FROM recorrencias_reuniao`
  - get: `... WHERE id = :id`
  - create: gera `id = crypto.randomUUID()` no client; `INSERT INTO recorrencias_reuniao
    (id, nome, recorrencia_ativa, descricao, local_gravacao) VALUES (:id, :nome,
    CAST(:recorrencia_ativa AS BOOLEAN), :descricao, :local_gravacao)`; depois `getRecurrence(id)`.
  - update: `UPDATE recorrencias_reuniao SET nome = :nome, recorrencia_ativa =
    CAST(:recorrencia_ativa AS BOOLEAN), descricao = :descricao, local_gravacao = :local_gravacao
    WHERE id = :id`; depois `getRecurrence(id)`.
- **Coerção de tipo** (gotcha do §00): no `fromRow`, `recorrencia_ativa` vem como string →
  `valor === 'true'`.

## Layout
- **Lista:** tabela com Nome, Ativa, Descrição + link "Abrir". Botão "+ Nova recorrência".
- **Formulário:** campos Nome (obrigatório), Ativa (checkbox), Descrição (textarea),
  Local da gravação (text). Botões Salvar e Cancelar.

## Ações
- "+ Nova" → `/recurrences/new`.
- Salvar (novo) → `createRecurrence` → volta para `/recurrences`.
- Salvar (edição) → `updateRecurrence` → volta para `/recurrences`.
- Cancelar → volta para `/recurrences`.

## Navegação (drill-down — ver `06-drill-down.md`)
- No modo edição, toolbar com "Ver perfis" → `/profiles?serie_id=<id>` e
  "Ver ocorrências" → `/occurrences?serie_id=<id>`.

## Componentes
- `Field` (label + input text/textarea/checkbox) — reutilizável.
- `Form` (wrapper: <form> + chrome de salvar/cancelar/erro/saving) — reutilizável.

## Estados de borda
- Lista: carregando, erro de SQL, vazio.
- Form: carregando (na edição), salvando (desabilita botão), erro ao salvar, `nome` obrigatório.

## Critério de pronto
- Criar uma recorrência aparece na lista após salvar (linha realmente inserida na tabela Delta).
- Editar altera a linha e persiste (reabrir mostra os novos valores).
- `nome` vazio bloqueia o salvar.
