// Badge colorido para valores de status do pipeline.
const COLOR = {
  pendente: '#6b7280',
  processando: '#2563eb',
  obtido: '#16a34a',
  concluido: '#16a34a',
  concluida: '#16a34a',
  entregue: '#16a34a',
  vazio: '#ca8a04',
  falhou: '#dc2626',
}

export default function StatusBadge({ value }) {
  if (!value) return <span className="muted">—</span>
  const color = COLOR[value] || '#6b7280'
  return (
    <span className="badge" style={{ background: color }}>
      {value}
    </span>
  )
}
