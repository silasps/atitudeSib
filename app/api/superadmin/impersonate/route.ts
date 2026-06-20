import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'

const COOKIE_ORG = 'sa_imp_org_id'
const COOKIE_ROLE = 'sa_imp_role'
const COOKIE_OPTS = { path: '/', httpOnly: true, sameSite: 'lax' as const, maxAge: 60 * 60 * 4 }

export async function POST(req: NextRequest) {
  try {
    await requireRole(['superadmin'])
  } catch {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { orgId, role } = await req.json()
  if (!orgId || !role) return NextResponse.json({ error: 'orgId e role são obrigatórios' }, { status: 400 })

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_ORG, orgId, COOKIE_OPTS)
  res.cookies.set(COOKIE_ROLE, role, COOKIE_OPTS)
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_ORG)
  res.cookies.delete(COOKIE_ROLE)
  return res
}
