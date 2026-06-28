import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import type { LancamentoFinanceiro } from '@/types'

function formatBRL(centavos: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100)
}

function getMesList(mesesAtras: number) {
  const meses: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = mesesAtras - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toISOString().slice(0, 7)
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    meses.push({ key, label })
  }
  return meses
}

const CATEGORIA_LABELS: Record<string, string> = {
  doacao: 'Doações', mensalidade: 'Mensalidades', patrocinio: 'Patrocínios',
  subvencao: 'Subvenções', prestacao_servico: 'Prestação de Serviços', evento_receita: 'Eventos (Receita)',
  honorario_professor: 'Honorários Professores', folha_pagamento: 'Folha de Pagamento',
  infraestrutura: 'Infraestrutura', material: 'Materiais', evento_despesa: 'Eventos (Despesa)',
  administrativo: 'Administrativo', outros: 'Outros',
}

interface SearchParams { ano?: string; mes?: string }

export default async function RelatoriosPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { profile } = await requireRole(['admin', 'funcionario', 'superadmin'])
  const supabase = await createClient()
  const orgId = profile.org_id

  const { ano, mes } = await searchParams
  const now = new Date()
  const anoSel = Number(ano ?? now.getFullYear())
  const mesSel = mes ?? String(now.getMonth() + 1).padStart(2, '0')
  const periodoLabel = new Date(`${anoSel}-${mesSel}-01`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  // Busca 12 meses de histórico para fluxo de caixa
  const meses12 = getMesList(12)
  const inicio12 = `${meses12[0].key}-01`

  const { data: todos } = await supabase
    .from('financeiro_lancamentos')
    .select('tipo, categoria, valor, status, data_lancamento')
    .eq('org_id', orgId)
    .gte('data_lancamento', inicio12)

  const lancamentos = (todos ?? []) as Pick<LancamentoFinanceiro, 'tipo' | 'categoria' | 'valor' | 'status' | 'data_lancamento'>[]

  // DRE — filtra pelo mês/ano selecionado, apenas pagos
  const periodoKey = `${anoSel}-${mesSel}`
  const doPeriodo = lancamentos.filter(l => l.data_lancamento.startsWith(periodoKey) && l.status === 'pago')

  const gruposReceita: Record<string, number> = {}
  const gruposDespesa: Record<string, number> = {}
  for (const l of doPeriodo) {
    if (l.tipo === 'receita') gruposReceita[l.categoria] = (gruposReceita[l.categoria] ?? 0) + l.valor
    else gruposDespesa[l.categoria] = (gruposDespesa[l.categoria] ?? 0) + l.valor
  }
  const totalReceitas = Object.values(gruposReceita).reduce((s, v) => s + v, 0)
  const totalDespesas = Object.values(gruposDespesa).reduce((s, v) => s + v, 0)
  const resultado = totalReceitas - totalDespesas

  // Fluxo de caixa — últimos 6 meses
  const meses6 = getMesList(6)
  let saldoAcumulado = 0
  const fluxo = meses6.map(({ key, label }) => {
    const doMes = lancamentos.filter(l => l.data_lancamento.startsWith(key) && l.status === 'pago')
    const rec = doMes.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
    const desp = doMes.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0)
    saldoAcumulado += rec - desp
    return { key, label, receitas: rec, despesas: desp, resultado: rec - desp, saldoAcumulado }
  })

  // Seletor de meses disponíveis
  const mesesOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), i, 1)
    return {
      value: `${now.getFullYear()}-${String(i + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('pt-BR', { month: 'long' }),
    }
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 text-sm mt-1">DRE simplificada e fluxo de caixa</p>
      </div>

      {/* Seletor de período */}
      <form method="GET" className="flex gap-3 mb-8 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ano</label>
          <select name="ano" defaultValue={anoSel} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Mês</label>
          <select name="mes" defaultValue={mesSel} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {mesesOptions.map(m => (
              <option key={m.value} value={m.value.split('-')[1]}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            Gerar
          </button>
        </div>
      </form>

      {/* DRE */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          DRE Simplificada — <span className="font-normal text-gray-500">{periodoLabel}</span>
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Receitas */}
          <div className="px-5 py-3 bg-green-50 border-b border-gray-200 flex justify-between items-center">
            <span className="text-sm font-semibold text-green-800">RECEITAS</span>
            <span className="text-sm font-bold text-green-800">{formatBRL(totalReceitas)}</span>
          </div>
          {Object.entries(gruposReceita).length === 0 && (
            <p className="px-5 py-2 text-sm text-gray-400">Nenhuma receita no período.</p>
          )}
          {Object.entries(gruposReceita).map(([cat, val]) => (
            <div key={cat} className="px-5 py-2 flex justify-between items-center border-b border-gray-50">
              <span className="text-sm text-gray-600 pl-4">{CATEGORIA_LABELS[cat] ?? cat}</span>
              <span className="text-sm text-green-700">{formatBRL(val)}</span>
            </div>
          ))}

          {/* Despesas */}
          <div className="px-5 py-3 bg-red-50 border-b border-gray-200 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm font-semibold text-red-800">(-) DESPESAS</span>
            <span className="text-sm font-bold text-red-800">{formatBRL(totalDespesas)}</span>
          </div>
          {Object.entries(gruposDespesa).length === 0 && (
            <p className="px-5 py-2 text-sm text-gray-400">Nenhuma despesa no período.</p>
          )}
          {Object.entries(gruposDespesa).map(([cat, val]) => (
            <div key={cat} className="px-5 py-2 flex justify-between items-center border-b border-gray-50">
              <span className="text-sm text-gray-600 pl-4">{CATEGORIA_LABELS[cat] ?? cat}</span>
              <span className="text-sm text-red-700">{formatBRL(val)}</span>
            </div>
          ))}

          {/* Resultado */}
          <div className={`px-5 py-4 flex justify-between items-center ${resultado >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <span className={`text-sm font-bold ${resultado >= 0 ? 'text-green-900' : 'text-red-900'}`}>= RESULTADO</span>
            <span className={`text-base font-bold ${resultado >= 0 ? 'text-green-900' : 'text-red-900'}`}>{formatBRL(resultado)}</span>
          </div>
        </div>
      </section>

      {/* Fluxo de caixa */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Fluxo de Caixa — últimos 6 meses</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Mês</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Receitas</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Despesas</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Resultado</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Saldo Acum.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fluxo.map(f => (
                <tr key={f.key} className={`hover:bg-gray-50 ${f.key === periodoKey ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3 text-gray-700 font-medium capitalize">{f.label}</td>
                  <td className="px-4 py-3 text-right text-green-700">{formatBRL(f.receitas)}</td>
                  <td className="px-4 py-3 text-right text-red-700">{formatBRL(f.despesas)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${f.resultado >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    {formatBRL(f.resultado)}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${f.saldoAcumulado >= 0 ? 'text-gray-900' : 'text-red-900'}`}>
                    {formatBRL(f.saldoAcumulado)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">* Considera apenas lançamentos com status &quot;pago&quot;.</p>
      </section>
    </div>
  )
}
