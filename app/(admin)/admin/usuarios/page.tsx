import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, UserPlus } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import type { Profile, UserRole } from '@/types'

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Superadmin',
  admin: 'Administrador',
  funcionario: 'Funcionário',
  professor: 'Professor',
  aluno: 'Aluno',
  responsavel: 'Responsável',
}

const ROLE_COLORS: Record<string, string> = {
  admin:       'bg-purple-100 text-purple-700',
  funcionario: 'bg-blue-100 text-blue-700',
  professor:   'bg-green-100 text-green-700',
  aluno:       'bg-gray-100 text-gray-600',
  responsavel: 'bg-orange-100 text-orange-700',
  superadmin:  'bg-red-100 text-red-700',
}

export default async function UsuariosPage() {
  const { profile } = await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  const { data: usuarios } = await supabase
    .from('profiles')
    .select('*')
    .eq('org_id', profile.org_id)
    .in('role', ['admin', 'funcionario', 'professor'])
    .order('nome')

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-500 text-sm mt-0.5">Administradores, funcionários e professores</p>
        </div>
        <Link
          href="/admin/usuarios/novo"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Novo usuário
        </Link>
      </div>

      {!usuarios?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <UserPlus size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">Nenhum usuário cadastrado ainda.</p>
          <Link href="/admin/usuarios/novo" className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
            Adicionar primeiro usuário →
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="sm:hidden space-y-2">
            {usuarios.map((u: Profile) => (
              <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                  {getInitials(u.nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{u.nome}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                  <span className={`flex items-center gap-1 text-xs ${u.ativo ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.ativo ? 'bg-green-500' : 'bg-gray-300'}`} />
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: tabela */}
          <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Nome</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Função</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Telefone</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Cadastrado em</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map((u: Profile) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{u.nome}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{u.telefone || '—'}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.ativo ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.ativo ? 'bg-green-500' : 'bg-gray-300'}`} />
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
