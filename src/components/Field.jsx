// Campo de formulario reutilizavel. type: 'text' | 'textarea' | 'checkbox'.
export default function Field({ label, type = 'text', value, onChange, required, rows = 4 }) {
  return (
    <label className="field">
      <span className="field-label">
        {label} {required && <span className="req">*</span>}
      </span>
      {type === 'textarea' ? (
        <textarea
          value={value ?? ''}
          rows={rows}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : type === 'checkbox' ? (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
      ) : (
        <input
          type="text"
          value={value ?? ''}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  )
}
