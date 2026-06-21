import { requireRole } from '@/lib/auth'
import { headers, cookies } from 'next/headers'
import { resolveOrgFromHost, getSiteConfig } from '@/lib/tenant'
import { COLOR_PALETTE } from '@/types'
import { createServiceClient } from '@/lib/supabase-server'
import AdminSidebar from './admin-sidebar'
import ImpersonationBanner from '@/components/superadmin/impersonation-banner'
import { RolePreviewBanner } from '@/components/admin/role-preview-banner'
import type { UserRole } from '@/types'

const PREVIEWABLE: UserRole[] = ['admin', 'funcionario']

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole(['admin', 'funcionario', 'superadmin'])

  const cookieStore = await cookies()
  const impOrgId = cookieStore.get('sa_imp_org_id')?.value
  const isImpersonating = !!impOrgId && profile.role === 'superadmin'

  // Preview de role — apenas superadmin pode simular outras roles
  const previewCookie = cookieStore.get('os_admin_preview_role')?.value ?? null
  const previewRole: UserRole | null =
    profile.role === 'superadmin' && previewCookie && PREVIEWABLE.includes(previewCookie as UserRole)
      ? (previewCookie as UserRole)
      : null
  const effectiveRole: UserRole = previewRole ?? profile.role

  let orgName = 'Ostrick Social'
  let logoUrl: string | null = null
  let colors = COLOR_PALETTE['azul-oceano']
  let impOrgNome = ''

  if (isImpersonating) {
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

  const topPadding = previewRole
    ? isImpersonating ? 'pt-20' : 'pt-10'
    : isImpersonating ? 'pt-4 lg:pt-10' : 'pt-0'

  return (
    <div className="min-h-screen flex bg-gray-50">
      {previewRole && <RolePreviewBanner previewRole={previewRole} />}
      {isImpersonating && <ImpersonationBanner orgNome={impOrgNome} />}
      <AdminSidebar
        orgName={orgName}
        logoUrl={logoUrl}
        primaryColor={colors.primary}
        userNome={profile.nome}
        userRole={profile.role}
        effectiveRole={effectiveRole}
        previewRole={previewRole}
      />
      <main className={`flex-1 overflow-auto pb-16 lg:pb-0 ${topPadding}`}>
        {children}
      </main>
    </div>
  )
}
