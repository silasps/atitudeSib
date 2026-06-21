import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import DominioForm from './dominio-form'
import type { CustomDomain } from '@/types'

export default async function DominioPage() {
  const { profile } = await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  const { data: dominios } = await supabase
    .from('custom_domains')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <a href="/admin/site" className="text-sm text-gray-400 hover:text-gray-600 mb-3 inline-block">← Site Público</a>
        <h1 className="text-2xl font-bold text-gray-900">Domínio Customizado</h1>
        <p className="text-gray-500 text-sm mt-1">
          Aponte seu domínio próprio para o site da organização.
        </p>
      </div>

      <DominioForm dominios={(dominios || []) as CustomDomain[]} />
    </div>
  )
}
