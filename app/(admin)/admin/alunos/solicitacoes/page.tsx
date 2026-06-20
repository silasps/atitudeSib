import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { formatDateTime } from '@/lib/utils'
import type { SolicitacaoAdmissao } from '@/types'
import AprovarSolicitacaoButton from './aprovar-button'

const STATUS_COLORS: Record<string, string> = {
  pendente:  'bg-yellow-100 text-yellow-700',
  aprovada:  'bg-green-100 text-green-700',
  recusada:  'bg-red-100 text-red-700',
  cancelada: 'bg-gray-100 text-gray-500',
}

export default async function SolicitacoesPage() {
  const { profile } = await requireRole(['admin', 'funcionario', 'superadmin'])
  const supabase = await createClient()

  const { data: solicitacoes } = await supabase
    .from('solicitacoes_admissao')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Solicitações de inscrição</h1>
        <p className="text-gray-500 text-sm mt-1">
          Solicitações enviadas pelo site público
        </p>
      </div>

      <div className="space-y-3">
        {!solicitacoes?.length ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <p className="text-gray-400 text-sm">Nenhuma solicitação recebida ainda.</p>
          </div>
        ) : (
          solicitacoes.map((sol: SolicitacaoAdmissao) => (
            <div key={sol.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{sol.nome}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[sol.status]}`}>
                      {sol.status.charAt(0).toUpperCase() + sol.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {sol.email && <span className="mr-3">{sol.email}</span>}
                    {sol.telefone && <span>{sol.telefone}</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(sol.created_at)}</p>
                </div>
                {sol.status === 'pendente' && (
                  <AprovarSolicitacaoButton solicitacaoId={sol.id} nome={sol.nome} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
