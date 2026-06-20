import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'

export default async function ConfiguracoesPage() {
  const { profile } = await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id, nome, slug, cnpj, plano, ativo, created_at')
    .eq('id', profile.org_id)
    .single()

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">Informações da sua organização</p>
      </div>

      {org && (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          <div className="px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Nome</span>
            <span className="text-sm font-medium text-gray-900">{org.nome}</span>
          </div>
          <div className="px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Subdomínio</span>
            <span className="text-sm font-medium text-gray-900">
              {org.slug}.ostricksocial.com.br
            </span>
          </div>
          {org.cnpj && (
            <div className="px-6 py-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">CNPJ</span>
              <span className="text-sm font-medium text-gray-900">{org.cnpj}</span>
            </div>
          )}
          <div className="px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Plano</span>
            <span className="text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {org.plano}
            </span>
          </div>
          <div className="px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded ${org.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {org.ativo ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          <div className="px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Desde</span>
            <span className="text-sm text-gray-900">
              {new Date(org.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-800 mb-1">Configurações avançadas</h2>
        <p className="text-sm text-gray-500">
          Para alterar o nome da organização, CNPJ ou plano, entre em contato com o suporte da plataforma.
        </p>
      </div>
    </div>
  )
}
