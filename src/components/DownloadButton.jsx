// Download puramente client-side: gera um Blob a partir do texto ja carregado e dispara o save.
export default function DownloadButton({ filename, content, mime = 'text/plain', label = 'Baixar' }) {
  function handleClick() {
    const blob = new Blob([content ?? ''], { type: `${mime};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
  return (
    <button type="button" onClick={handleClick} disabled={!content}>
      {label}
    </button>
  )
}
