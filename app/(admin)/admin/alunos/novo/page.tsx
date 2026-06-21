import { requireRole } from '@/lib/auth'
import NovoAlunoForm from './novo-aluno-form'

export default async function NovoAlunoPage() {
  await requireRole(['admin', 'funcionario', 'superadmin'])
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Novo aluno</h1>
      <p className="text-gray-500 text-sm mb-8">Cadastre um aluno na organização.</p>
      <NovoAlunoForm />
    </div>
  )
}
