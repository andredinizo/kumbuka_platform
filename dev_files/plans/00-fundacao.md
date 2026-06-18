# 00 — Fundação (projeto, proxy Graph, camada de dados, layout)

## Objetivo
Montar o esqueleto do frontend: app React+Vite rodando em `npm run dev`, com um proxy local que
autentica no Microsoft Graph (client_credentials) usando a app registration existente, uma camada
de dados onde mora todo o conhecimento de "onde está o dado" (regra #4), e um layout com navegação
e páginas placeholder. Critério de sucesso: a lista de Recorrências carrega itens reais de
`MeetingSeries`.

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
.env.example              # CLIENT_ID, CLIENT_SECRET, TENANT_ID, SITE_ID (sem valores)
.gitignore                # já ignora .env*
vite.config.js            # plugin graphProxy() em configureServer
package.json
index.html
src/
  main.jsx                # cria router e monta <App>
  App.jsx                 # layout: nav lateral + <Outlet>/<Routes>
  styles.css              # estilos mínimos
  data/
    graphClient.js        # graphGet/graphPost/graphPatch -> fetch('/graph/...')
    recurrences.js        # listRecurrences/getRecurrence/createRecurrence/updateRecurrence
  pages/                  # placeholders nesta milestone, exceto RecurrenceList que prova o fluxo
    Dashboard.jsx ...
```

## Proxy Graph (vite.config.js)
- Plugin Vite que registra o MESMO middleware em `configureServer(server)` E em
  `configurePreviewServer(server)` — assim o proxy funciona tanto em `npm run dev` quanto em
  `npm run preview` (app rodada a partir do build em outra máquina).
  - ATENÇÃO: use corpo de bloco (`configureServer(server) { ... }`), nunca arrow com retorno
    implícito (`(server) => server.middlewares.use(...)`), senão o Vite trata o valor retornado
    (o app connect) como post-hook e quebra no startup.
- Intercepta requisições cujo `req.url` começa com `/graph/`.
- Mantém token de app em memória com expiração (`{ token, exp }`); renova quando faltar < 60s.
- Token via POST `https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token`
  body x-www-form-urlencoded: `grant_type=client_credentials`,
  `scope=https://graph.microsoft.com/.default`, `client_id`, `client_secret`.
- Repassa para `https://graph.microsoft.com/v1.0` + (url sem o prefixo `/graph`), copiando método,
  corpo e `Content-Type`, adicionando `Authorization: Bearer <token>`. Devolve status + corpo.
- Lê segredos de `process.env` (carregados de `.env` pelo `loadEnv` do Vite).
- É repassador burro: NÃO conhece listas nem entidades.

## graphClient.js
- `graphGet(path)`, `graphPost(path, body)`, `graphPatch(path, body)` — `fetch('/graph'+path)`,
  `Content-Type: application/json`, lança erro com status+texto se `!res.ok`, retorna JSON.
- Sem lógica de entidade.

## data/recurrences.js (regra #4 — único lugar que sabe a lista/campos)
- Constante `LIST = 'MeetingSeries'` e mapa de campos (`nome`, `serie_ativa`, `descricao`, `local_gravacao`).
- `listRecurrences()` → `GET /sites/{SITE_ID}/lists/{LIST}/items?expand=fields` → mapeia `fields`.
  - O SITE_ID no path: o proxy NÃO injeta; vem de `import.meta.env.VITE_SITE_ID` exposto ao client,
    OU o data module usa um caminho relativo e o proxy resolve. Decisão MVP: expor `VITE_SITE_ID`
    (não é segredo) e montar o path no data module.
- `getRecurrence(id)`, `createRecurrence(data)` (POST com `{ fields: {...} }`),
  `updateRecurrence(id, data)` (PATCH em `/items/{id}/fields`).

## Layout (App.jsx)
- Nav lateral fixa com links para todas as rotas. `<main>` renderiza a rota atual.
- CSS mínimo, sem framework de UI.

## Convenções (valem para todas as milestones)
- **Tabelas:** usar `<table>` cru em cada página de lista. NÃO existe componente `Table` — o esforço
  de abstrair não se paga no MVP (regra #1). (O `Table.jsx` citado no plano-mestre não foi construído.)
- **Sem `src/auth.js`:** auth está adiada; não há placeholder de auth. O ponto de evolução é o proxy.
- **Sem `server/`:** o proxy vive em `vite.config.js`, não num servidor Express separado.
- **`src/format.js`:** helper único `formatDateTime(value)` (pt-BR, fallback se vazio/ inválido),
  reusado pelas páginas que mostram datas.
- **Estilos:** todos em `src/styles.css` (classes simples: `.detail`, `.text-block`, `.badge`,
  `.cards`/`.card`, `.toolbar`, `.form`/`.field`). Visual é livre; o que importa é o comportamento.

## Componentes
Nenhum reutilizável ainda (entram nas próximas milestones): `Field`, `Form` (milestone 1/2),
`StatusBadge` (milestone 3), `DownloadButton` (milestone 4). RecurrenceList usa `<table>` cru.

## Estados de borda
- Carregando / erro de Graph: mostrar mensagem simples (sem segredo do .env, app não inicia o proxy
  e a lista mostra o erro do fetch).

## Critério de pronto
- `npm run dev` sobe sem erro; SPA abre e a navegação funciona.
- Com `.env` preenchido, `/recurrences` lista itens reais de `MeetingSeries`.
- Sem `.env`, a página de Recorrências mostra erro claro (não quebra a SPA).
- `data/recurrences.js` é o único arquivo que cita `MeetingSeries`/nomes de campos.
