import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-server'
import { getSession } from '@/lib/auth'
import { canVerFinanceiro, canGerenciarFinanceiro } from '@/lib/rbac'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || !canVerFinanceiro(session.profile.role)) {
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

  const { id } = await params
  const body = await request.json()
  const { tipo, categoria, descricao, valor, data_lancamento, data_vencimento, data_pagamento, status, referencia_tipo, referencia_id, observacoes } = body

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('financeiro_lancamentos')
    .update({
      tipo,
      categoria,
      descricao,
      valor: Number(valor),
      data_lancamento,
      data_vencimento: data_vencimento || null,
      data_pagamento: data_pagamento || null,
      status,
      referencia_tipo: referencia_tipo || null,
      referencia_id: referencia_id || null,
      observacoes: observacoes || null,
    })
    .eq('id', id)
    .eq('org_id', orgId)

  if (error) {
    console.error('[financeiro/lancamentos PUT]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || !canGerenciarFinanceiro(session.profile.role)) {
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

  const { id } = await params
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('financeiro_lancamentos')
    .delete()
    .eq('id', id)
    .eq('org_id', orgId)

  if (error) {
    console.error('[financeiro/lancamentos DELETE]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
