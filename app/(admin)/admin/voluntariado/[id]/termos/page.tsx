import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import GerenciarTermosVoluntario from './gerenciar-termos-voluntario'

interface Props { params: Promise<{ id: string }> }

export default async function TermosVoluntarioAdminPage({ params }: Props) {
  const { id } = await params
  const { profile } = await requireRole(['admin', 'funcionario', 'superadmin'])
  const supabase = await createClient()

  const { data: candidatura } = await supabase
    .from('candidaturas_voluntariado')
    .select('id, nome, email, telefone, status, created_at')
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .single()

  if (!candidatura) notFound()

  const { data: termos } = await supabase
    .from('termos_ficha')
    .select('id, tipo, status, signed_at, signed_by_name, signed_by_email, expires_at, created_at, token')
    .eq('voluntario_id', id)
    .order('created_at', { ascending: false })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <a href="/admin/voluntariado" className="text-sm text-gray-400 hover:text-gray-600">← Voluntariado</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{candidatura.nome}</h1>
        <p className="text-gray-500 text-sm mt-0.5">Termo de voluntariado digital</p>
        {candidatura.email && (
          <p className="text-xs text-gray-400 mt-1">{candidatura.email}</p>
        )}
      </div>

      <GerenciarTermosVoluntario
        candidaturaId={id}
        nome={candidatura.nome}
        email={candidatura.email}
        termos={termos ?? []}
        siteUrl={siteUrl}
      />
    </div>
  )
}
