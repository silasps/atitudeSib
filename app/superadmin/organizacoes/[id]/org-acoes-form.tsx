'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { Organization } from '@/types'

const PLANOS = ['free', 'basico', 'profissional', 'enterprise']

export default function OrgAcoesForm({ org }: { org: Organization }) {
  const router = useRouter()
  const [plano, setPlano] = useState(org.plano)
  const [ativo, setAtivo] = useState(org.ativo)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleSave() {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/superadmin/organizacoes/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano, ativo }),
      })
      if (!res.ok) throw new Error()
      setMsg('Salvo com sucesso!')
      router.refresh()
    } catch {
      setMsg('Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-6 items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Plano</label>
          <select
            value={plano}
            onChange={e => setPlano(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PLANOS.map(p => (
              <option key={p} value={p} className="bg-gray-900">{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Status</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAtivo(true)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${ativo ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
            >
              Ativa
            </button>
            <button
              type="button"
              onClick={() => setAtivo(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${!ativo ? 'bg-red-700 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
            >
              Inativa
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Salvar
        </button>
      </div>

      {msg && (
        <p className={`text-sm ${msg.includes('Erro') ? 'text-red-400' : 'text-emerald-400'}`}>{msg}</p>
      )}
    </div>
  )
}
