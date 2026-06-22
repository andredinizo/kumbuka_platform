# 09 — Marca (logo), favicon e easter egg "logo quebra e cai"

## Objetivo
Dar identidade visual ao app: favicon na aba e o logo na navbar lateral, à direita do nome
"Kumbuk.ai". Mais um easter egg lúdico — clicar no logo 10 vezes faz ele trincar e cair da tela
como se tivesse quebrado, deixando um "encaixe vazio" no lugar até o reload.

## Rota
Cross-cutting (vive no layout/sidebar de `App.jsx`); não tem rota própria.

## Assets (o usuário fornece em `public/`)
- `public/logo.png` — logo da navbar (PNG com transparência; servido em `/logo.png`).
- `public/favicon.ico` — favicon (servido em `/favicon.ico`).
- O Vite serve `public/` na raiz, então basta referenciar por caminho absoluto — sem `import`.

## Layout
- **Favicon:** `<link rel="icon" type="image/x-icon" href="/favicon.ico" />` no `<head>` de
  `index.html`.
- **Navbar:** `.brand` vira uma linha flex: `<span class="brand-name">Kumbuk.ai</span>` +
  `<BrandLogo />`. O logo tem altura fixa (~24px), `width:auto`.

## Componente `src/components/BrandLogo.jsx`
Máquina de estados local (`useState`), sem libs:
- `count` (cliques) e `phase`: `idle | breaking | broken`.
- Estrutura: `<span className="brand-fly"> <img className="brand-logo" …/> </span>`. O `<span>`
  externo carrega o eixo **X** da queda; o `<img>` interno carrega **Y + rotação** (ver Estilos).
- **idle:** o `<img>` (`src="/logo.png"`, `draggable=false`) recebe `onClick`; o `onAnimationEnd`
  fica no `<span>` (o evento borbulha do `<img>`).
- Ao 10º clique (`CLICKS_TO_BREAK = 10`): `phase = 'breaking'` — exceto se
  `prefers-reduced-motion: reduce` casar, aí vai direto a `'broken'` (sem animação longa).
- **breaking:** a classe `breaking` é aplicada no `<span>` (anima X) e no `<img>` (crack → Y).
  Quando `onAnimationEnd` recebe `animationName === 'brand-fly-y'` (fim da queda), `phase = 'broken'`.
- **broken:** renderiza `<span className="brand-socket" aria-hidden>` no lugar do logo — o "buraco"
  com borda tracejada, um "parafuso" (`::before`) e uma "rachadura" (`::after`). Permanece até reload
  (sem timer, sem reset).

## Estilos (`src/styles.css`)
- `.brand` flex-row (`align-items:center`, `gap`, `min-height`); `.brand-name` com o tamanho/peso
  antigo do `.brand`.
- `.brand-logo` (altura fixa, `transform-origin: top center` para "tombar" do topo).
- **Queda parabólica em dois eixos aninhados** (uma parábola de verdade exige X linear + Y ~t²):
  - `.brand-fly` (wrapper) anima **`brand-fly-x`**: `translateX` com timing **`linear`** (velocidade
    horizontal constante — nunca trocar este timing, é o que garante a parábola).
  - `.brand-logo` anima **`brand-crack`** (climax do wabble) e em seguida **`brand-fly-y`**:
    `translateY` amostrado (sobe um tico e despenca acelerando) + rotação, ambos `forwards`.
  - X e Y usam a mesma duração/`delay` (`1.1s`/`0.15s`) para ficarem em sincronia; o `delay` encadeia
    depois do `brand-crack`.
- `.brand-socket` (+ `::before`/`::after`), em tons que combinam com a sidebar escura.
- `@media (prefers-reduced-motion: reduce)` neutraliza `.brand-logo.breaking` e `.brand-fly.breaking`.

## Estados de borda
- **Reduced motion:** sem animação; ao 10º clique vai direto ao estado quebrado.
- **Pós-quebra:** logo não volta nesta sessão; reload restaura o logo inteiro e zera o contador.
- **Sem easter egg:** cliques < 10 não têm efeito visível (o cursor não revela que é clicável).

## Critério de pronto
- Aba do browser mostra o favicon; logo aparece à direita de "Kumbuk.ai" na navbar.
- 10 cliques no logo: treme/racha → cai girando para fora da tela → fica o encaixe quebrado.
- O encaixe permanece até o reload; reload traz o logo de volta.
- Navegação/rotas inalteradas (a marca virou flex, nada mais mudou).
