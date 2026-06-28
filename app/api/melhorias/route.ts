import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const pagina: string = body?.pagina?.trim()
  const descricao: string = body?.descricao?.trim()

  if (!pagina || !descricao) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from('sugestoes_melhoria').insert({
    user_id: session.profile.id,
    pagina,
    descricao,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
