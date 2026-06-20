import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getSession } from '@/lib/auth'
import { isAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || !isAdmin(session.profile.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const { nome, email, telefone, role, senha } = body

  if (!nome || !email || !senha || !role) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const allowedRoles = ['professor', 'funcionario', 'admin']
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Role inválida' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const orgId = session.profile.org_id

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, org_id: orgId, role },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: authUser.user.id,
    org_id: orgId,
    nome,
    email,
    telefone: telefone || null,
    role,
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
