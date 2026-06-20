import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { headers } from 'next/headers'
import { resolveOrgFromHost, getSiteConfig } from '@/lib/tenant'
import { COLOR_PALETTE } from '@/types'
import AdminSidebar from './admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole(['admin', 'funcionario', 'superadmin'])

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost'

  const tenantResult = await resolveOrgFromHost(host)
  const siteConfig = tenantResult ? await getSiteConfig(tenantResult.org.id) : null

  const orgName = siteConfig?.hero_titulo || tenantResult?.org.nome || 'Ostrich Social'
  const logoUrl = siteConfig?.logo_url || null
  const corPrimaria = siteConfig?.cor_primaria || 'azul-oceano'
  const colors = COLOR_PALETTE[corPrimaria as keyof typeof COLOR_PALETTE] || COLOR_PALETTE['azul-oceano']

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar
        orgName={orgName}
        logoUrl={logoUrl}
        primaryColor={colors.primary}
        userNome={profile.nome}
        userRole={profile.role}
      />
      <main className="flex-1 overflow-auto pt-14 lg:pt-0 min-w-0">
        {children}
      </main>
    </div>
  )
}
