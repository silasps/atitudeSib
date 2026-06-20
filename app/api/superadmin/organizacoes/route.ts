import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  // Apenas superadmin pode criar orgs
  const session = await getSession()
  if (!session || session.profile.role !== 'superadmin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const { nome, slug, cnpj, plano, adminNome, adminEmail, adminSenha } = body

  if (!nome || !slug || !adminNome || !adminEmail || !adminSenha) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // 1. Cria a organização
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ nome, slug: slug.toLowerCase(), cnpj: cnpj || null, plano: plano || 'free' })
    .select()
    .single()

  if (orgError) {
    if (orgError.code === '23505') {
      return NextResponse.json({ error: 'Este slug já está em uso. Escolha outro.' }, { status: 409 })
    }
    return NextResponse.json({ error: orgError.message }, { status: 500 })
  }

  // 2. Cria o usuário admin no Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminSenha,
    email_confirm: true,
    user_metadata: {
      nome: adminNome,
      org_id: org.id,
      role: 'admin',
    },
  })

  if (authError) {
    // Rollback: deleta a org criada
    await supabase.from('organizations').delete().eq('id', org.id)
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // 3. Cria o profile (o trigger já deve ter criado, mas garantimos aqui)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authUser.user.id,
      org_id: org.id,
      nome: adminNome,
      email: adminEmail,
      role: 'admin',
    })

  if (profileError) {
    console.error('Profile creation error:', profileError)
  }

  // 4. Cria site_config padrão para a org
  await supabase.from('site_config').insert({
    org_id: org.id,
    template_id: 'comunitario',
    cor_primaria: 'azul-oceano',
    hero_titulo: nome,
    hero_cta_texto: 'Saiba mais',
    publicado: false,
  })

  return NextResponse.json({ org }, { status: 201 })
}
