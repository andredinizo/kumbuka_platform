# 03 — Ocorrências de reunião (lista + detalhe, somente leitura) — features 5 e 6

## Objetivo
Ver o histórico de ocorrências de reunião e o detalhe de uma, incluindo as 5 colunas de status do
pipeline. Somente leitura (os dados vêm do pipeline, que escreve na tabela `meeting_occurrence`).

## Rotas
- `/occurrences` — lista (aceita `?serie_id=` para filtrar por recorrência)
- `/occurrences/:id` — detalhe

## Dados
- Tabela Databricks `meeting_occurrence`.
- `data/occurrences.js`: `listOccurrences(filters)`, `getOccurrence(id)`.
  - `filters` suportado no MVP: `serie_id` → aplica `WHERE serie_id = :serie_id` no **SQL**.
- Colunas: `id`, `serie_id`, `timestamp_inicio`, `timestamp_fim`, `local_gravacao`,
  `status_transcricao_whisper`, `status_vtt`, `status_enriquecimento`, `status_sumarizacao`,
  `status_entrega`, `timestamp_criacao`, `timestamp_atualizacao`.
- **SQL:** `SELECT <colunas> FROM meeting_occurrence` (+ `WHERE serie_id = :serie_id` quando filtrado;
  `ORDER BY timestamp_inicio DESC` recomendado). Detalhe: `... WHERE id = :id`.
- **Coerção** (gotcha §00): timestamps vêm como string → formatar com `formatDateTime`.

## Layout
- **Lista:** Início, Recorrência, e os 5 status como `StatusBadge` + "Abrir".
- **Detalhe:** seção de identificação (id, recorrência, início/fim, local) + grid dos 5 status como
  badges + toolbar de drill-down (ver `06-drill-down.md`).

## Componentes
- `StatusBadge` — cor por valor: `pendente`(cinza), `processando`(azul), `obtido`/`concluido`/
  `concluida`/`entregue`(verde), `vazio`(amarelo), `falhou`(vermelho).

## Estados de borda
- Lista/detalhe: carregando/erro/vazio. Datas formatadas (pt-BR) com fallback se ausentes.

## Critério de pronto
- Lista mostra ocorrências com badges coloridos por status.
- Detalhe mostra todos os campos e os 5 status.
- `/occurrences?serie_id=X` filtra por recorrência (via `WHERE serie_id`).
