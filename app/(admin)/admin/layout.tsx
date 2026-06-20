import { requireRole } from '@/lib/auth'
import { headers, cookies } from 'next/headers'
import { resolveOrgFromHost, getSiteConfig } from '@/lib/tenant'
import { COLOR_PALETTE } from '@/types'
import { createServiceClient } from '@/lib/supabase-server'
import AdminSidebar from './admin-sidebar'
import ImpersonationBanner from '@/components/superadmin/impersonation-banner'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole(['admin', 'funcionario', 'superadmin'])

  const cookieStore = await cookies()
  const impOrgId = cookieStore.get('sa_imp_org_id')?.value
  const isImpersonating = !!impOrgId && profile.role === 'superadmin'

  let orgName = 'Ostrick Social'
  let logoUrl: string | null = null
  let colors = COLOR_PALETTE['azul-oceano']
  let impOrgNome = ''

  if (isImpersonating) {
    // Resolve org pelo ID do cookie de impersonação
    const supabase = await createServiceClient()
    const { data: org } = await supabase.from('organizations').select('*').eq('id', impOrgId).single()
    if (org) {
      const siteConfig = await getSiteConfig(org.id)
      orgName = siteConfig?.hero_titulo || org.nome
      logoUrl = siteConfig?.logo_url || null
      const cor = siteConfig?.cor_primaria || 'azul-oceano'
      colors = COLOR_PALETTE[cor as keyof typeof COLOR_PALETTE] || COLOR_PALETTE['azul-oceano']
      impOrgNome = org.nome
    }
  } else {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost'
    const tenantResult = await resolveOrgFromHost(host)
    const siteConfig = tenantResult ? await getSiteConfig(tenantResult.org.id) : null
    orgName = siteConfig?.hero_titulo || tenantResult?.org.nome || 'Ostrick Social'
    logoUrl = siteConfig?.logo_url || null
    const cor = siteConfig?.cor_primaria || 'azul-oceano'
    colors = COLOR_PALETTE[cor as keyof typeof COLOR_PALETTE] || COLOR_PALETTE['azul-oceano']
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {isImpersonating && <ImpersonationBanner orgNome={impOrgNome} />}
      <AdminSidebar
        orgName={orgName}
        logoUrl={logoUrl}
        primaryColor={colors.primary}
        userNome={profile.nome}
        userRole={profile.role}
      />
      <main className={`flex-1 overflow-auto min-w-0 pb-16 lg:pb-0 ${isImpersonating ? 'pt-4 lg:pt-10' : 'pt-0 lg:pt-0'}`}>
        {children}
      </main>
    </div>
  )
}
