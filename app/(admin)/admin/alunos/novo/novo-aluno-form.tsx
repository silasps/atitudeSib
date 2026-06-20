'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function NovoAlunoForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome: '', data_nascimento: '', telefone: '', cpf: '',
    status: 'ativo',
    logradouro: '', numero: '', bairro: '', cidade: '', uf: '', cep: '',
    observacoes: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const endereco = {
      logradouro: form.logradouro,
      numero: form.numero,
      bairro: form.bairro,
      cidade: form.cidade,
      uf: form.uf,
      cep: form.cep,
    }

    try {
      const res = await fetch('/api/admin/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, endereco }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erro ao cadastrar aluno'); return }
      router.push('/admin/alunos')
      router.refresh()
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados pessoais */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Dados pessoais</h2>
        <div>
          <label className={labelClass}>Nome completo *</label>
          <input value={form.nome} onChange={e => set('nome', e.target.value)} required placeholder="Nome do aluno" className={inputClass} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Data de nascimento</label>
            <input type="date" value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>CPF</label>
            <input value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(41) 99999-9999" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputClass}>
              <option value="ativo">Ativo</option>
              <option value="aguardando">Aguardando</option>
              <option value="inativo">Inativo</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Endereço</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Logradouro</label>
            <input value={form.logradouro} onChange={e => set('logradouro', e.target.value)} placeholder="Rua, Avenida..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Número</label>
            <input value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="123" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Bairro</label>
            <input value={form.bairro} onChange={e => set('bairro', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cidade</label>
            <input value={form.cidade} onChange={e => set('cidade', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>CEP</label>
            <input value={form.cep} onChange={e => set('cep', e.target.value)} placeholder="00000-000" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className={labelClass}>Observações</label>
        <textarea
          value={form.observacoes} onChange={e => set('observacoes', e.target.value)}
          rows={3} placeholder="Informações adicionais..."
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          type="submit" disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          Cadastrar aluno
        </button>
        <a href="/admin/alunos" className="px-5 py-2.5 text-gray-500 hover:text-gray-700 text-sm transition">
          Cancelar
        </a>
      </div>
    </form>
  )
}
