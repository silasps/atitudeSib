'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import type { SiteConfig } from '@/types'

interface Props { config: SiteConfig | null }

export default function ConteudoForm({ config }: Props) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    hero_titulo: config?.hero_titulo || '',
    hero_subtitulo: config?.hero_subtitulo || '',
    hero_cta_texto: config?.hero_cta_texto || 'Saiba mais',
    hero_imagem_url: config?.hero_imagem_url || '',
    sobre_titulo: config?.sobre_titulo || 'Quem Somos',
    sobre_texto: config?.sobre_texto || '',
    sobre_imagem_url: config?.sobre_imagem_url || '',
    missao: config?.missao || '',
    contato_email: config?.contato?.email || '',
    contato_telefone: config?.contato?.telefone || '',
    contato_endereco: config?.contato?.endereco || '',
    contato_whatsapp: config?.contato?.whatsapp || '',
    redes_instagram: config?.redes_sociais?.instagram || '',
    redes_facebook: config?.redes_sociais?.facebook || '',
    redes_youtube: config?.redes_sociais?.youtube || '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    setLoading(true)
    try {
      await fetch('/api/admin/site/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_titulo: form.hero_titulo,
          hero_subtitulo: form.hero_subtitulo,
          hero_cta_texto: form.hero_cta_texto,
          hero_imagem_url: form.hero_imagem_url || null,
          sobre_titulo: form.sobre_titulo,
          sobre_texto: form.sobre_texto,
          sobre_imagem_url: form.sobre_imagem_url || null,
          missao: form.missao,
          contato: {
            email: form.contato_email,
            telefone: form.contato_telefone,
            endereco: form.contato_endereco,
            whatsapp: form.contato_whatsapp,
          },
          redes_sociais: {
            instagram: form.redes_instagram,
            facebook: form.redes_facebook,
            youtube: form.redes_youtube,
          },
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Seção Principal (Hero)</h2>
        <div>
          <label className={labelClass}>Título principal</label>
          <input value={form.hero_titulo} onChange={e => set('hero_titulo', e.target.value)} placeholder="Nome do projeto" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Subtítulo</label>
          <input value={form.hero_subtitulo} onChange={e => set('hero_subtitulo', e.target.value)} placeholder="Uma frase que resume o que fazemos" className={inputClass} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Texto do botão</label>
            <input value={form.hero_cta_texto} onChange={e => set('hero_cta_texto', e.target.value)} placeholder="Saiba mais" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Imagem de fundo (URL)</label>
            <input value={form.hero_imagem_url} onChange={e => set('hero_imagem_url', e.target.value)} placeholder="https://..." className={inputClass} />
          </div>
        </div>
      </section>

      {/* Sobre nós */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Seção Sobre Nós</h2>
        <div>
          <label className={labelClass}>Título da seção</label>
          <input value={form.sobre_titulo} onChange={e => set('sobre_titulo', e.target.value)} placeholder="Quem Somos" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Texto</label>
          <textarea value={form.sobre_texto} onChange={e => set('sobre_texto', e.target.value)} rows={5} placeholder="Conte a história e o propósito da organização..." className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div>
          <label className={labelClass}>Imagem (URL)</label>
          <input value={form.sobre_imagem_url} onChange={e => set('sobre_imagem_url', e.target.value)} placeholder="https://..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Missão</label>
          <textarea value={form.missao} onChange={e => set('missao', e.target.value)} rows={2} placeholder="Nossa missão é..." className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
      </section>

      {/* Contato */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contato</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={form.contato_email} onChange={e => set('contato_email', e.target.value)} placeholder="contato@org.com" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input value={form.contato_telefone} onChange={e => set('contato_telefone', e.target.value)} placeholder="(41) 99999-9999" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>WhatsApp (número com DDD)</label>
            <input value={form.contato_whatsapp} onChange={e => set('contato_whatsapp', e.target.value)} placeholder="5541999991234" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Endereço</label>
            <input value={form.contato_endereco} onChange={e => set('contato_endereco', e.target.value)} placeholder="Rua..." className={inputClass} />
          </div>
        </div>
      </section>

      {/* Redes sociais */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Redes Sociais</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Instagram (URL)</label>
            <input value={form.redes_instagram} onChange={e => set('redes_instagram', e.target.value)} placeholder="https://instagram.com/..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Facebook (URL)</label>
            <input value={form.redes_facebook} onChange={e => set('redes_facebook', e.target.value)} placeholder="https://facebook.com/..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>YouTube (URL)</label>
            <input value={form.redes_youtube} onChange={e => set('redes_youtube', e.target.value)} placeholder="https://youtube.com/..." className={inputClass} />
          </div>
        </div>
      </section>

      <button
        onClick={handleSave} disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {saved ? <><Check size={15} /> Salvo!</> : 'Salvar conteúdo'}
      </button>
    </div>
  )
}
