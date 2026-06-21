import { createServiceClient } from '@/lib/supabase-server'

export default async function SuperadminDashboardPage() {
  const supabase = await createServiceClient()

  const [{ count: orgsCount }, { count: profilesCount }] = await Promise.all([
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard da Plataforma</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Organizações" value={orgsCount ?? 0} />
        <StatCard label="Usuários totais" value={profilesCount ?? 0} />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}
