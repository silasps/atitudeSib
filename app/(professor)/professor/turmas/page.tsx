import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'
import type { Turma } from '@/types'

export default async function ProfessorTurmasPage() {
  const { profile } = await requireRole(['professor', 'admin', 'superadmin'])
  const supabase = await createClient()

  const { data: turmas } = await supabase
    .from('turmas')
    .select('*')
    .eq('org_id', profile.org_id)
    .eq('professor_id', profile.id)
    .order('status')
    .order('nome')

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Turmas</h1>
        <p className="text-gray-500 text-sm mt-1">{turmas?.length ?? 0} turmas atribuídas</p>
      </div>

      <div className="space-y-2">
        {turmas?.map((turma: Turma) => (
          <Link
            key={turma.id}
            href={`/professor/turmas/${turma.id}`}
            className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm hover:border-blue-200 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <BookOpen size={18} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{turma.nome}</p>
              {turma.descricao && <p className="text-sm text-gray-400 truncate">{turma.descricao}</p>}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              turma.status === 'ativa' ? 'bg-green-100 text-green-700' :
              turma.status === 'pausada' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {turma.status.charAt(0).toUpperCase() + turma.status.slice(1)}
            </span>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
