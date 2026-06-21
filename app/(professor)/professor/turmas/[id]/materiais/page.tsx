import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { FileText, Link as LinkIcon, Download } from 'lucide-react'

const TIPO_ICONS: Record<string, React.FC<{ size: number; className?: string }>> = {
  link: LinkIcon,
  arquivo: Download,
  documento: FileText,
}

export default async function MateriaisPage({
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

  const { data: materiais } = await supabase
    .from('materiais')
    .select('id, nome, descricao, url, tipo, created_at')
    .eq('turma_id', id)
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <a href={`/professor/turmas/${id}`} className="text-sm text-gray-400 hover:text-gray-600 mb-3 inline-block">
          ← {turma.nome}
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Materiais</h1>
        <p className="text-gray-500 text-sm mt-1">Recursos disponibilizados para os alunos</p>
      </div>

      {(!materiais || materiais.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText size={40} className="text-gray-300 mb-4" />
          <h3 className="text-gray-700 font-medium mb-1">Nenhum material cadastrado</h3>
          <p className="text-gray-400 text-sm">Os materiais desta turma aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materiais.map((m) => {
            const Icon = TIPO_ICONS[m.tipo] || FileText
            return (
              <div key={m.id} className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition">
                <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                  <Icon size={18} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{m.nome}</p>
                  {m.descricao && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{m.descricao}</p>}
                </div>
                {m.url && (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Abrir
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
