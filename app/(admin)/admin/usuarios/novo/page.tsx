import { requireRole } from '@/lib/auth'
import NovoUsuarioForm from './novo-usuario-form'

export default async function NovoUsuarioPage() {
  await requireRole(['admin', 'superadmin'])
  return (
    <div className="p-6 lg:p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Novo usuário</h1>
      <p className="text-gray-500 text-sm mb-8">
        Adicione um professor, funcionário ou administrador à organização.
      </p>
      <NovoUsuarioForm />
    </div>
  )
}
