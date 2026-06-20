import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getSession, isAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || (!isAdmin(session.profile.role) && session.profile.role !== 'funcionario')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const { nome, data_nascimento, telefone, cpf, status, endereco, observacoes } = body

  if (!nome) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase.from('alunos').insert({
    org_id: session.profile.org_id,
    nome,
    data_nascimento: data_nascimento || null,
    telefone: telefone || null,
    cpf_encrypted: cpf || null,
    status: status || 'ativo',
    endereco: endereco || {},
    observacoes: observacoes || null,
    data_admissao: new Date().toISOString().split('T')[0],
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ aluno: data }, { status: 201 })
}
