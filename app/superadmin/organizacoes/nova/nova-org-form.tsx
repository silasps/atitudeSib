'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function NovaOrgForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nome: '',
    slug: '',
    cnpj: '',
    plano: 'free',
    adminNome: '',
    adminEmail: '',
    adminSenha: '',
  })

  function handleNomeChange(nome: string) {
    const slug = nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setForm(f => ({ ...f, nome, slug }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/superadmin/organizacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao criar organização')
        return
      }

      router.push('/superadmin/organizacoes')
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados da organização */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Dados da organização
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Nome da organização *</label>
            <input
              value={form.nome}
              onChange={e => handleNomeChange(e.target.value)}
              required
              placeholder="Associação Atitude"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Slug (subdomínio) *</label>
            <div className="flex items-center min-w-0">
              <input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                required
                placeholder="atitude"
                className="flex-1 min-w-0 px-3 py-2.5 bg-white/5 border border-white/10 rounded-l-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
              <span className="shrink-0 px-2 py-2.5 bg-white/5 border border-l-0 border-white/10 rounded-r-lg text-xs text-gray-500 truncate max-w-[140px]">
                .ostricksocial.com.br
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">CNPJ</label>
            <input
              value={form.cnpj}
              onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))}
              placeholder="00.000.000/0000-00"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Plano</label>
            <select
              value={form.plano}
              onChange={e => setForm(f => ({ ...f, plano: e.target.value }))}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Administrador inicial */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Primeiro administrador
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome completo *</label>
            <input
              value={form.adminNome}
              onChange={e => setForm(f => ({ ...f, adminNome: e.target.value }))}
              required
              placeholder="Maria Silva"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email *</label>
            <input
              type="email"
              value={form.adminEmail}
              onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))}
              required
              placeholder="admin@atitude.org"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Senha inicial *</label>
            <input
              type="password"
              value={form.adminSenha}
              onChange={e => setForm(f => ({ ...f, adminSenha: e.target.value }))}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          Criar organização
        </button>
        <Link
          href="/superadmin/organizacoes"
          className="px-5 py-2.5 text-gray-400 hover:text-white text-sm transition"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
