# 04 — Transcrições e Sumarizações (lista + detalhe + download, somente leitura) — features 7–10

Duas entidades quase idênticas em estrutura. Documentadas juntas.

## Rotas
- `/transcriptions`, `/transcriptions/:id` (aceita `?reuniao_id=` para filtrar por ocorrência)
- `/summarizations`, `/summarizations/:id` (aceita `?reuniao_id=` para filtrar por ocorrência)

## Dados
- Listas SharePoint `Transcricoes` e `Sumarizacoes` (espelhadas).
- `data/transcriptions.js`: `listTranscriptions(filters)`, `getTranscription(id)`.
  Campos: `reuniao_id`, `serie_id`, `tipo` (whisper/teams_vtt/enriquecida), `texto`, `timestamp_criacao`.
- `data/summarizations.js`: `listSummarizations(filters)`, `getSummarization(id)`.
  Campos: `reuniao_id`, `transcricao_id`, `perfil_id`, `texto`, `status`, `timestamp_criacao`.
- `filters` suportado no MVP: `reuniao_id` (filtragem no cliente).

## Layout
- **Lista (transcrições):** Tipo, Ocorrência, Criada em + "Abrir".
- **Lista (sumarizações):** Perfil, Ocorrência, Status, Criada em + "Abrir".
- **Detalhe:** metadados + bloco de texto (`.text-block`, pre-wrap, rolável) + botão de download.
  - Transcrição baixa `.txt`. Sumarização baixa `.html` (texto já é HTML, ver seção 3.5 do pipeline).
  - **O conteúdo é exibido SEMPRE como texto puro**, inclusive a sumarização (que é HTML): mostra-se
    a marcação como texto, NÃO renderizada (sem `dangerouslySetInnerHTML`). O HTML renderizado fica
    só no arquivo baixado. Decisão do usuário.

## Componentes
- `DownloadButton` — recebe `filename`, `content`, `mime`; gera Blob e dispara download no cliente.
  (Sem servidor: download é puramente client-side a partir do texto já carregado.)

## Nota de viabilidade (texto grande)
- Para o MVP o `texto` vem da coluna da lista. Se exceder o limite do SharePoint, evoluir
  `data/*` para ler o artefato do drive via Graph (campo com path). **Confirmar volume real.**

## Estados de borda
- Carregando/erro/vazio. Texto ausente → aviso "sem conteúdo".

## Critério de pronto
- Listas e detalhes carregam; download gera arquivo com o conteúdo exibido.
- `?reuniao_id=` filtra por ocorrência (usado no drill-down).
