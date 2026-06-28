import { requireRole } from '@/lib/auth'
import { Check } from 'lucide-react'
import {
  canVerDashboard, canVerAlunos, canVerTurmas,
  canGerenciarUsuarios, canGerenciarVoluntariado,
  canGerenciarSite, canGerenciarConfiguracoes,
  canVerFinanceiro, canGerenciarFinanceiro,
  ROLE_LABELS,
} from '@/lib/rbac'
import type { UserRole } from '@/types'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

const ROLES_TO_SHOW: UserRole[] = ['admin', 'funcionario', 'professor', 'aluno', 'responsavel']

const CAPABILITIES = [
  { label: 'Painel administrativo', fn: canVerDashboard, desc: 'Acesso ao painel /admin' },
  { label: 'Ver alunos', fn: canVerAlunos, desc: 'Listagem e ficha dos alunos' },
  { label: 'Ver turmas', fn: canVerTurmas, desc: 'Listagem e detalhes das turmas' },
  { label: 'Gerenciar usuários', fn: canGerenciarUsuarios, desc: 'Criar, editar e desativar usuários' },
  { label: 'Ver financeiro', fn: canVerFinanceiro, desc: 'Ver lançamentos e relatórios' },
  { label: 'Excluir lançamentos', fn: canGerenciarFinanceiro, desc: 'Deletar registros financeiros' },
  { label: 'Voluntariado', fn: canGerenciarVoluntariado, desc: 'Gerenciar vagas e candidaturas' },
  { label: 'Site público', fn: canGerenciarSite, desc: 'Editar conteúdo do site' },
  { label: 'Configurações', fn: canGerenciarConfiguracoes, desc: 'Configurações da organização' },
]

export default async function PermissoesPage() {
  await requireRole(['admin', 'superadmin'])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        href="/admin/configuracoes"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} /> Voltar para configurações
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Permissões de acesso</h1>
        <p className="text-gray-500 text-sm mt-1">O que cada função pode visualizar e gerenciar no sistema</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Ação / Módulo</th>
              {ROLES_TO_SHOW.map(role => (
                <th key={role} className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {CAPABILITIES.map(({ label, fn, desc }) => (
              <tr key={label} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </td>
                {ROLES_TO_SHOW.map(role => {
                  const permitted = fn(role)
                  return (
                    <td key={role} className="px-4 py-3 text-center">
                      {permitted ? (
                        <div className="flex justify-center">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <Check size={13} className="text-green-700" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-base font-light">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-700">
          <strong>Nota:</strong> Professores têm acesso às turmas que lecionam via painel <code>/professor</code> — não ao painel administrativo. Alunos e responsáveis acessam apenas áreas específicas a eles. As permissões acima se referem ao painel <strong>/admin</strong>.
        </p>
      </div>
    </div>
  )
}
