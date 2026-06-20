'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { COLOR_PALETTE } from '@/types'
import type { SiteConfig, SiteTemplate, CorPrimaria } from '@/types'

const TEMPLATES: { id: SiteTemplate; label: string; desc: string; emoji: string }[] = [
  { id: 'minimalista',   label: 'Minimalista',   desc: 'Clean, foco em texto e missão', emoji: '✦' },
  { id: 'comunitario',   label: 'Comunitário',   desc: 'Hero grande, galeria em destaque', emoji: '🤝' },
  { id: 'institucional', label: 'Institucional', desc: 'Estruturado e profissional', emoji: '🏛️' },
  { id: 'colorido',      label: 'Colorido',      desc: 'Vibrante, para projetos jovens', emoji: '🎨' },
  { id: 'galeria',       label: 'Galeria',       desc: 'Fotos em destaque, visual forte', emoji: '📸' },
]

interface Props {
  config: SiteConfig | null
}

export default function AparenciaForm({ config }: Props) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [template, setTemplate] = useState<SiteTemplate>(config?.template_id || 'comunitario')
  const [cor, setCor] = useState<CorPrimaria>(config?.cor_primaria || 'azul-oceano')
  const [publicado, setPublicado] = useState(config?.publicado ?? false)
  const [logoUrl, setLogoUrl] = useState(config?.logo_url || '')

  const selectedColors = COLOR_PALETTE[cor]

  async function handleSave() {
    setLoading(true)
    try {
      await fetch('/api/admin/site/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: template, cor_primaria: cor, publicado, logo_url: logoUrl || null }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Templates */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Layout do site</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              className={`relative p-4 rounded-xl border-2 text-left transition ${
                template === t.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {template === t.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
              <span className="text-2xl block mb-2">{t.emoji}</span>
              <p className="text-sm font-semibold text-gray-900">{t.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cores */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Paleta de cores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.entries(COLOR_PALETTE) as [CorPrimaria, typeof COLOR_PALETTE[CorPrimaria]][]).map(([key, val]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCor(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-xs font-medium transition ${
                cor === key ? 'border-gray-900' : 'border-transparent hover:border-gray-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: val.primary }} />
              <span className="truncate">{val.label}</span>
            </button>
          ))}
        </div>

        {/* Preview da cor selecionada */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-10 rounded-xl" style={{ backgroundColor: selectedColors.primary }} />
          <div className="flex-1 h-10 rounded-xl" style={{ backgroundColor: selectedColors.secondary }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">Cor principal · Cor de destaque</p>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Logo</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL do logo</label>
          <input
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            placeholder="https://... (PNG, SVG ou JPG)"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Faça upload da imagem no Storage do Supabase e cole o link público aqui.
          </p>
        </div>
        {logoUrl && (
          <div className="mt-4 flex items-center gap-3">
            <img src={logoUrl} alt="Logo preview" className="h-12 w-auto object-contain rounded border border-gray-200 p-1" />
            <button onClick={() => setLogoUrl('')} className="text-xs text-red-500 hover:text-red-600">Remover</button>
          </div>
        )}
      </div>

      {/* Publicação */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Visibilidade</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setPublicado(v => !v)}
            className={`relative w-11 h-6 rounded-full transition ${publicado ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${publicado ? 'translate-x-5' : ''}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{publicado ? 'Site publicado' : 'Site não publicado'}</p>
            <p className="text-xs text-gray-500">
              {publicado ? 'Visitantes podem ver seu site' : 'Apenas você vê enquanto não publicar'}
            </p>
          </div>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {saved ? <><Check size={15} /> Salvo!</> : 'Salvar aparência'}
        </button>
      </div>
    </div>
  )
}
