import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import NovaTurmaForm from './nova-turma-form'
import type { Profile } from '@/types'

export default async function NovaTurmaPage() {
  const { profile } = await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  const { data: professores } = await supabase
    .from('profiles')
    .select('id, nome')
    .eq('org_id', profile.org_id)
    .eq('role', 'professor')
    .eq('ativo', true)
    .order('nome')

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Nova turma</h1>
      <p className="text-gray-500 text-sm mb-8">Configure a turma com horário e professor responsável.</p>
      <NovaTurmaForm professores={(professores || []) as Pick<Profile, 'id' | 'nome'>[]} />
    </div>
  )
}
