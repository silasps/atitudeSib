import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Globe, Palette, Type, Image, MessageSquare, Link2 } from 'lucide-react'
import type { SiteConfig } from '@/types'

export default async function SitePage() {
  const { profile } = await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  const { data: config } = await supabase
    .from('site_config')
    .select('*')
    .eq('org_id', profile.org_id)
    .single()

  const siteConfig = config as SiteConfig | null

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Público</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie as informações e aparência do seu site público
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
            siteConfig?.publicado
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            <Globe size={12} />
            {siteConfig?.publicado ? 'Publicado' : 'Não publicado'}
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          icon={<Image size={22} className="text-orange-500" />}
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
      </div>

      {siteConfig && !siteConfig.publicado && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 font-medium mb-1">Seu site ainda não está publicado</p>
          <p className="text-xs text-amber-600">
            Configure o conteúdo e a aparência e depois publique para que visitantes possam ver.
          </p>
          <Link href="/admin/site/aparencia" className="inline-block mt-2 text-xs text-amber-700 font-semibold hover:text-amber-800">
            Configurar e publicar →
          </Link>
        </div>
      )}
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
