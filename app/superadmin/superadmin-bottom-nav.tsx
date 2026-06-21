'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, LogOut, LayoutDashboard, Users, Settings, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/superadmin',                icon: LayoutDashboard },
  { label: 'Organizações', href: '/superadmin/organizacoes',   icon: Building2 },
  { label: 'Usuários',     href: '/superadmin/usuarios',       icon: Users },
  { label: 'Config',       href: '/superadmin/configuracoes',  icon: Settings },
]

const PRIMARY_COLOR = '#3b82f6'
const MAX_PRIMARY = 4

export function SuperadminBottomNav() {
  const pathname = usePathname()
  const [maisOpen, setMaisOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/superadmin' ? pathname === '/superadmin' : pathname.startsWith(href)

  const showMais = NAV_ITEMS.length > MAX_PRIMARY
  const primaryItems = showMais ? NAV_ITEMS.slice(0, MAX_PRIMARY) : NAV_ITEMS
  const overflowItems = showMais ? NAV_ITEMS.slice(MAX_PRIMARY) : []
  const totalSlots = primaryItems.length + 1
  const centerIdx = Math.floor((totalSlots - 1) / 2)

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-gray-950 border-t border-white/10 flex items-end">
        {primaryItems.map(({ label, href, icon: Icon }, idx) => {
          const active = isActive(href)
          const isCenter = idx === centerIdx

          if (isCenter) {
            return (
              <Link key={href} href={href} onClick={() => setMaisOpen(false)} className="flex flex-1 flex-col items-center gap-0.5 pb-2">
                <div
                  className="w-12 h-12 -mt-4 rounded-full flex items-center justify-center shadow-lg transition-colors"
                  style={{ backgroundColor: active ? PRIMARY_COLOR : 'rgba(59,130,246,0.2)' }}
                >
                  <Icon size={22} style={{ color: active ? 'white' : PRIMARY_COLOR }} />
                </div>
                <span className="text-[10px] font-medium" style={{ color: active ? PRIMARY_COLOR : '#6b7280' }}>{label}</span>
              </Link>
            )
          }

          return (
            <Link key={href} href={href} onClick={() => setMaisOpen(false)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors"
              style={active ? { color: PRIMARY_COLOR } : { color: '#6b7280' }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          )
        })}

        {showMais ? (
          <button onClick={() => setMaisOpen(v => !v)} className={cn('flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium', maisOpen ? 'text-white' : 'text-gray-500')}>
            <MoreHorizontal size={20} />
            <span>Mais</span>
          </button>
        ) : (
          <form action="/api/auth/signout" method="post" className="flex flex-1">
            <button type="submit" className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-gray-500">
              <LogOut size={20} />
              <span>Sair</span>
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
                      style={active ? { color: PRIMARY_COLOR, backgroundColor: 'rgba(59,130,246,0.15)' } : { color: '#9ca3af' }}
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
