import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import FichaImpressao from './ficha-impressao'

export default async function FichaImpressaoPage() {
  const { profile } = await requireRole(['admin', 'funcionario', 'superadmin'])
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('nome')
    .eq('id', profile.org_id)
    .single()

  return <FichaImpressao orgNome={org?.nome ?? 'Projeto'} />
}
