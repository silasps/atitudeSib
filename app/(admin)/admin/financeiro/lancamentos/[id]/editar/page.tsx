import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import NovoLancamentoForm from '../../novo/novo-lancamento-form'
import type { LancamentoFinanceiro } from '@/types'

export default async function EditarLancamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { profile } = await requireRole(['admin', 'funcionario', 'superadmin'])
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('financeiro_lancamentos')
    .select('*')
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .single()

  if (!data) notFound()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <Link
        href="/admin/financeiro/lancamentos"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} /> Voltar para lançamentos
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar lançamento</h1>
        <p className="text-gray-500 text-sm mt-1">{data.descricao}</p>
      </div>
      <NovoLancamentoForm inicial={data as LancamentoFinanceiro} />
    </div>
  )
}
