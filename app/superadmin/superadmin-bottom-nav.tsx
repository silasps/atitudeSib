'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, LogOut, LayoutDashboard, Users, Settings, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/superadmin',               icon: LayoutDashboard },
  { label: 'Organizações', href: '/superadmin/organizacoes',  icon: Building2 },
  { label: 'Usuários',     href: '/superadmin/usuarios',      icon: Users },
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

      {maisOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setMaisOpen(false)} />
          <div className="lg:hidden fixed bottom-[57px] inset-x-0 z-40 bg-gray-900 border-t border-white/10 rounded-t-2xl shadow-xl">
            <div className="p-4 pt-3">
              <div className="w-8 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {overflowItems.map(({ label, href, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <Link key={href} href={href} onClick={() => setMaisOpen(false)}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition"
                      style={active ? { color: PRIMARY, backgroundColor: 'rgba(59,130,246,0.15)' } : { color: '#9ca3af' }}
                    >
                      <Icon size={22} />
                      <span className="text-center leading-tight">{label}</span>
                    </Link>
                  )
                })}
                <form action="/api/auth/signout" method="post">
                  <button type="submit" className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium text-gray-400 w-full">
                    <LogOut size={22} />
                    <span>Sair</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
