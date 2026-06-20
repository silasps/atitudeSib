import { createServiceClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Organization, Profile } from '@/types'
import OrgAcoesForm from './org-acoes-form'
import ImpersonarButtons from './impersonar-buttons'

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServiceClient()

  const [{ data: org }, { data: profiles }] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', id).single(),
    supabase.from('profiles').select('*').eq('org_id', id).order('created_at'),
  ])

  if (!org) notFound()

  const adminCount = profiles?.filter(p => p.role === 'admin' || p.role === 'funcionario').length ?? 0
  const professorCount = profiles?.filter(p => p.role === 'professor').length ?? 0
  const alunoCount = profiles?.filter(p => p.role === 'aluno').length ?? 0

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/superadmin/organizacoes" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition">
        <ArrowLeft size={16} /> Voltar para organizações
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{org.nome}</h1>
          <p className="text-gray-400 text-sm mt-1 font-mono">{org.slug}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${org.ativo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {org.ativo ? 'Ativa' : 'Inativa'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Admins / Funcionários', value: adminCount },
          { label: 'Professores', value: professorCount },
          { label: 'Alunos', value: alunoCount },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Gestão de plano e status */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Plano e acesso</h2>
        <OrgAcoesForm org={org as Organization} />
      </div>

      {/* Simular acesso */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-1">Simular acesso</h2>
        <p className="text-sm text-gray-400 mb-4">Visualize a plataforma como se fosse um usuário desta organização.</p>
        <ImpersonarButtons orgId={org.id} orgNome={org.nome} />
      </div>

      {/* Lista de usuários */}
      {profiles && profiles.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <h2 className="font-semibold">Usuários da organização</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">Nome</th>
                <th className="px-5 py-3 text-left font-medium">Email</th>
                <th className="px-5 py-3 text-left font-medium">Role</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {profiles.map((p: Profile) => (
                <tr key={p.id} className="hover:bg-white/5 transition">
                  <td className="px-5 py-3 font-medium">{p.nome}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{p.email}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">{p.role}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs ${p.ativo ? 'text-emerald-400' : 'text-red-400'}`}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
