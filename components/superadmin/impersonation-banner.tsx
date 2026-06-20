'use client'

import { useState } from 'react'
import { ShieldAlert, X, Loader2 } from 'lucide-react'

export default function ImpersonationBanner({ orgNome }: { orgNome: string }) {
  const [loading, setLoading] = useState(false)

  async function handleSair() {
    setLoading(true)
    await fetch('/api/superadmin/impersonate', { method: 'DELETE' })
    window.location.href = '/superadmin'
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between text-sm font-medium shadow-lg">
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} />
        Você está simulando acesso como superadmin em <strong className="ml-1">{orgNome}</strong>
      </div>
      <button
        onClick={handleSair}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/20 hover:bg-amber-950/30 rounded-lg transition text-xs"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
        Sair da simulação
      </button>
    </div>
  )
}
