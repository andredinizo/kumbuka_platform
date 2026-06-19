# 05 — Dashboard (home) — extra

## Objetivo
Página inicial com visão geral: contagens por entidade e, principalmente, ocorrências que falharam
em alguma etapa do pipeline, para detectar problemas rápido.

## Rota
- `/`

## Dados
- Reusa os módulos `data/*`: `listRecurrences`, `listProfiles`, `listOccurrences`,
  `listTranscriptions`, `listSummarizations`. Sem novo módulo de dado.
- **Contagens:** podem usar as funções `list*` (e `.length`) no MVP. Como o backend agora é SQL,
  um refinamento barato é uma query `SELECT COUNT(*) FROM <tabela>` por entidade (evita trazer
  linhas só para contar) — opcional; se feito, mora no `data/*` da entidade (regra #4).
- **Falhas:** ocorrências com qualquer `status_* = 'falhou'`. Pode-se filtrar no cliente após
  `listOccurrences()`, ou (melhor com SQL) um SELECT com
  `WHERE 'falhou' IN (status_transcricao_whisper, status_vtt, status_enriquecimento,
  status_sumarizacao, status_entrega)` exposto por `data/occurrences.js`.

## Layout
- **Cards de contagem:** recorrências, perfis, ocorrências, transcrições, sumarizações
  (cada card linka para a lista correspondente).
- **Ocorrências com falha:** tabela das ocorrências onde qualquer `status_* === 'falhou'`,
  mostrando quais etapas falharam (badges) + link "Abrir".

## Estados de borda
- Carregando geral; se alguma query falhar, mostra o erro mas ainda exibe o que carregou
  (cada chamada é independente; usar `Promise.allSettled`).

## Critério de pronto
- Contagens batem com as tabelas.
- Ocorrências com `falhou` aparecem na seção de falhas; vazio mostra "nenhuma falha".
