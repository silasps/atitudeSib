import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import type { LancamentoFinanceiro, LancamentoStatus } from '@/types'

function formatBRL(centavos: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100)
}

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}

const STATUS_COLORS: Record<LancamentoStatus, string> = {
  pendente:  'bg-yellow-100 text-yellow-800',
  pago:      'bg-green-100 text-green-800',
  atrasado:  'bg-red-100 text-red-800',
  cancelado: 'bg-gray-100 text-gray-600',
}

const STATUS_LABELS: Record<LancamentoStatus, string> = {
  pendente:  'Pendente',
  pago:      'Pago',
  atrasado:  'Atrasado',
  cancelado: 'Cancelado',
}

export default async function ProfessorFinanceiroPage() {
  const { profile } = await requireRole(['professor', 'admin', 'superadmin'])
  const supabase = await createClient()

  const { data } = await supabase
    .from('financeiro_lancamentos')
    .select('*')
    .eq('org_id', profile.org_id)
    .eq('referencia_tipo', 'professor')
    .eq('referencia_id', profile.id)
    .order('data_lancamento', { ascending: false })

  const honorarios = (data ?? []) as LancamentoFinanceiro[]
  const totalPago = honorarios.filter(h => h.status === 'pago').reduce((s, h) => s + h.valor, 0)
  const totalPendente = honorarios.filter(h => h.status === 'pendente' || h.status === 'atrasado').reduce((s, h) => s + h.valor, 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meus Honorários</h1>
        <p className="text-gray-500 text-sm mt-1">Pagamentos registrados pela organização</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
          <p className="text-xs font-medium text-green-700 mb-2">Total recebido</p>
          <p className="text-2xl font-bold text-green-800">{formatBRL(totalPago)}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
          <p className="text-xs font-medium text-yellow-700 mb-2">A receber</p>
          <p className="text-2xl font-bold text-yellow-800">{formatBRL(totalPendente)}</p>
        </div>
      </div>

      {honorarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3 text-2xl">💰</div>
          <p className="text-sm font-medium text-gray-700">Nenhum honorário registrado</p>
          <p className="text-xs text-gray-400 mt-1">Os pagamentos registrados pela organização aparecerão aqui</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {honorarios.map(h => (
              <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{h.descricao}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(h.data_lancamento)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[h.status]}`}>
                    {STATUS_LABELS[h.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">{formatBRL(h.valor)}</span>
                  {h.data_pagamento && (
                    <span className="text-xs text-gray-400">Pago em {formatDate(h.data_pagamento)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Descrição</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Valor</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Data pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {honorarios.map(h => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(h.data_lancamento)}</td>
                    <td className="px-4 py-3 text-gray-900">{h.descricao}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatBRL(h.valor)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[h.status]}`}>
                        {STATUS_LABELS[h.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{h.data_pagamento ? formatDate(h.data_pagamento) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
