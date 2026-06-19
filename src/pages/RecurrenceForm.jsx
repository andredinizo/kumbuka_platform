import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Field from '../components/Field.jsx'
import Form from '../components/Form.jsx'
import { useStaleness } from '../hooks/useStaleness.js'
import {
  getRecurrence,
  createRecurrence,
  updateRecurrence,
} from '../data/recurrences.js'

const EMPTY = { nome: '', recorrencia_ativa: false, descricao: '', local_gravacao: '' }

export default function RecurrenceForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [values, setValues] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [loadedAt, setLoadedAt] = useState(null) // quando o baseline foi lido (fresco)
  const [dirty, setDirty] = useState(false)
  const stale = useStaleness(isEdit ? loadedAt : null)

  // Forms de edição carregam SEMPRE fresco (sem cache), para o baseline refletir o estado atual.
  function load() {
    setLoading(true)
    setError(null)
    getRecurrence(id)
      .then((d) => {
        setValues(d)
        setLoadedAt(Date.now())
        setDirty(false)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => {
    if (isEdit) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit])

  const set = (key) => (val) => {
    setValues((v) => ({ ...v, [key]: val }))
    setDirty(true)
  }

  async function handleSubmit() {
    if (!values.nome.trim()) {
      setError('O nome é obrigatório.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (isEdit) await updateRecurrence(id, values)
      else await createRecurrence(values)
      navigate('/recurrences')
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  function reload() {
    if (dirty && !window.confirm('Recarregar vai descartar suas alterações não salvas. Continuar?')) {
      return
    }
    load()
  }

  if (loading) return <p className="muted">Carregando…</p>

  return (
    <div>
      <h2>{isEdit ? 'Editar recorrência' : 'Nova recorrência'}</h2>
      {isEdit && (
        <div className="toolbar">
          <Link className="btn" to={`/profiles?serie_id=${id}`}>Ver perfis</Link>
          <Link className="btn" to={`/occurrences?serie_id=${id}`}>Ver ocorrências</Link>
        </div>
      )}
      {stale && (
        <div className="conn-banner conn-warn">
          <span>
            Estes dados têm mais de 15 min.{' '}
            {dirty && 'Recarregar vai descartar suas alterações não salvas. '}
            Recarregue antes de salvar.
          </span>
          <button type="button" className="btn" onClick={reload}>Recarregar</button>
        </div>
      )}
      <Form
        onSubmit={handleSubmit}
        onCancel={() => navigate('/recurrences')}
        saving={saving}
        error={error}
        frozen={stale && !dirty}
        submitDisabled={stale}
      >
        <Field label="Nome" required value={values.nome} onChange={set('nome')} />
        <Field label="Ativa" type="checkbox" value={values.recorrencia_ativa} onChange={set('recorrencia_ativa')} />
        <Field label="Descrição" type="textarea" value={values.descricao} onChange={set('descricao')} />
        <Field label="Local da gravação" value={values.local_gravacao} onChange={set('local_gravacao')} />
      </Form>
    </div>
  )
}
