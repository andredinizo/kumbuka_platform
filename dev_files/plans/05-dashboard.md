# 05 — Dashboard (home) — extra

## Objetivo
Página inicial com visão geral: contagens por entidade e, principalmente, ocorrências que falharam
em alguma etapa do pipeline, para detectar problemas rápido.

## Rota
- `/`

## Dados
- Reusa os módulos `data/*`: `listRecurrences`, `listProfiles`, `listOccurrences`,
  `listTranscriptions`, `listSummarizations`. Sem novo acesso a dado.

## Layout
- **Cards de contagem:** recorrências, perfis, ocorrências, transcrições, sumarizações
  (cada card linka para a lista correspondente).
- **Ocorrências com falha:** tabela das ocorrências onde qualquer `status_* === 'falhou'`,
  mostrando quais etapas falharam (badges) + link "Abrir".

## Estados de borda
- Carregando geral; se alguma lista falhar, mostra o erro mas ainda exibe o que carregou
  (cada chamada é independente; usar `Promise.allSettled`).

## Critério de pronto
- Contagens batem com as listas.
- Ocorrências com `falhou` aparecem na seção de falhas; vazio mostra "nenhuma falha".
