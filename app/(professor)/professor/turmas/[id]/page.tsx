import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Users, ClipboardList, BookMarked, MessageSquare, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Turma, Aluno, HorarioItem } from '@/types'

export default async function TurmaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { profile } = await requireRole(['professor', 'admin', 'superadmin'])
  const supabase = await createClient()

  const { data: turma } = await supabase
    .from('turmas')
    .select('*')
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .single()

  if (!turma) notFound()

  const { data: matriculas } = await supabase
    .from('matriculas')
    .select('*, aluno:alunos(*)')
    .eq('turma_id', id)
    .eq('status', 'ativa')
    .order('created_at')

  const alunos: Aluno[] = (matriculas || []).map((m: { aluno: Aluno }) => m.aluno)

  const { data: ultimosEncontros } = await supabase
    .from('encontros')
    .select('*')
    .eq('turma_id', id)
    .order('data', { ascending: false })
    .limit(5)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/professor/turmas" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3">
          ← Minhas turmas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{(turma as Turma).nome}</h1>
        {(turma as Turma).descricao && <p className="text-gray-500 text-sm mt-1">{(turma as Turma).descricao}</p>}
        {(turma as Turma).horario?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {((turma as Turma).horario as HorarioItem[]).map((h, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                {h.dia} {h.hora_inicio}–{h.hora_fim}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Link href={`/professor/turmas/${id}/chamada`}
          className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm hover:border-blue-200 transition text-center group">
          <ClipboardList size={22} className="text-blue-500" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Fazer chamada</span>
        </Link>
        <Link href={`/professor/turmas/${id}/materiais`}
          className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm hover:border-green-200 transition text-center group">
          <BookMarked size={22} className="text-green-500" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">Materiais</span>
        </Link>
        <Link href={`/professor/turmas/${id}/atividades`}
          className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm hover:border-purple-200 transition text-center group">
          <ClipboardList size={22} className="text-purple-500" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">Atividades</span>
        </Link>
        <Link href="/professor/comunicados"
          className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm hover:border-orange-200 transition text-center group">
          <MessageSquare size={22} className="text-orange-500" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">Comunicados</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lista de alunos */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-gray-400" />
              Alunos ({alunos.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {alunos.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Nenhum aluno matriculado</p>
            ) : (
              alunos.map((aluno: Aluno) => (
                <div key={aluno.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {aluno.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{aluno.nome}</p>
                    {aluno.data_nascimento && (
                      <p className="text-xs text-gray-400">{formatDate(aluno.data_nascimento)}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Últimos encontros */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList size={16} className="text-gray-400" />
              Últimas aulas
            </h2>
            <Link href={`/professor/turmas/${id}/chamada`}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">
              Nova aula <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {!ultimosEncontros?.length ? (
              <p className="text-center text-gray-400 text-sm py-8">Nenhuma aula registrada</p>
            ) : (
              ultimosEncontros.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatDate(e.data)}</p>
                    {e.conteudo && <p className="text-xs text-gray-400 truncate max-w-[200px]">{e.conteudo}</p>}
                  </div>
                  <span className="text-xs text-gray-400">{e.hora_inicio}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
