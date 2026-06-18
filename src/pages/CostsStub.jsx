export default function CostsStub() {
  return (
    <div>
      <h2>Custos da plataforma</h2>
      <div className="detail">
        <p><strong>Em breve.</strong></p>
        <p className="muted">
          Ainda não há fonte de dados de custos no modelo (ver feature 11 no plano-mestre).
          Quando existir uma lista de custos, basta implementar <code>listCosts()</code> em
          <code> src/data/costs.js</code> e construir esta página seguindo o padrão das demais listas.
        </p>
      </div>
    </div>
  )
}
