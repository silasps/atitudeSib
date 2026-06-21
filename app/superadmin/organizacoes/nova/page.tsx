import { requireRole } from '@/lib/auth'
import NovaOrgForm from './nova-org-form'

export default async function NovaOrgPage() {
  await requireRole(['superadmin'])
  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Nova Organização</h1>
      <p className="text-gray-400 text-sm mb-8">
        Crie uma nova organização na plataforma e configure o primeiro administrador.
      </p>
      <NovaOrgForm />
    </div>
  )
}
