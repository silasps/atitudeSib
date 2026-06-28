import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'

export async function PATCH(req: Request) {
  const { profile } = await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  const body = await req.json()
  const { email_contato, telefone } = body

  const { error } = await supabase
    .from('organizations')
    .update({ email_contato: email_contato ?? null, telefone: telefone ?? null })
    .eq('id', profile.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
