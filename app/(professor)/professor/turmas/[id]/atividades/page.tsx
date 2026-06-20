import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { ClipboardList, Calendar } from 'lucide-react'

export default async function AtividadesPage({
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

  const { data: atividades } = await supabase
    .from('atividades')
    .select('id, titulo, descricao, data_entrega, pontuacao_maxima, created_at')
    .eq('turma_id', id)
    .eq('org_id', profile.org_id)
    .order('data_entrega', { ascending: false })

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <a href={`/professor/turmas/${id}`} className="text-sm text-gray-400 hover:text-gray-600 mb-3 inline-block">
          ← {turma.nome}
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>
        <p className="text-gray-500 text-sm mt-1">Tarefas e avaliações desta turma</p>
      </div>

      {(!atividades || atividades.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList size={40} className="text-gray-300 mb-4" />
          <h3 className="text-gray-700 font-medium mb-1">Nenhuma atividade cadastrada</h3>
          <p className="text-gray-400 text-sm">As atividades criadas para esta turma aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {atividades.map((a) => {
            const vencida = a.data_entrega && a.data_entrega < hoje
            return (
              <div key={a.id} className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{a.titulo}</h3>
                    {a.descricao && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.descricao}</p>
                    )}
                  </div>
                  {a.pontuacao_maxima && (
                    <span className="shrink-0 text-sm font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                      {a.pontuacao_maxima} pts
                    </span>
                  )}
                </div>
                {a.data_entrega && (
                  <div className={`flex items-center gap-1.5 mt-3 text-xs font-medium ${vencida ? 'text-red-500' : 'text-gray-400'}`}>
                    <Calendar size={13} />
                    Entrega: {new Date(a.data_entrega + 'T00:00:00').toLocaleDateString('pt-BR')}
                    {vencida && <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs">Vencida</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
