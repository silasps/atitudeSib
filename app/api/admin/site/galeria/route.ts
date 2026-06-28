import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getSession, isAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || !isAdmin(session.profile.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const { titulo, imagem_url, descricao } = body

  if (!imagem_url) return NextResponse.json({ error: 'URL da imagem obrigatória' }, { status: 400 })

  const supabase = await createClient()

  const { data, error } = await supabase.from('site_galeria').insert({
    org_id: session.profile.org_id,
    titulo: titulo || null,
    imagem_url,
    descricao: descricao || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ foto: data }, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session || !isAdmin(session.profile.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const supabase = await createClient()

  const { error } = await supabase
    .from('site_galeria')
    .delete()
    .eq('id', id)
    .eq('org_id', session.profile.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
