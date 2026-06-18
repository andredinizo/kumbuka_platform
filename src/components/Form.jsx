// Wrapper de formulario: chrome de submit/cancelar/erro/saving. Os campos (Field) vem como children.
export default function Form({ onSubmit, onCancel, saving, error, children, submitLabel = 'Salvar' }) {
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {children}
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Salvando…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
