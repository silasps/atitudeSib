'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, ChevronDown, Check, Loader2 } from 'lucide-react'
import { setAdminPreviewRole, clearAdminPreviewRole } from '@/lib/actions/admin-preview-role'
import { PREVIEW_ROLES, ROLE_LABELS } from '@/lib/rbac'
import type { UserRole } from '@/types'

export function RolePreviewDropdown({ currentPreview }: { currentPreview: UserRole | null }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function select(role: UserRole) {
    setOpen(false)
    if (role === currentPreview) return
    startTransition(async () => {
      await setAdminPreviewRole(role)
      router.refresh()
    })
  }

  function clear() {
    setOpen(false)
    startTransition(async () => {
      await clearAdminPreviewRole()
      router.refresh()
    })
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm font-medium transition-colors ${
          currentPreview
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
      >
        {isPending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Eye size={14} />
        )}
        <span>{currentPreview ? ROLE_LABELS[currentPreview] : 'Visualizar como'}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              Simular visão de:
            </p>
          </div>
          <div className="py-1">
            {PREVIEW_ROLES.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => select(value)}
                disabled={isPending}
                title={desc}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
              >
                <span>{label}</span>
                {currentPreview === value && <Check size={14} className="text-blue-600 shrink-0" />}
              </button>
            ))}
            {currentPreview && (
              <>
                <div className="mx-4 my-1 border-t border-gray-100" />
                <button
                  onClick={clear}
                  disabled={isPending}
                  className="w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 transition text-left"
                >
                  Voltar para Super Admin
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
