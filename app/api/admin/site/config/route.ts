import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getSession, isAdmin } from '@/lib/auth'

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session || !isAdmin(session.profile.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const supabase = await createClient()
  const orgId = session.profile.org_id

  const { error } = await supabase
    .from('site_config')
    .upsert({ org_id: orgId, ...body }, { onConflict: 'org_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
