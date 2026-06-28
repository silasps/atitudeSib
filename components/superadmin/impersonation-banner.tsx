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
    <div className="fixed top-0 left-0 right-0 z-50 h-8 bg-amber-500 text-amber-950 px-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-1.5 min-w-0">
        <ShieldAlert size={13} className="shrink-0" />
        <span className="text-xs font-semibold truncate">
          <span className="hidden sm:inline">Simulando como superadmin · </span>
          <strong>{orgNome}</strong>
        </span>
      </div>
      <button
        onClick={handleSair}
        disabled={loading}
        className="shrink-0 flex items-center gap-1 ml-3 px-2 py-0.5 bg-amber-950/15 hover:bg-amber-950/25 rounded transition text-xs font-medium"
      >
        {loading ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
        <span className="hidden sm:inline">Sair</span>
      </button>
    </div>
  )
}
