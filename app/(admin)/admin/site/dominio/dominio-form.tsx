'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, Clock, ExternalLink } from 'lucide-react'
import type { CustomDomain } from '@/types'

interface Props { dominios: CustomDomain[] }

export default function DominioForm({ dominios }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [domain, setDomain] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/site/dominios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setDomain('')
      router.refresh()
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Adicionar domínio */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Adicionar domínio</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            value={domain}
            onChange={e => setDomain(e.target.value.toLowerCase())}
            placeholder="meusite.org.br"
            required
            className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shrink-0">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Adicionar
          </button>
        </form>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* Instruções DNS */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Como configurar seu DNS</h3>
        <ol className="text-sm text-blue-800 space-y-1.5">
          <li>1. Adicione o domínio acima</li>
          <li>2. Acesse o painel do seu provedor de DNS (Registro.br, Cloudflare, etc.)</li>
          <li>3. Crie um registro <strong>CNAME</strong> apontando para: <code className="bg-blue-100 px-1 rounded font-mono text-xs">ostricksocial.com.br</code></li>
          <li>4. Aguarde até 24h para propagação do DNS</li>
          <li>5. O status mudará para &ldquo;Verificado&rdquo; automaticamente na próxima visita ao domínio</li>
        </ol>
      </div>

      {/* Domínios cadastrados */}
      {dominios.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Domínios cadastrados</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {dominios.map((d: CustomDomain) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  {d.verificado ? (
                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  ) : (
                    <Clock size={18} className="text-yellow-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.domain}</p>
                    <p className="text-xs text-gray-400">{d.verificado ? 'Verificado e ativo' : 'Aguardando verificação DNS'}</p>
                  </div>
                </div>
                {d.verificado && (
                  <a href={`https://${d.domain}`} target="_blank" rel="noreferrer"
                    className="text-blue-500 hover:text-blue-600">
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
