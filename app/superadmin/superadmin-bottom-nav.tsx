'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, LogOut, LayoutDashboard, Users, Settings, Lightbulb, MoreHorizontal, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/superadmin',               icon: LayoutDashboard },
  { label: 'Organizações', href: '/superadmin/organizacoes',  icon: Building2 },
  { label: 'Usuários',     href: '/superadmin/usuarios',      icon: Users },
  { label: 'Melhorias',    href: '/superadmin/melhorias',     icon: Lightbulb },
  { label: 'Config',       href: '/superadmin/configuracoes', icon: Settings },
]

const PRIMARY = '#3b82f6'
const MAX_PRIMARY = 4

export function SuperadminBottomNav() {
  const pathname = usePathname()
  const [maisOpen, setMaisOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/superadmin' ? pathname === '/superadmin' : pathname.startsWith(href)

  const showMais = NAV_ITEMS.length > MAX_PRIMARY
  const primaryItems = showMais ? NAV_ITEMS.slice(0, MAX_PRIMARY) : NAV_ITEMS
  const overflowItems = showMais ? NAV_ITEMS.slice(MAX_PRIMARY) : []

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-gray-950 border-t border-white/10 flex items-stretch">
        {primaryItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} onClick={() => setMaisOpen(false)}
              className="flex flex-1 flex-col items-center justify-center pt-2 pb-3 gap-0.5"
            >
              <div className="px-5 py-1 rounded-full transition-colors"
                style={active ? { backgroundColor: 'rgba(59,130,246,0.18)' } : {}}>
                <Icon size={20} style={{ color: active ? PRIMARY : '#6b7280' }} />
              </div>
              <span className="text-[10px] font-medium" style={{ color: active ? PRIMARY : '#6b7280' }}>{label}</span>
            </Link>
          )
        })}

        {showMais ? (
          <button onClick={() => setMaisOpen(v => !v)} className="flex flex-1 flex-col items-center justify-center pt-2 pb-3 gap-0.5">
            <div className={cn('px-5 py-1 rounded-full transition-colors', maisOpen ? 'bg-white/10' : '')}>
              <MoreHorizontal size={20} className={maisOpen ? 'text-white' : 'text-gray-500'} />
            </div>
            <span className={cn('text-[10px] font-medium', maisOpen ? 'text-white' : 'text-gray-500')}>Mais</span>
          </button>
        ) : (
          <form action="/api/auth/signout" method="post" className="flex flex-1">
            <button type="submit" className="flex flex-1 flex-col items-center justify-center pt-2 pb-3 gap-0.5">
              <div className="px-5 py-1 rounded-full">
                <LogOut size={20} className="text-gray-500" />
              </div>
              <span className="text-[10px] font-medium text-gray-500">Sair</span>
            </button>
          </form>
        )}
      </nav>

      <div
        className={cn('lg:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-300', maisOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
        onClick={() => setMaisOpen(false)}
      />
      <div
        className={cn(
          'lg:hidden fixed bottom-0 inset-x-0 z-50 bg-gray-900 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out',
          maisOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1" />
        <div className="px-3 pb-8 pt-2">
          {overflowItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link key={href} href={href} onClick={() => setMaisOpen(false)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors"
                style={active ? { color: PRIMARY, backgroundColor: 'rgba(59,130,246,0.12)' } : { color: '#e5e7eb' }}
              >
                <Icon size={22} style={{ color: active ? PRIMARY : '#6b7280' }} />
                <span className="text-sm font-medium">{label}</span>
                {active && <ChevronRight size={16} className="ml-auto" style={{ color: PRIMARY }} />}
              </Link>
            )
          })}
          <div className="my-2 border-t border-white/10" />
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 transition-colors w-full">
              <LogOut size={22} className="text-gray-500" />
              <span className="text-sm font-medium">Sair</span>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
