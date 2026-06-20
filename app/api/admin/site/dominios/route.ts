import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getSession, isAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || !isAdmin(session.profile.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { domain } = await request.json()
  if (!domain) return NextResponse.json({ error: 'Domínio obrigatório' }, { status: 400 })

  const cleaned = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

  const supabase = await createClient()

  const { error } = await supabase.from('custom_domains').insert({
    org_id: session.profile.org_id,
    domain: cleaned,
    verificado: false,
  })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Este domínio já está cadastrado' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
