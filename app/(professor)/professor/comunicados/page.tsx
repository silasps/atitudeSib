import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { MessageSquare } from 'lucide-react'

export default async function ComunicadosProfessorPage() {
  const { profile } = await requireRole(['professor', 'admin', 'superadmin'])
  const supabase = await createClient()

  const { data: comunicados } = await supabase
    .from('comunicados')
    .select('id, titulo, conteudo, publicado, created_at, turmas(nome)')
    .eq('autor_id', profile.id)
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Comunicados</h1>
        <p className="text-gray-500 text-sm mt-1">Mensagens enviadas para suas turmas</p>
      </div>

      {(!comunicados || comunicados.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare size={40} className="text-gray-300 mb-4" />
          <h3 className="text-gray-700 font-medium mb-1">Nenhum comunicado enviado</h3>
          <p className="text-gray-400 text-sm max-w-sm">
            Acesse uma turma e envie comunicados para os alunos matriculados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comunicados.map((c) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const turma = c.turmas as any
            return (
              <div key={c.id} className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{c.titulo}</h3>
                    {c.conteudo && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.conteudo}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {turma?.nome && <span>{turma.nome}</span>}
                      <span>·</span>
                      <span>{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${c.publicado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.publicado ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
