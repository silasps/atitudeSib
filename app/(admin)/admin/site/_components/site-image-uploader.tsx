'use client'

import { useCallback, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import { Upload, X, Check, Loader2, ImageIcon, ZoomIn, ZoomOut } from 'lucide-react'

interface Props {
  currentUrl: string
  slot: string
  aspect?: number
  modalTitle?: string
  hint?: string
  description?: string
  exampleImage?: string
  onSaved: (url: string) => void
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.crossOrigin = 'anonymous'
    i.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas empty')), 'image/jpeg', 0.9)
  )
}

export function SiteImageUploader({
  currentUrl,
  slot,
  aspect = 16 / 9,
  modalTitle = 'Ajustar imagem',
  hint = 'PNG, JPG ou WebP · máx. 8MB',
  description,
  exampleImage,
  onSaved,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [modalSrc, setModalSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>(currentUrl)
  const [error, setError] = useState<string | null>(null)

  function openPicker() {
    setError(null)
    inputRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem (PNG, JPG ou WebP)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setModalSrc(reader.result as string)
      setZoom(1)
      setCrop({ x: 0, y: 0 })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => { setCroppedArea(pixels) }, [])

  async function handleFinalize() {
    if (!modalSrc || !croppedArea) return
    setUploading(true)
    setError(null)
    try {
      const blob = await getCroppedBlob(modalSrc, croppedArea)
      const form = new FormData()
      form.append('file', new File([blob], `${slot}.jpg`, { type: 'image/jpeg' }))
      form.append('slot', slot)

      const res = await fetch('/api/admin/site/imagem', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao fazer upload')

      setPreview(data.url)
      onSaved(data.url)
      setModalSrc(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreview('')
    onSaved('')
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {preview ? (
        <div className="space-y-2">
          <div
            className="w-full h-36 rounded-xl border border-gray-200 bg-gray-100 overflow-hidden bg-cover bg-center relative group cursor-pointer"
            style={{ backgroundImage: `url(${preview})` }}
            onClick={openPicker}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow">
                <Upload size={13} /> Trocar imagem
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-red-500 hover:text-red-700 transition"
          >
            Remover
          </button>
        </div>
      ) : exampleImage ? (
        <button
          type="button"
          onClick={openPicker}
          className="w-full group relative rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition"
        >
          <img src={exampleImage} alt="Exemplo" className="w-full object-cover opacity-60 group-hover:opacity-50 transition" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/10 group-hover:bg-black/20 transition">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
              <ImageIcon size={20} className="text-gray-600" />
            </div>
            <span className="text-sm font-semibold text-white drop-shadow">Clique para enviar a imagem</span>
            <span className="text-xs text-white/80 drop-shadow">{hint}</span>
          </div>
          {description && (
            <div className="absolute bottom-0 inset-x-0 bg-black/50 px-3 py-2">
              <p className="text-xs text-blue-200 text-center leading-snug">{description}</p>
            </div>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-gray-400 hover:bg-gray-50 transition"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <ImageIcon size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700">Clique para enviar a imagem</p>
          <p className="text-xs text-gray-400">{hint}</p>
          {description && (
            <p className="text-xs text-blue-500 max-w-xs text-center leading-snug">{description}</p>
          )}
        </button>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {modalSrc && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="flex items-center justify-between px-4 py-3 bg-black/60 shrink-0">
            <button
              type="button"
              onClick={() => setModalSrc(null)}
              className="text-white/70 hover:text-white transition p-1"
            >
              <X size={22} />
            </button>
            <p className="text-white text-sm font-medium">{modalTitle}</p>
            <button
              type="button"
              onClick={handleFinalize}
              disabled={uploading}
              className="flex items-center gap-1.5 bg-white text-gray-900 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-60"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {uploading ? 'Salvando...' : 'Usar esta imagem'}
            </button>
          </div>

          <div className="relative flex-1">
            <Cropper
              image={modalSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape="rect"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { background: '#1a1a1a' },
                cropAreaStyle: { borderRadius: 8 },
              }}
            />
          </div>

          <div className="shrink-0 px-4 py-4 bg-black/60 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(1, z - 0.1))}
              className="text-white/70 hover:text-white transition p-1"
            >
              <ZoomOut size={20} />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="flex-1 accent-white"
            />
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(3, z + 0.1))}
              className="text-white/70 hover:text-white transition p-1"
            >
              <ZoomIn size={20} />
            </button>
            <span className="text-white/50 text-xs w-10 text-right">{Math.round(zoom * 100)}%</span>
          </div>

          <p className="text-center text-white/40 text-xs pb-1 shrink-0">
            Arraste para reposicionar · Pinça para zoom
          </p>
          {description && (
            <p className="text-center text-blue-300/70 text-xs pb-3 px-4 shrink-0">{description}</p>
          )}
        </div>
      )}
    </>
  )
}
