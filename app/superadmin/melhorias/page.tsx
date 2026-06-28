import { requireRole } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase-server'
import { MelhoriasClient } from './melhorias-client'

export default async function MelhoriasPage() {
  await requireRole(['superadmin'])

  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('sugestoes_melhoria')
    .select('*, profiles(nome, email)')
    .order('created_at', { ascending: false })

  return <MelhoriasClient initialData={data ?? []} />
}
