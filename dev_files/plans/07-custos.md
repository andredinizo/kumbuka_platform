# 07 — Custos da plataforma (stub) — feature 11 (ADIADA)

## Objetivo
Página da feature 11 (histórico de custos). **Adiada**: ainda não existe fonte de dados de custos
no modelo (não há tabela/lista de custos). Por enquanto é só um stub "em breve".

## Rota
- `/costs`

## Dados
- `data/costs.js`: `listCosts()` — implementação adiada; retorna `[]` por enquanto.
  É o lugar único (regra #4) onde a fonte de custos será ligada quando existir (ex.: lista `Custos`
  com `occurrence_id`, `serie_id`, `servico`, `tokens`, `custo_brl`, `timestamp`).

## Layout (stub)
- `<h2>Custos da plataforma</h2>` + bloco `.detail` com "Em breve." e uma nota explicando que,
  quando houver fonte, basta implementar `listCosts()` e construir a tabela no padrão das demais listas.

## Quando for implementar (futuro)
- Criar a lista SharePoint de custos, mapear campos em `data/costs.js`, e fazer `CostsStub` virar uma
  página de lista igual às outras (tabela + estados carregando/erro/vazio). Atualizar este doc.

## Critério de pronto (stub)
- `/costs` abre e mostra o aviso "Em breve" sem quebrar; nav lateral linka para ela.
