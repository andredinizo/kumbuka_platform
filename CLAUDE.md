# CLAUDE.md — Kumbuk.ai Frontend

Frontend MVP para ver/editar os dados do pipeline de transcrição/sumarização de reuniões.
SPA React + Vite. **Databricks é o único backend** (tabelas Delta / Unity Catalog, acessadas via SQL).

## Como funciona (essencial)

- **Proxy Databricks em `vite.config.js`**: um middleware que guarda o token de acesso (`.env`),
  executa SQL via a **SQL Statement Execution API** (`POST /api/2.0/sql/statements` + poll até
  concluir) e expõe um único endpoint `POST /sql` que recebe `{ statement, parameters }` e devolve
  `{ columns, rows }`. O browser nunca vê o token. É um repassador burro — conhece só a CONEXÃO
  (host/token/warehouse/catalog/schema), NÃO conhece tabelas nem entidades.
  - Token é um **PAT estático** do `.env` — sem OAuth, sem cache/renovação.
  - Registrado em `configureServer` E `configurePreviewServer` (funciona em `dev` e `preview`).
  - Use corpo de bloco nos hooks, nunca arrow com retorno implícito (o Vite trataria o retorno como
    post-hook e quebraria no startup).
- **Camada de dados `src/data/<entidade>.js` (REGRA CENTRAL)**: cada módulo é o **único** lugar que
  sabe onde o dado mora (qual tabela Databricks, quais colunas). Uma função por leitura/escrita
  (`list*/get*/create*/update*`), montando SQL parametrizado. Mudou a fonte de um dado? Muda só esse
  arquivo. `databricksClient.js` (`dbQuery(sql, params)` + helper `param`) não tem lógica de entidade.
  - **Gotcha:** a Statement Execution API devolve **todo valor como string** (ou null). Cada `data/*`
    coage tipos no `fromRow` (bool: `=== 'true'`; número: `Number(...)`; timestamp: formata na UI).
  - Escritas usam `crypto.randomUUID()` no client para o `id`, depois `getX(id)` retorna a linha.
  - Filtros (`serie_id`, `reuniao_id`) são aplicados no **SQL** (`WHERE`), não no cliente.
- **Páginas** em `src/pages/` (lista + formulário/detalhe). **Componentes** reutilizáveis em
  `src/components/`: `Field`, `Form`, `StatusBadge`, `DownloadButton`, `BrandLogo` (marca na navbar
  + easter egg "trinca e cai", `09-marca-e-easter-egg.md`). `src/format.js` = `formatDateTime` (pt-BR).
- **Cold start / frescor dos dados**: o warehouse pode levar até ~1 min para subir (cold start). O
  tratamento é cross-cutting e mora em `dbQuery` (status de conexão, cache SWR, warm-up) + um banner
  global + um hook `useRefreshableQuery` (indicador "atualizado há X" + botão Atualizar). Páginas de
  edição travam **Salvar** após o limiar de staleness (15 min). **Autoridade: `08-conexao-warehouse.md`.**

## Convenções (seguir ao editar/criar)

- **Simplicidade primeiro (MVP)**: sem Redux/react-query/DTOs. Páginas de lista/detalhe usam o hook
  compartilhado `useRefreshableQuery(fn)` (`data/loading/error/lastUpdated/refresh`); forms controlam
  seu próprio estado de campos. Não adicionar abstração que só serviria no futuro (o hook é reuso de
  necessidade presente — toda página precisa de refresh + idade dos dados).
- **Tabelas (UI)**: `<table>` cru em cada lista. NÃO existe componente `Table`.
- **SQL sempre parametrizado** (`param(...)` / `:nome`); nunca interpolar valores do usuário na query.
- **Listas grandes**: o `SELECT` de lista de transcrições/sumarizações NÃO traz a coluna `texto`
  (grande); o `texto` só é carregado no detalhe (`getX(id)`).
- **Sem auth por enquanto** (ferramenta interna). O ponto de evolução é o proxy (trocar PAT por
  OAuth/login), não a UI. Não há `src/auth.js` nem `server/` separado.
- **Conteúdo de transcrição/sumarização é exibido como TEXTO PURO** (mesmo quando é HTML); o HTML
  renderizado fica só no arquivo baixado (`DownloadButton`). Não usar `dangerouslySetInnerHTML`.
- **Drill-down** via query params (`?serie_id=`, `?reuniao_id=`) lidos com `useSearchParams`; links
  só quando o id de destino existe.
- **Idioma**: UI e comentários em PT-BR.

## Planos detalhados (autoridade)

`dev_files/plans/` tem **um doc por feature**, em tom para um LLM construir o arquivo do zero. Antes
de mudar/criar uma página, leia/atualize o doc correspondente. O plano do **pipeline** (contexto do
domínio, tabelas, status) está em `dev_files/plano_ex_plataforma.md`. Mantenha doc e código em sincronia.

## Rodar

```
cp .env.example .env   # DATABRICKS_HOST, DATABRICKS_TOKEN, DATABRICKS_WAREHOUSE_ID,
                       #   DATABRICKS_CATALOG, DATABRICKS_SCHEMA
npm install
npm run dev            # http://localhost:5173  (ou: npm run build && npm run preview)
```

- O PAT precisa de acesso ao SQL Warehouse e às tabelas (`CAN_USE` no warehouse + SELECT/MODIFY nas
  tabelas via Unity Catalog), senão as queries falham.
- Tabelas usadas (Unity Catalog, no catalog/schema do `.env`): `recorrencias_reuniao`,
  `perfis_sumarizacao` (CRUD); `meeting_occurrence`, `transcricoes`, `sumarizacoes` (leitura).
  Nomes de coluna esperados estão em `src/data/*`.

## Adiado / fora do MVP

Auth de usuário; página de Custos (feature 11 — sem fonte de dados, hoje é stub em `CostsStub` +
`data/costs.js`); retry/reprocess de ocorrências; CRUD de métodos de entrega.
