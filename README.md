# Kumbuk.ai — Frontend (MVP)

Interface web para ver e editar os dados do pipeline de transcrição/sumarização de reuniões.
SharePoint é o backend; o app é uma SPA React+Vite com um proxy local que autentica no Microsoft
Graph usando a app registration existente. O plano completo está em
[dev_files/plans/](dev_files/plans/) (um doc por feature).

## Como rodar

1. Pré-requisitos: Node 18+ e a app registration (permissões de aplicativo no SharePoint).
2. `cp .env.example .env` e preencha:
   - `TENANT_ID`, `CLIENT_ID`, `CLIENT_SECRET` — da app registration (ficam só no servidor local).
   - `VITE_SITE_ID` — ID do site SharePoint onde estão as listas (não é segredo).
3. `npm install`
4. `npm run dev` → abra http://localhost:5173

Para rodar a partir do build: `npm run build` e depois `npm run preview` (o proxy funciona nos dois).

## Permissões (Sites.ReadWrite.Selected)

Com `Sites.Selected`, um admin precisa **conceder o app ao site específico** uma vez:
`POST /sites/{site-id}/permissions` com `roles: ["write"]` para o `CLIENT_ID`. Sem isso, as chamadas
às listas retornam 403.

## Listas SharePoint usadas

Já existentes: `MeetingSeries`, `PerfisSumarizacao`.
A espelhar das tabelas Databricks (ver seção 4 do plano do pipeline e
[dev_files/plano_ex_plataforma.md](dev_files/plano_ex_plataforma.md)):
`Ocorrencias`, `Transcricoes`, `Sumarizacoes`. Os nomes de campo esperados estão em cada módulo de
`src/data/`.

## Arquitetura (resumo)

- `vite.config.js` — proxy `/graph/*`: guarda o segredo, pega/cacheia o token de app e repassa ao
  Graph. É um repassador burro (não conhece entidades).
- `src/data/<entidade>.js` — **único lugar que sabe onde cada dado está** (qual lista, quais campos).
  Mudou a fonte de um dado? Muda só aqui.
- `src/pages/` — páginas de lista e formulário/detalhe. `src/components/` — `Table`(inline),
  `Field`, `Form`, `StatusBadge`, `DownloadButton`.

## Auth

Sem login por enquanto (ferramenta interna, máquinas confiáveis). Quando precisar, o ponto de
entrada é o proxy em `vite.config.js` (validar token de usuário / MSAL delegado) — a UI não muda.
