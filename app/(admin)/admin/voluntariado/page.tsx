import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { Users, Briefcase, FileText, ClipboardList } from 'lucide-react'
import Link from 'next/link'

export default async function VoluntariadoPage() {
  const { profile } = await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  const [funcoes, necessidades, candidaturas] = await Promise.all([
    supabase.from('funcoes_voluntariado').select('id', { count: 'exact' }).eq('org_id', profile.org_id),
    supabase.from('necessidades_voluntariado').select('id', { count: 'exact' }).eq('org_id', profile.org_id).eq('status', 'ativa'),
    supabase.from('candidaturas_voluntariado').select('id', { count: 'exact' }).eq('org_id', profile.org_id).eq('status', 'pendente'),
  ])

  const cards = [
    {
      title: 'Funções',
      description: 'Tipos de voluntariado disponíveis',
      count: funcoes.count ?? 0,
      icon: Briefcase,
      href: '/admin/voluntariado/funcoes',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Necessidades Ativas',
      description: 'Vagas abertas para voluntários',
      count: necessidades.count ?? 0,
      icon: ClipboardList,
      href: '/admin/voluntariado/necessidades',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Candidaturas Pendentes',
      description: 'Aguardando avaliação',
      count: candidaturas.count ?? 0,
      icon: FileText,
      href: '/admin/voluntariado/candidaturas',
      color: candidaturas.count ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-700 border-gray-200',
    },
    {
      title: 'Participantes',
      description: 'Voluntários ativos no projeto',
      count: null,
      icon: Users,
      href: '/admin/voluntariado/participantes',
      color: 'bg-green-50 text-green-700 border-green-200',
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Voluntariado</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie funções, vagas e candidatos ao voluntariado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`border rounded-xl p-6 flex items-start gap-4 hover:shadow-sm transition ${card.color}`}
            >
              <div className="p-2 rounded-lg bg-white/60">
                <Icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-base">{card.title}</h3>
                  {card.count !== null && (
                    <span className="text-2xl font-bold">{card.count}</span>
                  )}
                </div>
                <p className="text-sm opacity-75 mt-0.5">{card.description}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-800 mb-1">Módulo em construção</h2>
        <p className="text-sm text-gray-500">
          O gerenciamento detalhado de funções, necessidades e candidaturas estará disponível em breve.
          Por enquanto, você pode visualizar as candidaturas que chegam pelo site público.
        </p>
      </div>
    </div>
  )
}
