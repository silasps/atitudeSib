import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.profile.role !== 'superadmin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  const updates: Record<string, string> = { updated_at: new Date().toISOString() }
  if (body.status !== undefined) updates.status = body.status
  if (body.solucao !== undefined) updates.solucao = body.solucao

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('sugestoes_melhoria')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.profile.role !== 'superadmin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('sugestoes_melhoria')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
