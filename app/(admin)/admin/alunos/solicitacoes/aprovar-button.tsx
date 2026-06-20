'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function AprovarSolicitacaoButton({
  solicitacaoId,
  nome,
}: {
  solicitacaoId: string
  nome: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<'aprovar' | 'recusar' | null>(null)

  async function handleAction(acao: 'aprovar' | 'recusar') {
    setLoading(acao)
    try {
      await fetch(`/api/admin/solicitacoes/${solicitacaoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => handleAction('aprovar')}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading === 'aprovar' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
        Aprovar
      </button>
      <button
        onClick={() => handleAction('recusar')}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded-lg hover:bg-red-200 transition disabled:opacity-50"
      >
        {loading === 'recusar' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
        Recusar
      </button>
    </div>
  )
}
