# 02 — Perfis de sumarização (lista + formulário, CRUD) — features 3 e 4

## Objetivo
Ver os perfis de sumarização e criar/editar um. Permitir filtrar por recorrência (base do
drill-down recorrência → perfis).

## Rotas
- `/profiles` — lista (aceita `?serie_id=` para filtrar por recorrência)
- `/profiles/new` — criar (aceita `?serie_id=` para pré-preencher)
- `/profiles/:id` — editar

## Dados
- `data/profiles.js` (único lugar que conhece `PerfisSumarizacao` e seus campos):
  `listProfiles()`, `listProfilesByRecurrence(serieId)`, `getProfile(id)`, `createProfile(data)`,
  `updateProfile(id, data)`.
- Campos: `serie_id` (text/FK), `nome` (text), `descricao` (text), `versao` (int),
  `perfil_ativo` (bool), `prompt` (textarea grande).

## Layout
- **Lista:** Nome, Versão, Ativo, (Recorrência) + "Abrir". Botão "+ Novo perfil".
  Se `?serie_id`, título indica o filtro.
- **Formulário:** Recorrência (serie_id), Nome (obrigatório), Descrição, Versão, Ativo, Prompt.

## Ações
- Salvar (novo/edição) → volta para `/profiles` (ou para a lista filtrada se veio de uma recorrência).

## Componentes
- `Field`, `Form` (reuso da milestone 1/2).

## Estados de borda
- Lista: carregando/erro/vazio. Form: carregando na edição, salvando, `nome` obrigatório.

## Critério de pronto
- CRUD funciona como em recorrências.
- `/profiles?serie_id=X` mostra só os perfis daquela recorrência.
