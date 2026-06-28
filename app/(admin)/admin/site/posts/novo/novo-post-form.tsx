'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { SiteImageUploader } from '../../_components/site-image-uploader'

export default function NovoPostForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    titulo: '', conteudo: '', imagem_url: '', categoria: 'projeto', publicado: false,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/site/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/admin/site/posts')
      router.refresh()
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required placeholder="Título da publicação" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} className={inputClass}>
            <option value="projeto">Projeto</option>
            <option value="noticia">Notícia</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de capa</label>
          <SiteImageUploader
            currentUrl={form.imagem_url}
            slot="post-capa"
            aspect={16 / 9}
            modalTitle="Ajustar imagem de capa"
            hint="PNG, JPG ou WebP · máx. 8MB"
            description="Aparece como capa do card de projeto/notícia no site. Tamanho ideal: 1200×675 px."
            exampleImage="/site-examples/post.svg"
            onSaved={url => setForm(f => ({ ...f, imagem_url: url }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
          <textarea value={form.conteudo} onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))} rows={8} placeholder="Descreva o projeto ou a notícia..." className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={form.publicado} onChange={e => setForm(f => ({ ...f, publicado: e.target.checked }))} className="w-4 h-4 rounded accent-blue-600" />
          <span className="text-sm text-gray-700">Publicar imediatamente</span>
        </label>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">{error}</div>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
          {loading && <Loader2 size={15} className="animate-spin" />}
          Salvar publicação
        </button>
        <a href="/admin/site/posts" className="px-5 py-2.5 text-gray-500 hover:text-gray-700 text-sm transition">Cancelar</a>
      </div>
    </form>
  )
}
