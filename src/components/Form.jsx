// Wrapper de formulario: chrome de submit/cancelar/erro/saving. Os campos (Field) vem como children.
// `frozen` congela (desabilita + ofusca) todos os campos via <fieldset disabled>; `submitDisabled`
// trava só o Salvar (usado pelo lock de staleness — ver 08-conexao-warehouse.md).
export default function Form({
  onSubmit,
  onCancel,
  saving,
  error,
  children,
  submitLabel = 'Salvar',
  frozen = false,
  submitDisabled = false,
}) {
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <fieldset className="form-fields" disabled={frozen}>
        {children}
      </fieldset>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={saving || submitDisabled}>
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
