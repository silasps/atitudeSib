'use client'

import { useState, useRef } from 'react'
import { X, Loader2, Plus, ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SiteImageUploader } from '../_components/site-image-uploader'

interface Foto {
  id: string
  titulo: string | null
  imagem_url: string
  descricao: string | null
}

interface Props {
  fotos: Foto[]
}

export default function GaleriaClient({ fotos: initialFotos }: Props) {
  const router = useRouter()
  const [fotos, setFotos] = useState<Foto[]>(initialFotos)
  const [showForm, setShowForm] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [titulo, setTitulo] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const counterRef = useRef(0)

  async function handleAdd() {
    if (!imageUrl) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/site/galeria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagem_url: imageUrl, titulo: titulo || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFotos(f => [data.foto, ...f])
      setImageUrl('')
      setTitulo('')
      setShowForm(false)
      counterRef.current++
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await fetch('/api/admin/site/galeria', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setFotos(f => f.filter(foto => foto.id !== id))
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Botão adicionar */}
      {!showForm && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gray-900 hover:bg-gray-800 transition"
          >
            <Plus size={16} />
            Adicionar foto
          </button>
        </div>
      )}

      {/* Formulário de nova foto */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Nova foto</h3>
            <button onClick={() => { setShowForm(false); setImageUrl(''); setTitulo(''); setError(null) }}
              className="text-gray-400 hover:text-gray-600 transition">
              <X size={18} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagem *</label>
            <SiteImageUploader
              key={counterRef.current}
              currentUrl={imageUrl}
              slot={`galeria-${Date.now()}`}
              aspect={1}
              modalTitle="Ajustar foto da galeria"
              hint="PNG, JPG ou WebP · máx. 8MB"
              description="Aparece quadrada na galeria do site. Tamanho ideal: 800×800 px."
              exampleImage="/site-examples/galeria.svg"
              onSaved={url => setImageUrl(url)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título (opcional)</label>
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Formatura 2024"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={!imageUrl || saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Adicionar à galeria
            </button>
            <button
              onClick={() => { setShowForm(false); setImageUrl(''); setTitulo(''); setError(null) }}
              className="px-5 py-2.5 text-gray-500 hover:text-gray-700 text-sm transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Grid de fotos */}
      {fotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon size={40} className="text-gray-300 mb-4" />
          <h3 className="text-gray-700 font-medium mb-1">Nenhuma foto na galeria</h3>
          <p className="text-gray-400 text-sm max-w-sm">
            Adicione fotos para exibir na galeria do site público.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {fotos.map((foto) => (
            <div key={foto.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={foto.imagem_url}
                alt={foto.titulo || ''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {foto.titulo && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium truncate">{foto.titulo}</p>
                </div>
              )}
              <button
                onClick={() => handleDelete(foto.id)}
                disabled={deletingId === foto.id}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                {deletingId === foto.id
                  ? <Loader2 size={13} className="animate-spin" />
                  : <X size={13} />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
