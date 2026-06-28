'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, X, Loader2 } from 'lucide-react'
import { clearAdminPreviewRole } from '@/lib/actions/admin-preview-role'
import { ROLE_LABELS } from '@/lib/rbac'
import type { UserRole } from '@/types'

export function RolePreviewBanner({ previewRole }: { previewRole: UserRole }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClear() {
    startTransition(async () => {
      await clearAdminPreviewRole()
      router.refresh()
    })
  }

  return (
    <div className="fixed top-0 inset-x-0 z-50 h-8 bg-amber-400 text-amber-950 px-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-1.5 min-w-0">
        <Eye size={13} className="shrink-0" />
        <span className="text-xs font-semibold truncate">
          <span className="hidden sm:inline">Visualizando como </span>
          <strong>{ROLE_LABELS[previewRole]}</strong>
        </span>
      </div>
      <button
        onClick={handleClear}
        disabled={isPending}
        className="shrink-0 flex items-center gap-1 ml-3 px-2 py-0.5 bg-amber-950/15 hover:bg-amber-950/25 rounded transition text-xs font-medium"
      >
        {isPending ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
        <span className="hidden sm:inline">Sair</span>
      </button>
    </div>
  )
}
