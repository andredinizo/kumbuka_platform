# 02 — Perfis de sumarização (lista + formulário, CRUD) — features 3 e 4

## Objetivo
Ver os perfis de sumarização e criar/editar um. Permitir filtrar por recorrência (base do
drill-down recorrência → perfis).

## Rotas
- `/profiles` — lista (aceita `?serie_id=` para filtrar por recorrência)
- `/profiles/new` — criar (aceita `?serie_id=` para pré-preencher)
- `/profiles/:id` — editar

## Dados
- `data/profiles.js` (único lugar que conhece a tabela `perfis_sumarizacao` e suas colunas):
  `listProfiles()`, `listProfilesByRecurrence(serieId)`, `getProfile(id)`, `createProfile(data)`,
  `updateProfile(id, data)`.
- Colunas: `id` (string/UUID), `serie_id` (string/FK), `nome` (string), `descricao` (string),
  `versao` (int), `perfil_ativo` (bool), `prompt` (texto grande).
- **SQL** (parametrizado):
  - lista: `SELECT id, serie_id, nome, descricao, versao, perfil_ativo, prompt FROM perfis_sumarizacao`
  - filtro por recorrência: o MESMO SELECT `+ WHERE serie_id = :serie_id` (filtragem no **SQL**,
    não no cliente — ver §06).
  - get/create/update análogos a recorrências (UUID gerado no client no create; `CAST(... AS
    BOOLEAN)` em `perfil_ativo`; `CAST(:versao AS INT)` em `versao`).
- **Coerção** (gotcha §00): `perfil_ativo` → bool; `versao` → `Number(...)`.

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
- CRUD funciona como em recorrências (linhas inseridas/atualizadas na tabela Delta).
- `/profiles?serie_id=X` mostra só os perfis daquela recorrência (filtro via `WHERE serie_id`).
