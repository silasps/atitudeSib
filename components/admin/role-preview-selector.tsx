'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { setAdminPreviewRole, clearAdminPreviewRole } from '@/lib/actions/admin-preview-role'
import { PREVIEW_ROLES } from '@/lib/rbac'
import type { UserRole } from '@/types'

export function RolePreviewSelector({ currentPreview }: { currentPreview: UserRole | null }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function select(role: UserRole) {
    if (role === currentPreview) return
    startTransition(async () => {
      await setAdminPreviewRole(role)
      router.refresh()
    })
  }

  function clear() {
    startTransition(async () => {
      await clearAdminPreviewRole()
      router.refresh()
    })
  }

  return (
    <div className="px-3 py-2.5 border-b border-gray-100">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
        Visualizar como
      </p>
      <div className="flex gap-1 flex-wrap items-center">
        {PREVIEW_ROLES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => select(value)}
            disabled={isPending}
            title={PREVIEW_ROLES.find(r => r.value === value)?.desc}
            className={`text-xs px-2.5 py-1 rounded-md transition font-medium ${
              currentPreview === value
                ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
        {currentPreview && (
          <button
            onClick={clear}
            disabled={isPending}
            title="Voltar para Super Admin"
            className="text-xs p-1 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
