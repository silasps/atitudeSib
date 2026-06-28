import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import NovoLancamentoForm from './novo-lancamento-form'

export default async function NovoLancamentoPage() {
  await requireRole(['admin', 'funcionario', 'superadmin'])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <Link
        href="/admin/financeiro/lancamentos"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} /> Voltar para lançamentos
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Novo lançamento</h1>
        <p className="text-gray-500 text-sm mt-1">Registre uma receita ou despesa</p>
      </div>
      <NovoLancamentoForm />
    </div>
  )
}
