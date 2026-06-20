'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface Props { orgId: string; primaryColor: string }

export default function FacaParteForm({ orgId, primaryColor }: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '',
    data_nascimento: '', responsavel_nome: '', responsavel_telefone: '',
    mensagem: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/public/solicitacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId, tipo: 'aluno', ...form }),
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao enviar. Tente novamente.')
      }
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: primaryColor }} />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Solicitação enviada!</h3>
        <p className="text-gray-500 text-sm">
          Recebemos seu interesse. Em breve a equipe entrará em contato.
        </p>
      </div>
    )
  }

  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
        <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required placeholder="Nome do aluno" className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
          <input type="date" value={form.data_nascimento} onChange={e => setForm(f => ({ ...f, data_nascimento: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(41) 99999-9999" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do responsável</label>
        <input value={form.responsavel_nome} onChange={e => setForm(f => ({ ...f, responsavel_nome: e.target.value }))} placeholder="Para menores de 18 anos" className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do responsável</label>
        <input value={form.responsavel_telefone} onChange={e => setForm(f => ({ ...f, responsavel_telefone: e.target.value }))} placeholder="(41) 99999-9999" className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem (opcional)</label>
        <textarea value={form.mensagem} onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))} rows={3} placeholder="Algo mais que queira nos contar?" className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none" />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <button
        type="submit" disabled={loading}
        className="w-full py-3 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ backgroundColor: primaryColor }}
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? 'Enviando...' : 'Enviar solicitação'}
      </button>
    </form>
  )
}
