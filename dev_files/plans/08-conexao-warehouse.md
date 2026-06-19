# 08 — Conexão com o warehouse: cold start, frescor dos dados e refresh — cross-cutting

## Objetivo
Tornar confortável a espera quando o SQL Warehouse precisa subir (cold start, até ~1 min) e tratar a
**idade dos dados** (staleness) de forma uniforme em todo o app: indicador de "atualizado há X" +
botão de atualizar em toda página, e um bloqueio de segurança nas páginas de edição.

## Contexto técnico (por que isso existe)
- O proxy já **espera de forma transparente**: faz `POST /api/2.0/sql/statements` e poll até o estado
  terminal. Com o warehouse frio, a query fica em `PENDING` enquanto ele sobe — vira uma query lenta
  (~30–60s), **não um erro**. O problema é puramente de UX (spinner sem explicação parece travado).
- O warehouse **auto-suspende** após ocioso; a primeira query após a ociosidade é a lenta.
- `dbQuery` é o **único ponto de passagem** (choke point): toda leitura E escrita passa por ele —
  então toda a instrumentação (status, cache, timing) mora lá, sem tocar páginas nem `data/*`.

A estratégia tem 3 camadas que se complementam. Nenhuma sozinha resolve tudo.

---

## Camada 1 — Baseline: warm-up + feedback honesto (cobre o PRIMEIRO acesso)
- **Warm-up no mount:** `App.jsx` dispara `warmUp()` (um `SELECT 1` via `dbQuery`) ao montar, para o
  warehouse começar a subir enquanto o usuário ainda se orienta na tela.
- **Status de conexão global** via pub/sub no `databricksClient.js` (`cold` / `warming` / `ready` /
  `error`). Como `dbQuery` é o choke point, instrumentar ali cobre leituras e escritas.
  - **Heurística de cold start:** se uma query passa de ~3–4s em voo, emite `warming` (queries quentes
    voltam em <1s). Em sucesso → `ready`; em falha → `error`.
- **`<ConnectionBanner>`** no layout, assinando o status: nada quando `ready`; quando `warming`,
  mensagem honesta + spinner + **contador de segundos** decorridos
  ("Ligando o warehouse do Databricks… a primeira consulta após um tempo ocioso pode levar até ~1 min");
  quando `error` ou após um teto (~90–120s), "demorou mais que o esperado" + botão **Tentar de novo**.
- **Shell sempre vivo:** nav/layout/marca renderizam na hora; só a região de dados mostra a espera
  (um blocker de tela cheia parece mais quebrado que um shell populado com painel de carregamento).

## Camada 2 — Stale-while-revalidate (SWR) nas listas/dashboard (cobre REVISITAS)
- **Cache em `localStorage`**, keyed por `SQL + parameters`, feito dentro de `dbQuery` (genérico, sem
  lógica de entidade). **Só** para os `SELECT` de **lista/overview** — que já não trazem a coluna
  `texto` (logo são baratos). **NÃO** cachear detalhe (texto grande) nem dados de formulário.
- **Comportamento na revisita:** renderiza os dados do cache **na hora** (estado visualmente
  "ofuscado/cinza" + aviso amarelo "atualizando…"); o warehouse sobe em background; ao concluir, troca
  pelos dados frescos e muda o status para verde "atualizado".
- **Cuidado no Dashboard** (sua função é detectar falhas do pipeline): tornar o estado "atualizando"
  bem **visível** e **revalidar o dashboard primeiro** — não deixar status de falha desatualizado se
  passar por atual.
- **Nota:** isso deixa dados de negócio em repouso no `localStorage` do browser. Aceitável para
  ferramenta interna em máquina confiável; fica registrado aqui.

## Camada 3 — Idade dos dados + refresh em toda página; lock de staleness na edição
- **Em cada página:** "atualizado há X min/h" (tempo relativo, tick 1×/min) + botão **Atualizar**.
  - `lastUpdated` = quando a última query bem-sucedida da página concluiu; `refresh` = re-roda o load
    (mostra `warming` se o warehouse estiver frio).
- **Implementar como UM hook/componente compartilhado:** `useRefreshableQuery(fn)` →
  `{ data, loading, error, lastUpdated, refresh }`. Toda página de lista/detalhe se apoia nele
  (ver "Convenção" abaixo — é mudança de convenção).
- **Páginas somente leitura** (dashboard, ocorrências, transcrições, sumarizações): indicador +
  refresh, **sem lock**.
- **Páginas de edição** (recorrências, perfis): além do indicador + refresh, **lock por staleness**:
  - **Timer medido a partir do LOAD**, não da última interação — a idade do *baseline* é o que cria
    o risco; digitar não rejuvenesce o baseline.
  - Ao cruzar o limiar (**15 min**): **sempre desabilitar Salvar** + banner
    "estes dados têm 15+ min — recarregue antes de salvar".
  - **Form limpo** (sem edições): pode **congelar os campos** (cinza) e oferecer "Atualizar" em um
    clique (recarga é grátis, não há nada a perder).
  - **Form sujo** (com edições não salvas): **NÃO** congelar/limpar os campos silenciosamente. Manter
    o texto visível; "Recarregar" é escolha **explícita** que avisa que descarta alterações não
    salvas. Nunca destruir input digitado sem confirmação (ex.: o `prompt` grande de um perfil).
  - Resetar o timer em `refresh` bem-sucedido (o save navega para fora de qualquer forma).

---

## Forms sempre frescos (regra que sustenta o lock)
O `getX(id)` que popula um **form de edição** sempre lê do backend (bypass do cache SWR), aguardando
a leitura ao vivo (mostra `warming` se frio). A **lista** pode ser instant-from-cache; o **form do
qual se salva** sempre reflete o estado atual no momento do load.

## Decisão registrada: bounded last-write-wins
- O `UPDATE` escreve a **linha inteira** (full-row overwrite). Adotamos **last-write-wins** (opção 1):
  sem optimistic concurrency no MVP.
- O lock de staleness reduz a janela de clobber para **≤ 15 min** ("bounded last-write-wins"). **Não**
  é conflito-seguro (dois usuários editando a mesma linha dentro de 15 min ainda colidem), mas é barato
  e suficiente para baixa concorrência (ferramenta interna, equipe pequena).
- **Upgrades futuros se necessário:** (a) re-ler no submit e avisar se a linha mudou desde o load; ou
  (b) coluna de versão/`timestamp_atualizacao` com `UPDATE ... WHERE id = :id AND timestamp_atualizacao
  = :loaded_at` (precisa o proxy expor `num_affected_rows`). Atualizar este doc se adotado.

## Arquivos afetados
- `src/data/databricksClient.js` — pub/sub de status, cache SWR (`localStorage` por SQL+params),
  `warmUp()`, timing do limiar de cold start. Continua **sem lógica de entidade** (cache genérico).
- `src/App.jsx` — chama `warmUp()` no mount; renderiza `<ConnectionBanner>`.
- `src/components/ConnectionBanner.jsx` (novo) — status global: `warming` (+contador), `error`+retry.
- `src/hooks/useRefreshableQuery.js` (novo) — `{ data, loading, error, lastUpdated, refresh }`; base
  das páginas de lista/detalhe. Renderiza o "atualizado há X" + botão Atualizar (ou via um
  `<RefreshBar>` que o consome).
- Páginas de **edição** — lógica de lock por staleness ciente de dirty (campo "sujo").
- `src/styles.css` — estados `.refreshing`/`.stale` (amarelo), `.fresh` (verde), banner, campos
  cinza/disabled.

## Estados de borda
- **Cache vazio** (primeiro acesso, ou storage limpo): não há SWR — cai no baseline (`warming`).
- **Refresh com warehouse frio:** `warming` + contador; teto + retry.
- **Falha de query:** erro claro; se houver cache, permanece visível **marcado como possivelmente
  desatualizado** (não fingir que está fresco).
- **Form sujo cruzando o limiar:** avisar; nunca descartar input sem confirmação.

## Convenção (MUDANÇA — manter `CLAUDE.md` e `00-fundacao.md` em sincronia)
- **Antes:** cada página fazia `useState` + `useEffect` chamando `data/*` direto.
- **Agora:** páginas de **lista/detalhe** usam o hook compartilhado `useRefreshableQuery(fn)`
  (que entrega `data/loading/error/lastUpdated/refresh`). É **reuso de necessidade presente** (toda
  página precisa de refresh + idade dos dados), não abstração especulativa — respeita a regra #1.
- **Forms de edição** continuam com seu próprio estado de campos controlados, mas: o **load inicial é
  fresco** (bypass de cache) e respeitam o **lock por staleness**.

## Critério de pronto
- Primeiro acesso com warehouse frio: shell aparece na hora; banner explica a espera com contador; ao
  subir, os dados carregam (sem o usuário achar que travou).
- Revisita: listas/dashboard aparecem na hora a partir do cache, marcadas "atualizando", e viram
  "atualizado" quando o fresco chega.
- Toda página mostra "atualizado há X" + botão Atualizar funcionando (refresh re-roda o load).
- Página de edição após 15 min: **Salvar** desabilitado + aviso; form limpo congela e oferece
  recarregar; form sujo preserva o texto e exige confirmação para recarregar.
- Nenhuma escrita parte de dados com idade acima do limiar.
