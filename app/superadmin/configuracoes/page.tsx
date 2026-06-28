import { requireRole } from '@/lib/auth'

export default async function SuperadminConfiguracoesPage() {
  await requireRole(['superadmin'])

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Configurações da plataforma</h1>
        <p className="text-gray-400 text-sm mt-1">Parâmetros globais do sistema Ostrick Social</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/5">
          <div className="px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-gray-400">Versão da plataforma</span>
            <span className="text-sm font-medium text-white">1.0.0</span>
          </div>
          <div className="px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-gray-400">Ambiente</span>
            <span className="text-xs font-semibold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
              {process.env.NODE_ENV}
            </span>
          </div>
          <div className="px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-gray-400">Domínio base</span>
            <span className="text-sm font-medium text-white font-mono">ostricksocial.com.br</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="font-semibold mb-1 text-white">Configurações avançadas</h2>
          <p className="text-sm text-gray-400">
            Mais opções de configuração serão adicionadas aqui conforme a plataforma evolui.
          </p>
        </div>
      </div>
    </div>
  )
}
