import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'
import type { Turma } from '@/types'

export default async function ProfessorHomePage() {
  const { profile } = await requireRole(['professor', 'admin', 'superadmin'])
  const supabase = await createClient()

  const { data: turmas } = await supabase
    .from('turmas')
    .select('*')
    .eq('org_id', profile.org_id)
    .eq('professor_id', profile.id)
    .eq('status', 'ativa')
    .order('nome')

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Olá, {profile.nome.split(' ')[0]}!</h1>
        <p className="text-gray-500 text-sm mt-1">
          {turmas?.length
            ? `Você tem ${turmas.length} turma${turmas.length > 1 ? 's' : ''} ativa${turmas.length > 1 ? 's' : ''}`
            : 'Nenhuma turma ativa no momento'}
        </p>
      </div>

      {turmas?.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {turmas.map((turma: Turma) => (
            <Link
              key={turma.id}
              href={`/professor/turmas/${turma.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-blue-200 transition group flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">{turma.nome}</p>
                {turma.descricao && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{turma.descricao}</p>
                )}
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition shrink-0" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">Você não tem turmas ativas.</p>
          <p className="text-gray-400 text-xs mt-1">Fale com o administrador para ser atribuído a uma turma.</p>
        </div>
      )}
    </div>
  )
}
