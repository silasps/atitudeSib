'use client'

import { useCallback, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import { Upload, X, Check, Loader2, ImageIcon, ZoomIn, ZoomOut } from 'lucide-react'

interface Props {
  currentUrl: string | null
  onSaved: (url: string) => void
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas empty')), 'image/webp', 0.9)
  )
}

export function LogoUploader({ currentUrl, onSaved }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [modalSrc, setModalSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [error, setError] = useState<string | null>(null)

  function openPicker() {
    setError(null)
    inputRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Selecione uma imagem (PNG, JPG, SVG ou WebP)'); return }
    const reader = new FileReader()
    reader.onload = () => { setModalSrc(reader.result as string); setZoom(1); setCrop({ x: 0, y: 0 }) }
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
      form.append('file', new File([blob], 'logo.webp', { type: 'image/webp' }))

      const res = await fetch('/api/admin/site/logo', { method: 'POST', body: form })
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
    setPreview(null)
    onSaved('')
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {/* Estado atual */}
      {preview ? (
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden p-2">
            <img src={preview} alt="Logo atual" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={openPicker}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Upload size={14} />
              Trocar logo
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-red-500 hover:text-red-700 transition text-left"
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-gray-400 hover:bg-gray-50 transition"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <ImageIcon size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700">Clique para enviar o logo</p>
          <p className="text-xs text-gray-400">PNG, JPG, SVG ou WebP · máx. 5MB</p>
        </button>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {/* Modal de corte */}
      {modalSrc && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/60 shrink-0">
            <button
              type="button"
              onClick={() => setModalSrc(null)}
              className="text-white/70 hover:text-white transition p-1"
            >
              <X size={22} />
            </button>
            <p className="text-white text-sm font-medium">Ajustar logo</p>
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

          {/* Área de corte */}
          <div className="relative flex-1">
            <Cropper
              image={modalSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { background: '#1a1a1a' },
                cropAreaStyle: { borderRadius: 12 },
              }}
            />
          </div>

          {/* Controles de zoom */}
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

          <p className="text-center text-white/40 text-xs pb-3 shrink-0">
            Arraste para reposicionar · Pinça para zoom
          </p>
        </div>
      )}
    </>
  )
}
