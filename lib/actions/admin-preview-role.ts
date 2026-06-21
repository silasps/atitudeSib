'use server'

import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import type { UserRole } from '@/types'

const COOKIE = 'os_admin_preview_role'
const OPTS = { path: '/admin', httpOnly: true, sameSite: 'lax' as const }
const PREVIEWABLE: UserRole[] = ['admin', 'funcionario']

export async function setAdminPreviewRole(role: string) {
  const session = await getSession()
  if (!session || session.profile.role !== 'superadmin') return
  if (!PREVIEWABLE.includes(role as UserRole)) return
  const store = await cookies()
  store.set(COOKIE, role, OPTS)
}

export async function clearAdminPreviewRole() {
  const session = await getSession()
  if (!session || session.profile.role !== 'superadmin') return
  const store = await cookies()
  store.delete(COOKIE)
}
