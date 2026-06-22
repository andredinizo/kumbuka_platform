import { useState } from 'react'

// Logo da marca na navbar + easter egg: 10 cliques fazem o logo trincar (crack)
// e cair numa parabola (sobe pra direita e despenca); no lugar fica um encaixe vazio.
// A queda usa dois elementos aninhados: o <span> carrega o X (linear) e o <img> carrega
// o Y (amostrado, ~t²) + rotacao — so assim a trajetoria e uma parabola de verdade.
// Estados: idle -> breaking -> broken. Fica "quebrado" ate o reload (sem reset).
const CLICKS_TO_BREAK = 9

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

export default function BrandLogo() {
  const [count, setCount] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | breaking | broken

  function handleClick() {
    if (phase !== 'idle') return // apos quebrar, cliques nao fazem nada
    const next = count + 1
    setCount(next)
    if (next >= CLICKS_TO_BREAK) {
      // Sem animacao longa para quem pediu menos movimento: vai direto ao quebrado.
      setPhase(prefersReducedMotion() ? 'broken' : 'breaking')
    }
  }

  // 'breaking' dispara crack -> queda. Quando o eixo Y da queda termina, fixa o quebrado.
  // (o evento borbulha do <img> para o <span> que tem o handler).
  function handleAnimationEnd(e) {
    if (e.animationName === 'brand-fly-y') setPhase('broken')
  }

  // Os 3 ultimos cliques antes de quebrar ganham um wabble crescente (8 -> 9 -> 10/crack).
  // A `key` muda a cada clique para reiniciar a animacao mesmo em cliques repetidos.
  const wobbleLevel = count === CLICKS_TO_BREAK - 2 ? 1 : count === CLICKS_TO_BREAK - 1 ? 2 : 0
  const breaking = phase === 'breaking'
  const broken = phase === 'broken'
  // No estado quebrado o logo vira so um "espacador" invisivel (visibility:hidden), mantendo
  // o slot do mesmo tamanho -> o icone quebrado (centralizado) NAO muda de lugar ao terminar a queda.
  const imgCls = breaking ? 'breaking' : broken ? 'spent' : wobbleLevel ? `wobble-${wobbleLevel}` : ''

  return (
    // stage: segura o slot fixo. O icone quebrado fica AQUI (fora do wrapper que anima o X),
    // atras do logo, centralizado e estavel entre 'breaking' e 'broken'.
    <span className="brand-stage">
      {(breaking || broken) && (
        <img
          className="brand-broken brand-broken-behind"
          src="/broken_file.png"
          alt=""
          aria-hidden="true"
          title="oops"
          draggable="false"
        />
      )}
      {/* wrapper: carrega o eixo X (translateX linear) durante a queda */}
      <span
        className={`brand-fly${breaking ? ' breaking' : ''}`}
        onAnimationEnd={handleAnimationEnd}
      >
        <img
          key={count}
          className={`brand-logo${imgCls ? ` ${imgCls}` : ''}`}
          src="/logo.png"
          alt="Kumbuk.ai"
          draggable="false"
          onClick={handleClick}
        />
      </span>
    </span>
  )
}
