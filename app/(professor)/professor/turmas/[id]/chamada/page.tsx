import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import ChamadaClient from './chamada-client'
import type { Aluno } from '@/types'

export default async function ChamadaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { profile } = await requireRole(['professor', 'admin', 'superadmin'])
  const supabase = await createClient()

  const { data: turma } = await supabase
    .from('turmas')
    .select('id, nome')
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .single()

  if (!turma) notFound()

  const { data: matriculas } = await supabase
    .from('matriculas')
    .select('aluno_id, alunos(id, nome, data_nascimento)')
    .eq('turma_id', id)
    .eq('status', 'ativa')
    .order('created_at')

  const alunos: Aluno[] = (matriculas || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((m: any) => m.alunos as Aluno)
    .filter(Boolean)

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <a href={`/professor/turmas/${id}`} className="text-sm text-gray-400 hover:text-gray-600 mb-3 inline-block">
          ← {turma.nome}
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Chamada</h1>
        <p className="text-gray-500 text-sm mt-1">
          Registre a presença dos alunos para esta aula
        </p>
      </div>
      <ChamadaClient turmaId={id} alunos={alunos} />
    </div>
  )
}
