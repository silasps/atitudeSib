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
    <div className="fixed top-0 inset-x-0 z-50 bg-amber-400 text-amber-950 px-4 py-2 flex items-center justify-between text-sm font-medium shadow">
      <div className="flex items-center gap-2">
        <Eye size={15} />
        Modo de visualização —{' '}
        <strong className="ml-0.5">{ROLE_LABELS[previewRole]}</strong>
      </div>
      <button
        onClick={handleClear}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/20 hover:bg-amber-950/30 rounded-lg transition text-xs"
      >
        {isPending ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
        Sair do preview
      </button>
    </div>
  )
}
