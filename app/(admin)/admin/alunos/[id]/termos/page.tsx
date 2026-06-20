import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import type { Aluno } from '@/types'
import GerenciarTermos from './gerenciar-termos'

interface Props { params: Promise<{ id: string }> }

export default async function TermosAlunoAdminPage({ params }: Props) {
  const { id } = await params
  const { profile } = await requireRole(['admin', 'funcionario', 'superadmin'])
  const supabase = await createClient()

  const { data: aluno } = await supabase
    .from('alunos')
    .select('*')
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .single()

  if (!aluno) notFound()

  const { data: termos } = await supabase
    .from('termos_ficha')
    .select('*')
    .eq('aluno_id', id)
    .order('created_at', { ascending: false })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <a href="/admin/alunos" className="text-sm text-gray-400 hover:text-gray-600">← Alunos</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{(aluno as Aluno).nome}</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gerenciamento de termos e assinaturas digitais</p>
        {(aluno as Aluno).data_nascimento && (
          <p className="text-xs text-gray-400 mt-1">Nascimento: {formatDate((aluno as Aluno).data_nascimento)}</p>
        )}
      </div>

      <GerenciarTermos
        alunoId={id}
        alunoNome={(aluno as Aluno).nome}
        alunoEmail={(aluno as { email?: string }).email ?? null}
        termos={termos ?? []}
        siteUrl={siteUrl}
      />
    </div>
  )
}
