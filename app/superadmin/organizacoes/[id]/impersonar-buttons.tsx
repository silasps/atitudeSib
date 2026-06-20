'use client'

import { useState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import type { UserRole } from '@/types'

const ROLES: { role: UserRole; label: string; href: string }[] = [
  { role: 'admin', label: 'Admin', href: '/admin' },
  { role: 'professor', label: 'Professor', href: '/professor' },
]

export default function ImpersonarButtons({ orgId, orgNome }: { orgId: string; orgNome: string }) {
  const [loading, setLoading] = useState<UserRole | null>(null)

  async function handleImpersonate(role: UserRole, href: string) {
    setLoading(role)
    try {
      await fetch('/api/superadmin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, role }),
      })
      window.location.href = href
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {ROLES.map(({ role, label, href }) => (
        <button
          key={role}
          onClick={() => handleImpersonate(role, href)}
          disabled={!!loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/30 border border-blue-500/40 text-blue-300 text-sm font-medium rounded-lg hover:bg-blue-600/50 transition disabled:opacity-50"
        >
          {loading === role ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          Entrar como {label}
        </button>
      ))}
      <p className="w-full text-xs text-gray-500 mt-1">
        Você verá a plataforma de <strong className="text-gray-400">{orgNome}</strong> como superadmin. Um banner de aviso será exibido.
      </p>
    </div>
  )
}
