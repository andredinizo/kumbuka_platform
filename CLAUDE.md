# CLAUDE.md — Kumbuk.ai Frontend

Frontend MVP para ver/editar os dados do pipeline de transcrição/sumarização de reuniões.
SPA React + Vite. **SharePoint é o único backend** (listas acessadas via Microsoft Graph).

## Como funciona (essencial)

- **Proxy Graph em `vite.config.js`**: um middleware que guarda o segredo da app registration
  (`.env`), obtém/cacheia o token de app (client_credentials) e repassa qualquer `/graph/*` para o
  Microsoft Graph. O browser nunca vê o segredo. É um repassador burro — NÃO conhece entidades.
  - Registrado em `configureServer` E `configurePreviewServer` (funciona em `dev` e `preview`).
  - Use corpo de bloco nos hooks, nunca arrow com retorno implícito (o Vite trataria o retorno como
    post-hook e quebraria no startup).
- **Camada de dados `src/data/<entidade>.js` (REGRA CENTRAL)**: cada módulo é o **único** lugar que
  sabe onde o dado mora (qual lista SharePoint, quais campos). Uma função por leitura/escrita
  (`list*/get*/create*/update*`). Mudou a fonte de um dado? Muda só esse arquivo. `graphClient.js`
  (`graphGet/Post/Patch`) e `SITE_ID` (de `VITE_SITE_ID`) não têm lógica de entidade.
- **Páginas** em `src/pages/` (lista + formulário/detalhe). **Componentes** reutilizáveis em
  `src/components/`: `Field`, `Form`, `StatusBadge`, `DownloadButton`. `src/format.js` =
  `formatDateTime` (pt-BR).

## Convenções (seguir ao editar/criar)

- **Simplicidade primeiro (MVP)**: sem Redux/react-query/DTOs. Páginas chamam `data/*` direto e usam
  `useState` + `useEffect`. Não adicionar abstração que só serviria no futuro.
- **Tabelas**: `<table>` cru em cada lista. NÃO existe componente `Table`.
- **Sem auth por enquanto** (ferramenta interna). O ponto de evolução é o proxy, não a UI. Não há
  `src/auth.js` nem `server/` separado.
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
cp .env.example .env   # TENANT_ID, CLIENT_ID, CLIENT_SECRET, VITE_SITE_ID
npm install
npm run dev            # http://localhost:5173  (ou: npm run build && npm run preview)
```

- Permissão `Sites.ReadWrite.Selected`: um admin precisa conceder o app ao site uma vez
  (`POST /sites/{site-id}/permissions`), senão as chamadas dão 403.
- Listas usadas: `MeetingSeries`, `PerfisSumarizacao` (existem); `Ocorrencias`, `Transcricoes`,
  `Sumarizacoes` (a espelhar das tabelas Databricks). Nomes de campo esperados estão em `src/data/*`.

## Adiado / fora do MVP

Auth de usuário; página de Custos (feature 11 — sem fonte de dados, hoje é stub em `CostsStub` +
`data/costs.js`); retry/reprocess de ocorrências; CRUD de métodos de entrega.
