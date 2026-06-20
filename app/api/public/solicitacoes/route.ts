import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const body = await request.json()
  const { org_id, tipo, nome, email, telefone, data_nascimento, responsavel_nome, responsavel_telefone, mensagem } = body

  if (!org_id || !nome) {
    return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase.from('solicitacoes_admissao').insert({
    org_id,
    tipo: tipo || 'aluno',
    nome,
    email: email || null,
    telefone: telefone || null,
    dados: { data_nascimento, responsavel_nome, responsavel_telefone, mensagem },
    status: 'pendente',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true }, { status: 201 })
}
