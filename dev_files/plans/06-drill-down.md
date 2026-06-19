# 06 — Navegação drill-down (cross-cutting) — extra

## Objetivo
Ligar registros relacionados por cliques, sem novas páginas. Implementado como toolbars/links
dentro das páginas já existentes + filtros por query param nas listas.

## Filtros de lista por query param (aplicados via SQL `WHERE` nos `data/*`)
- `/profiles?serie_id=<id>` → `listProfilesByRecurrence(serieId)` → `WHERE serie_id = :serie_id`.
- `/occurrences?serie_id=<id>` → `listOccurrences({ serie_id })` → `WHERE serie_id = :serie_id`.
- `/transcriptions?reuniao_id=<id>` → `listTranscriptions({ reuniao_id })` → `WHERE reuniao_id = :reuniao_id`.
- `/summarizations?reuniao_id=<id>` → `listSummarizations({ reuniao_id })` → `WHERE reuniao_id = :reuniao_id`.
- Cada lista lê o param com `useSearchParams` e ajusta o título quando filtrada. O filtro acontece
  no **SQL** (cláusula `WHERE` parametrizada no `data/*`), não no cliente.

## Links por página (toolbar `.toolbar` no topo, abaixo do `<h2>`)
- **RecurrenceForm** (só no modo edição, usa o `:id` da recorrência):
  - "Ver perfis" → `/profiles?serie_id=<id>`
  - "Ver ocorrências" → `/occurrences?serie_id=<id>`
- **ProfileForm / ProfileList:** ao criar perfil a partir de uma recorrência, o `?serie_id` é
  propagado para `/profiles/new?serie_id=<id>` e pré-preenche o campo; ao salvar, volta para a
  lista filtrada `/profiles?serie_id=<id>`.
- **OccurrenceDetail:**
  - "Ver transcrições" → `/transcriptions?reuniao_id=<occ.id>`
  - "Ver sumarizações" → `/summarizations?reuniao_id=<occ.id>`
  - "Recorrência" → `/recurrences/<occ.serie_id>` (só se houver `serie_id`)
- **TranscriptionDetail:**
  - "Ocorrência" → `/occurrences/<t.reuniao_id>` (só se houver `reuniao_id`)
- **SummarizationDetail:**
  - "Ocorrência" → `/occurrences/<s.reuniao_id>` (só se houver)
  - "Transcrição usada" → `/transcriptions/<s.transcricao_id>` (só se houver)
  - "Perfil" → `/profiles/<s.perfil_id>` (só se houver)

## Convenção
- Botões de ação primária usam classe `btn`; links simples usam `<Link>` puro. Renderizar um link
  só quando o id de destino existir (evita rotas quebradas).

## Critério de pronto
- A partir de uma recorrência chega-se aos seus perfis e ocorrências.
- A partir de uma ocorrência chega-se às transcrições e sumarizações; e de volta à recorrência.
- A partir de uma sumarização chega-se à ocorrência, à transcrição usada e ao perfil.
