import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'

export default async function AdminDashboardPage() {
  const { profile } = await requireRole(['admin', 'funcionario', 'superadmin'])
  const supabase = await createClient()
  const orgId = profile.org_id

  const [
    { count: alunosAtivos },
    { count: turmasAtivas },
    { count: voluntariosAtivos },
    { count: solicitacoesPendentes },
  ] = await Promise.all([
    supabase.from('alunos').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'ativo'),
    supabase.from('turmas').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'ativa'),
    supabase.from('participantes_voluntariado').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'ativo'),
    supabase.from('solicitacoes_admissao').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'pendente'),
  ])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral da organização</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Alunos ativos" value={alunosAtivos ?? 0} color="blue" />
        <StatCard label="Turmas ativas" value={turmasAtivas ?? 0} color="green" />
        <StatCard label="Voluntários" value={voluntariosAtivos ?? 0} color="purple" />
        <StatCard label="Inscrições pendentes" value={solicitacoesPendentes ?? 0} color="orange" />
      </div>

      {(solicitacoesPendentes ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-sm font-bold">
            {solicitacoesPendentes}
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">
              {solicitacoesPendentes} solicitaç{(solicitacoesPendentes ?? 0) === 1 ? 'ão' : 'ões'} de inscrição aguardando análise
            </p>
            <a href="/admin/alunos/solicitacoes" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
              Ver solicitações →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   num: 'text-blue-600' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  num: 'text-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', num: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', num: 'text-orange-600' },
}

function StatCard({ label, value, color }: { label: string; value: number; color: keyof typeof colorMap }) {
  const c = colorMap[color]
  return (
    <div className={`${c.bg} rounded-xl p-5 border border-transparent`}>
      <p className={`text-xs font-medium ${c.text} mb-2`}>{label}</p>
      <p className={`text-3xl font-bold ${c.num}`}>{value}</p>
    </div>
  )
}
