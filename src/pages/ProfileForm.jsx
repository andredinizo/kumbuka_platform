import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Field from '../components/Field.jsx'
import Form from '../components/Form.jsx'
import { useStaleness } from '../hooks/useStaleness.js'
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
  const [loadedAt, setLoadedAt] = useState(null) // quando o baseline foi lido (fresco)
  const [dirty, setDirty] = useState(false)
  const stale = useStaleness(isEdit ? loadedAt : null)

  // Forms de edição carregam SEMPRE fresco (sem cache), para o baseline refletir o estado atual.
  function load() {
    setLoading(true)
    setError(null)
    getProfile(id)
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
      if (isEdit) await updateProfile(id, values)
      else await createProfile(values)
      navigate(values.serie_id ? `/profiles?serie_id=${values.serie_id}` : '/profiles')
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
      <h2>{isEdit ? 'Editar perfil' : 'Novo perfil'}</h2>
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
        onCancel={() => navigate('/profiles')}
        saving={saving}
        error={error}
        frozen={stale && !dirty}
        submitDisabled={stale}
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
