import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-server'
import { getSession, isAdmin } from '@/lib/auth'

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session || !isAdmin(session.profile.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const cookieStore = await cookies()
  const impOrgId = cookieStore.get('sa_imp_org_id')?.value
  const orgId = (session.profile.role === 'superadmin' && impOrgId)
    ? impOrgId
    : session.profile.org_id

  if (!orgId) {
    return NextResponse.json({ error: 'Organização não identificada' }, { status: 400 })
  }

  const body = await request.json()
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('site_config')
    .upsert({ org_id: orgId, ...body }, { onConflict: 'org_id' })

  if (error) {
    console.error('[site/config PATCH]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
