import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import GaleriaClient from './galeria-client'

export default async function SiteGaleriaPage() {
  const { profile } = await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  const { data: fotos } = await supabase
    .from('site_galeria')
    .select('id, titulo, imagem_url, descricao, created_at')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/admin/site" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-4">
          <ArrowLeft size={15} /> Site Público
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Galeria de Fotos</h1>
        <p className="text-gray-500 text-sm mt-1">Imagens exibidas no site público</p>
      </div>

      <GaleriaClient fotos={fotos ?? []} />
    </div>
  )
}
