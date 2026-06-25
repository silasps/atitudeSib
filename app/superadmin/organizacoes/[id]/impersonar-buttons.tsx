'use client'

import { useState, useRef, useEffect } from 'react'
import { Eye, ChevronDown, Loader2, ShieldCheck } from 'lucide-react'
import type { UserRole } from '@/types'

const ROLES: { role: UserRole; label: string; desc: string; href: string }[] = [
  { role: 'admin',     label: 'Administrador', desc: 'Painel completo da organização', href: '/admin' },
  { role: 'professor', label: 'Professor',      desc: 'Turmas e comunicados',          href: '/professor' },
]

export default function ImpersonarButtons({ orgId, orgNome }: { orgId: string; orgNome: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<UserRole | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleImpersonate(role: UserRole, href: string) {
    setLoading(role)
    setOpen(false)
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
    <div className="flex items-start gap-4 flex-wrap">
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          disabled={!!loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm font-medium rounded-xl hover:bg-blue-600/30 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
          <span>Simular acesso como</span>
          <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-2 w-60 bg-gray-900 rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/10">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                Simular visão de:
              </p>
            </div>
            <div className="py-1">
              {ROLES.map(({ role, label, desc, href }) => (
                <button
                  key={role}
                  onClick={() => handleImpersonate(role, href)}
                  disabled={!!loading}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                >
                  <ShieldCheck size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-600 self-center">
        Acessando como <strong className="text-gray-400">{orgNome}</strong> — banner de aviso será exibido.
      </p>
    </div>
  )
}
