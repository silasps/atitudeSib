import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Palette, Type, Image as ImageIcon, MessageSquare, Link2, Eye } from 'lucide-react'
import type { SiteConfig } from '@/types'
import SiteOverviewActions from './_components/site-overview-actions'

export default async function SitePage() {
  const { profile } = await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  const [configResult, orgResult, domainsResult] = await Promise.all([
    supabase.from('site_config').select('*').eq('org_id', profile.org_id).single(),
    supabase.from('organizations').select('slug').eq('id', profile.org_id).single(),
    supabase.from('custom_domains').select('domain, verificado').eq('org_id', profile.org_id),
  ])

  const siteConfig = configResult.data as SiteConfig | null
  const orgSlug = orgResult.data?.slug ?? ''
  const customDomains = domainsResult.data ?? []
  const verifiedDomains = customDomains.filter(d => d.verificado)
  const subdomain = `${orgSlug}.ostricksocial.com.br`

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Público</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie as informações e aparência do seu site público
          </p>
        </div>
      </div>

      {/* Card de URL + publicação */}
      <SiteOverviewActions
        subdomain={subdomain}
        verifiedDomains={verifiedDomains.map(d => d.domain)}
        publicado={siteConfig?.publicado ?? false}
        hasSiteConfig={!!siteConfig}
      />

      {/* Cards de seções */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <SiteCard
          href="/admin/site/aparencia"
          icon={<Palette size={22} className="text-purple-500" />}
          title="Aparência"
          desc="Template, cores e logo"
          iconBg="bg-purple-50"
        />
        <SiteCard
          href="/admin/site/conteudo"
          icon={<Type size={22} className="text-blue-500" />}
          title="Conteúdo"
          desc="Hero, sobre, missão, contato"
          iconBg="bg-blue-50"
        />
        <SiteCard
          href="/admin/site/posts"
          icon={<MessageSquare size={22} className="text-green-500" />}
          title="Projetos e Notícias"
          desc="Publicações e atualizações"
          iconBg="bg-green-50"
        />
        <SiteCard
          href="/admin/site/galeria"
          icon={<ImageIcon size={22} className="text-orange-500" />}
          title="Galeria de Fotos"
          desc="Imagens e momentos"
          iconBg="bg-orange-50"
        />
        <SiteCard
          href="/admin/site/dominio"
          icon={<Link2 size={22} className="text-indigo-500" />}
          title="Domínio Customizado"
          desc="Configure seu domínio próprio"
          iconBg="bg-indigo-50"
        />
        <SiteCard
          href="/admin/site/preview"
          icon={<Eye size={22} className="text-teal-500" />}
          title="Pré-visualizar"
          desc="Veja como o visitante vê o site"
          iconBg="bg-teal-50"
        />
      </div>
    </div>
  )
}

function SiteCard({ href, icon, title, desc, iconBg }: {
  href: string; icon: React.ReactNode; title: string; desc: string; iconBg: string
}) {
  return (
    <Link href={href}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-blue-200 transition group flex gap-4 items-start">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </Link>
  )
}
