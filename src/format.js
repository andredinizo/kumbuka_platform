// Helpers de formatacao simples, compartilhados pelas paginas.
export function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleString('pt-BR')
}
