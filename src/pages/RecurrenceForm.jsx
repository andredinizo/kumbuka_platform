import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Field from '../components/Field.jsx'
import Form from '../components/Form.jsx'
import {
  getRecurrence,
  createRecurrence,
  updateRecurrence,
} from '../data/recurrences.js'

const EMPTY = { nome: '', serie_ativa: false, descricao: '', local_gravacao: '' }

export default function RecurrenceForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [values, setValues] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    getRecurrence(id)
      .then(setValues)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key) => (val) => setValues((v) => ({ ...v, [key]: val }))

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
      <Form
        onSubmit={handleSubmit}
        onCancel={() => navigate('/recurrences')}
        saving={saving}
        error={error}
      >
        <Field label="Nome" required value={values.nome} onChange={set('nome')} />
        <Field label="Ativa" type="checkbox" value={values.serie_ativa} onChange={set('serie_ativa')} />
        <Field label="Descrição" type="textarea" value={values.descricao} onChange={set('descricao')} />
        <Field label="Local da gravação" value={values.local_gravacao} onChange={set('local_gravacao')} />
      </Form>
    </div>
  )
}
