import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { canGerenciarFinanceiro } from '@/lib/rbac'
import { Plus, Pencil } from 'lucide-react'
import DeleteLancamentoButton from './_components/delete-lancamento-button'
import type { LancamentoFinanceiro, LancamentoTipo, LancamentoStatus } from '@/types'

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

const CATEGORIA_LABELS: Record<string, string> = {
  doacao: 'Doação', mensalidade: 'Mensalidade', patrocinio: 'Patrocínio',
  subvencao: 'Subvenção', prestacao_servico: 'Prestação de Serviço', evento_receita: 'Evento',
  honorario_professor: 'Honorário Prof.', folha_pagamento: 'Folha de Pagamento',
  infraestrutura: 'Infraestrutura', material: 'Material', evento_despesa: 'Evento',
  administrativo: 'Administrativo', outros: 'Outros',
}

interface SearchParams { tipo?: string; status?: string; mes?: string; q?: string }

export default async function LancamentosPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { profile } = await requireRole(['admin', 'funcionario', 'superadmin'])
  const supabase = await createClient()
  const orgId = profile.org_id
  const canDelete = canGerenciarFinanceiro(profile.role)

  const { tipo, status, mes, q } = await searchParams

  let query = supabase
    .from('financeiro_lancamentos')
    .select('*')
    .eq('org_id', orgId)
    .order('data_lancamento', { ascending: false })

  if (tipo && tipo !== 'todos') query = query.eq('tipo', tipo)
  if (status && status !== 'todos') query = query.eq('status', status)
  if (mes) {
    const [ano, mesNum] = mes.split('-')
    const ultimoDia = new Date(Number(ano), Number(mesNum), 0).getDate()
    query = query.gte('data_lancamento', `${mes}-01`).lte('data_lancamento', `${mes}-${ultimoDia}`)
  }
  if (q) query = query.ilike('descricao', `%${q}%`)

  const { data: lancamentos } = await query

  const rows = (lancamentos ?? []) as LancamentoFinanceiro[]
  const totalReceitas = rows.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
  const totalDespesas = rows.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
          <p className="text-gray-500 text-sm mt-1">{rows.length} resultado{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/financeiro/lancamentos/novo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition shrink-0"
        >
          <Plus size={15} />
          Novo
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-2 mb-6">
        <select name="tipo" defaultValue={tipo ?? 'todos'} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="todos">Todos os tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>
        <select name="status" defaultValue={status ?? 'todos'} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="todos">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="atrasado">Atrasado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <input type="month" name="mes" defaultValue={mes ?? ''} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="search" name="q" defaultValue={q ?? ''} placeholder="Buscar descrição..." className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[160px]" />
        <button type="submit" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Filtrar</button>
      </form>

      {/* Totals bar */}
      {rows.length > 0 && (
        <div className="flex gap-4 mb-4 text-sm">
          <span className="text-green-700 font-medium">Receitas: {formatBRL(totalReceitas)}</span>
          <span className="text-gray-300">|</span>
          <span className="text-red-700 font-medium">Despesas: {formatBRL(totalDespesas)}</span>
          <span className="text-gray-300">|</span>
          <span className={`font-semibold ${totalReceitas - totalDespesas >= 0 ? 'text-green-800' : 'text-red-800'}`}>
            Resultado: {formatBRL(totalReceitas - totalDespesas)}
          </span>
        </div>
      )}

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {rows.map(l => (
          <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{l.descricao}</p>
                <p className="text-xs text-gray-500 mt-0.5">{CATEGORIA_LABELS[l.categoria]} · {formatDate(l.data_lancamento)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link href={`/admin/financeiro/lancamentos/${l.id}/editar`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition">
                  <Pencil size={15} />
                </Link>
                {canDelete && <DeleteLancamentoButton id={l.id} />}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${l.tipo === 'receita' ? 'text-green-700' : 'text-red-700'}`}>
                {l.tipo === 'receita' ? '+' : '-'} {formatBRL(l.valor)}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[l.status]}`}>
                {STATUS_LABELS[l.status]}
              </span>
            </div>
          </div>
        ))}
        {rows.length === 0 && <EmptyState />}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Data</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Descrição</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Categoria</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Vencimento</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Valor</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(l => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(l.data_lancamento)}</td>
                <td className="px-4 py-3 text-gray-900 font-medium max-w-[240px] truncate">{l.descricao}</td>
                <td className="px-4 py-3 text-gray-500">{CATEGORIA_LABELS[l.categoria]}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{l.data_vencimento ? formatDate(l.data_vencimento) : '—'}</td>
                <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${l.tipo === 'receita' ? 'text-green-700' : 'text-red-700'}`}>
                  {l.tipo === 'receita' ? '+' : '-'} {formatBRL(l.valor)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[l.status]}`}>
                    {STATUS_LABELS[l.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/financeiro/lancamentos/${l.id}/editar`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition">
                      <Pencil size={15} />
                    </Link>
                    {canDelete && <DeleteLancamentoButton id={l.id} />}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <EmptyState />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
        <span className="text-2xl">💰</span>
      </div>
      <p className="text-sm font-medium text-gray-700">Nenhum lançamento encontrado</p>
      <p className="text-xs text-gray-400 mt-1">Ajuste os filtros ou crie um novo lançamento</p>
    </div>
  )
}
