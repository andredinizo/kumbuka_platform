# Kumbuk.ai — Frontend (MVP)

Interface web para ver e editar os dados do pipeline de transcrição/sumarização de reuniões.
Databricks é o backend; o app é uma SPA React+Vite com um proxy local que autentica no Databricks
e executa SQL via a SQL Statement Execution API. O plano completo está em
[dev_files/plans/](dev_files/plans/) (um doc por feature).

## Como rodar

1. Pré-requisitos: Node 18+ e um SQL Warehouse Databricks + um token de acesso (PAT).
2. `cp .env.example .env` e preencha (tudo fica só no servidor local; nada é exposto ao browser):
   - `DATABRICKS_HOST` — URL do workspace (ex.: `https://<id>.azuredatabricks.net`).
   - `DATABRICKS_TOKEN` — Personal Access Token (segredo).
   - `DATABRICKS_WAREHOUSE_ID` — ID do SQL Warehouse que executa as queries.
   - `DATABRICKS_CATALOG`, `DATABRICKS_SCHEMA` — catalog/schema padrão das tabelas.
3. `npm install`
4. `npm run dev` → abra http://localhost:5173

Para rodar a partir do build: `npm run build` e depois `npm run preview` (o proxy funciona nos dois).

## Permissões Databricks

O PAT precisa de `CAN_USE` no SQL Warehouse e de privilégios no Unity Catalog: `SELECT` nas tabelas
de leitura e `SELECT`+`MODIFY` nas de CRUD. Sem isso, as queries retornam erro de permissão.

## Tabelas usadas (Unity Catalog)

Editáveis pelo frontend (CRUD): `recorrencias_reuniao`, `perfis_sumarizacao`.
Somente leitura (escritas pelo pipeline): `meeting_occurrence`, `transcricoes`, `sumarizacoes`
(ver [dev_files/plano_ex_plataforma.md](dev_files/plano_ex_plataforma.md)). Os nomes de coluna
esperados estão em cada módulo de `src/data/`.

## Arquitetura (resumo)

- `vite.config.js` — proxy `POST /sql`: guarda o token, executa o statement no Warehouse (com poll)
  e devolve `{ columns, rows }`. É um repassador burro (não conhece tabelas/entidades).
- `src/data/<entidade>.js` — **único lugar que sabe onde cada dado está** (qual tabela, quais
  colunas) e monta o SQL parametrizado. Mudou a fonte de um dado? Muda só aqui.
  - A API devolve tudo como string: cada módulo coage tipos no `fromRow`.
- `src/pages/` — páginas de lista e formulário/detalhe. `src/components/` — `Table`(inline),
  `Field`, `Form`, `StatusBadge`, `DownloadButton`.

## Auth

Sem login por enquanto (ferramenta interna, máquinas confiáveis). Quando precisar, o ponto de
entrada é o proxy em `vite.config.js` (trocar o PAT por OAuth M2M / token de usuário) — a UI não muda.
