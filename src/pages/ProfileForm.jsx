import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Field from '../components/Field.jsx'
import Form from '../components/Form.jsx'
import { getProfile, createProfile, updateProfile } from '../data/profiles.js'

const EMPTY = { serie_id: '', nome: '', descricao: '', versao: 1, perfil_ativo: false, prompt: '' }

export default function ProfileForm() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [values, setValues] = useState({ ...EMPTY, serie_id: params.get('serie_id') || '' })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    getProfile(id)
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
      if (isEdit) await updateProfile(id, values)
      else await createProfile(values)
      navigate(values.serie_id ? `/profiles?serie_id=${values.serie_id}` : '/profiles')
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  if (loading) return <p className="muted">Carregando…</p>

  return (
    <div>
      <h2>{isEdit ? 'Editar perfil' : 'Novo perfil'}</h2>
      <Form
        onSubmit={handleSubmit}
        onCancel={() => navigate('/profiles')}
        saving={saving}
        error={error}
      >
        <Field label="Recorrência (serie_id)" value={values.serie_id} onChange={set('serie_id')} />
        <Field label="Nome" required value={values.nome} onChange={set('nome')} />
        <Field label="Descrição" type="textarea" value={values.descricao} onChange={set('descricao')} />
        <Field label="Versão" value={values.versao} onChange={set('versao')} />
        <Field label="Ativo" type="checkbox" value={values.perfil_ativo} onChange={set('perfil_ativo')} />
        <Field label="Prompt" type="textarea" rows={12} value={values.prompt} onChange={set('prompt')} />
      </Form>
    </div>
  )
}
