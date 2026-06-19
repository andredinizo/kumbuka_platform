# 00 — Fundação (projeto, proxy Databricks, camada de dados, layout)

## Objetivo
Montar o esqueleto do frontend: app React+Vite rodando em `npm run dev`, com um proxy local que
autentica no **Databricks** (token de acesso) e executa SQL via a **SQL Statement Execution API**,
uma camada de dados onde mora todo o conhecimento de "onde está o dado" (regra #4 — qual tabela,
quais colunas), e um layout com navegação e páginas placeholder. Critério de sucesso: a lista de
Recorrências carrega linhas reais da tabela Delta de recorrências.

> **Backend = Databricks (tabelas Delta / Unity Catalog), via SQL.** Não há mais SharePoint nem
> Microsoft Graph neste frontend. Todas as entidades (recorrências, perfis, ocorrências,
> transcrições, sumarizações) vivem em tabelas Databricks e são lidas/escritas por SQL.

## Rota
- `/` Dashboard (placeholder)
- `/recurrences`, `/recurrences/:id`
- `/profiles`, `/profiles/:id`
- `/occurrences`, `/occurrences/:id`
- `/transcriptions`, `/transcriptions/:id`
- `/summarizations`, `/summarizations/:id`
- `/costs` (stub)

## Arquivos
```
.env.example              # DATABRICKS_HOST, DATABRICKS_TOKEN, DATABRICKS_WAREHOUSE_ID,
                          #   DATABRICKS_CATALOG, DATABRICKS_SCHEMA (sem valores)
.gitignore                # já ignora .env*
vite.config.js            # plugin databricksProxy() em configureServer E configurePreviewServer
package.json
index.html
src/
  main.jsx                # cria router e monta <App>
  App.jsx                 # layout: nav lateral + <Outlet>/<Routes>
  styles.css              # estilos mínimos
  data/
    databricksClient.js   # dbQuery(sql, params) -> POST /sql -> [{coluna: valor}, ...]
    recurrences.js        # listRecurrences/getRecurrence/createRecurrence/updateRecurrence
  pages/                  # placeholders nesta milestone, exceto RecurrenceList que prova o fluxo
    Dashboard.jsx ...
```

## Modelo de conexão (do exemplo `dev_files/other/databricks_query_example.py`)
O exemplo em Python (não será reusado — só ilustra a conexão disponível na máquina de deploy) usa o
SDK do Databricks para executar um `statement` num **SQL Warehouse** e fazer poll até concluir. No
frontend reproduzimos isso pela **REST API** equivalente (Statement Execution API):

- **Executar:** `POST {DATABRICKS_HOST}/api/2.0/sql/statements/` com corpo JSON
  `{ statement, warehouse_id, catalog, schema, parameters, wait_timeout: "30s",
  on_wait_timeout: "CONTINUE", format: "JSON_ARRAY", disposition: "INLINE" }`.
- **Poll:** enquanto `status.state ∈ {PENDING, RUNNING}` → `GET {HOST}/api/2.0/sql/statements/{id}`
  a cada ~1–2s até estado terminal (`SUCCEEDED`, `FAILED`, `CANCELED`, `CLOSED`).
- **Resultado:** nomes das colunas em `manifest.schema.columns[].name`; linhas em
  `result.data_array` (array de arrays de **strings** — ver gotcha abaixo).
- **Auth:** header `Authorization: Bearer {DATABRICKS_TOKEN}`.

## Proxy Databricks (vite.config.js)
- Plugin Vite que registra o MESMO middleware em `configureServer(server)` E em
  `configurePreviewServer(server)` — assim o proxy funciona tanto em `npm run dev` quanto em
  `npm run preview` (app rodada a partir do build em outra máquina).
  - ATENÇÃO: use corpo de bloco (`configureServer(server) { ... }`), nunca arrow com retorno
    implícito (`(server) => server.middlewares.use(...)`), senão o Vite trata o valor retornado
    (o app connect) como post-hook e quebra no startup.
- Intercepta `POST /sql`. Corpo recebido do client: `{ statement, parameters }` (nada de
  warehouse/catalog/schema vindos do browser — são config de conexão, ficam no proxy).
- Faz o ciclo **executar → poll → resultado** descrito acima, server-side, e responde ao client com
  `{ columns: [...], rows: [[...]] }` em caso de `SUCCEEDED`, ou status de erro + mensagem caso
  contrário (sem vazar o token).
- **Token é um PAT estático** (lido do `.env`): NÃO há fluxo OAuth nem cache/renovação de token
  (diferente do proxy Graph anterior). Se faltar `DATABRICKS_HOST`/`DATABRICKS_TOKEN`/
  `DATABRICKS_WAREHOUSE_ID`, devolve erro claro pedindo para preencher o `.env`.
- Lê config de `process.env` (carregada de `.env` pelo `loadEnv` do Vite).
- Continua "burro" quanto a domínio: conhece a CONEXÃO (host, token, warehouse, catalog, schema)
  mas NÃO conhece tabelas, colunas nem entidades. Toda essa lógica fica em `data/*`.

> Decisão MVP (confirmar na construção): **autenticação por Personal Access Token (PAT)**, como no
> exemplo Python. Alternativa futura: OAuth M2M (service principal) — trocar só a obtenção do token
> no proxy, sem tocar na UI nem em `data/*`.

## databricksClient.js (sem lógica de entidade)
- `dbQuery(sql, params = [])` — `fetch('/sql', { method: 'POST', body: JSON.stringify({ statement: sql,
  parameters: params }) })`. Lança erro com status+texto se `!res.ok`. Em caso de sucesso, recebe
  `{ columns, rows }` e devolve **array de objetos** `coluna -> valor` (faz o "zip" de `columns` com
  cada linha de `rows`). Para `INSERT`/`UPDATE` (sem linhas), devolve `[]`.
- `params` segue o formato da API: array de `{ name, value, type? }`, referenciados no SQL como
  `:name`. **Sempre** parametrizar valores vindos do usuário (evita SQL injection); nunca
  interpolar strings na query.
- Sem `SITE_ID` nem nada de SharePoint.

## ⚠️ Gotcha central: tudo volta como STRING
O `data_array` da Statement Execution API traz **todos os valores como string** (ou `null`). Cada
`data/*.js` é responsável por **coagir tipos** ao mapear linha → objeto da app:
- booleano: `valor === 'true'` (ou `'1'`);
- número: `Number(valor)`;
- timestamp/data: manter string e formatar com `formatDateTime` na exibição.
Na volta (INSERT/UPDATE), passar valores como parâmetros com `type` adequado (`STRING`, `BOOLEAN`,
`INT`, `TIMESTAMP`) ou usar `CAST(:p AS BOOLEAN)` no SQL quando necessário.

## data/recurrences.js (regra #4 — único lugar que sabe a tabela/colunas)
- Constante com o nome da tabela (ex.: `recorrencias_reuniao`) e o mapa de colunas (`id`, `nome`,
  `recorrencia_ativa`, `descricao`, `local_gravacao`). Catalog e schema NÃO entram aqui — são
  injetados pelo proxy; as queries usam o nome simples da tabela.
- `listRecurrences()` → `SELECT id, nome, recorrencia_ativa, descricao, local_gravacao FROM
  recorrencias_reuniao` → mapeia cada linha com coerção de tipos (`recorrencia_ativa` → bool).
- `getRecurrence(id)` → `SELECT ... WHERE id = :id`.
- `createRecurrence(data)` → gera UUID no client (`crypto.randomUUID()`), `INSERT INTO
  recorrencias_reuniao (...) VALUES (:id, :nome, ...)`, e retorna `getRecurrence(id)`.
- `updateRecurrence(id, data)` → `UPDATE recorrencias_reuniao SET ... WHERE id = :id`, e retorna
  `getRecurrence(id)`.

## Layout (App.jsx)
- Nav lateral fixa com links para todas as rotas. `<main>` renderiza a rota atual.
- CSS mínimo, sem framework de UI.

## Convenções (valem para todas as milestones)
- **Tabelas (UI):** usar `<table>` cru em cada página de lista. NÃO existe componente `Table` — o
  esforço de abstrair não se paga no MVP (regra #1).
- **Sem `src/auth.js`:** auth de usuário está adiada; não há placeholder. O ponto de evolução é o
  proxy (trocar PAT por OAuth/login).
- **Sem `server/`:** o proxy vive em `vite.config.js`, não num servidor Express separado.
- **`src/format.js`:** helper único `formatDateTime(value)` (pt-BR, fallback se vazio/inválido),
  reusado pelas páginas que mostram datas.
- **Estilos:** todos em `src/styles.css` (classes simples: `.detail`, `.text-block`, `.badge`,
  `.cards`/`.card`, `.toolbar`, `.form`/`.field`). Visual é livre; o que importa é o comportamento.
- **Frescor dos dados / cold start (ver `08-conexao-warehouse.md`):** páginas de lista/detalhe usam o
  hook compartilhado `useRefreshableQuery(fn)` (em vez de `useState`+`useEffect` solto) para terem
  carregamento, refresh e indicador "atualizado há X". O tratamento de cold start (warm-up, status de
  conexão, cache SWR) mora em `dbQuery` + um `<ConnectionBanner>` global.

## Componentes
Nenhum reutilizável ainda (entram nas próximas milestones): `Field`, `Form` (milestone 1/2),
`StatusBadge` (milestone 3), `DownloadButton` (milestone 4), `ConnectionBanner` +
`useRefreshableQuery` (milestone 8). RecurrenceList usa `<table>` cru.

## Estados de borda
- Carregando / erro de SQL: mostrar mensagem simples. Sem `.env`, o proxy não autentica e a lista
  mostra o erro do fetch (sem quebrar a SPA, sem vazar segredo).

## Critério de pronto
- `npm run dev` sobe sem erro; SPA abre e a navegação funciona.
- Com `.env` preenchido, `/recurrences` lista linhas reais da tabela de recorrências (proxy
  autenticou, executou o SELECT e devolveu as linhas).
- Sem `.env`, a página de Recorrências mostra erro claro (não quebra a SPA).
- `data/recurrences.js` é o único arquivo que cita o nome da tabela / nomes de colunas.

## A confirmar na construção (não bloqueia)
- Nome/qualificação reais das tabelas (catalog/schema entram no `.env`; nome simples nos `data/*`).
- Parâmetros nomeados (`:id`) habilitados no SQL Warehouse, e privilégios do PAT: `CAN_USE` no
  warehouse + `SELECT` nas tabelas de leitura e `SELECT`+`MODIFY` nas de CRUD.
- **Recorrências** e **perfis** são tabelas Databricks graváveis pelo frontend (INSERT/UPDATE) e são
  a **fonte única** que o pipeline também consulta (ver `plano_ex_plataforma.md` §4.2) — ou seja, o
  que o frontend escreve é o que o pipeline lê. Confirmar que o pipeline já lê essas duas do
  Databricks (não mais de listas SharePoint) para que as escritas tenham efeito.
