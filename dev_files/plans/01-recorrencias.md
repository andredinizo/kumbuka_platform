# 01 — Recorrências (lista + formulário, CRUD) — features 1 e 2

## Objetivo
Ver a lista de recorrências de reunião monitoradas e criar/editar uma. Valida o caminho de
leitura+escrita ponta a ponta numa lista que já existe (`MeetingSeries`).

## Rotas
- `/recurrences` — lista (já feito na fundação)
- `/recurrences/new` — criar
- `/recurrences/:id` — editar

## Dados
- `data/recurrences.js`: `listRecurrences()`, `getRecurrence(id)`, `createRecurrence(data)`,
  `updateRecurrence(id, data)`.
- Campos do objeto: `nome` (text), `serie_ativa` (bool), `descricao` (text), `local_gravacao` (text).

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
- Lista: carregando, erro de Graph, vazio.
- Form: carregando (na edição), salvando (desabilita botão), erro ao salvar, `nome` obrigatório.

## Critério de pronto
- Criar uma recorrência aparece na lista após salvar.
- Editar altera o item e persiste (reabrir mostra os novos valores).
- `nome` vazio bloqueia o salvar.
