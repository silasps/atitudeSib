'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, MessageSquare, Menu, X, LogOut, ChevronRight } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

interface Props {
  orgName: string
  logoUrl: string | null
  primaryColor: string
  userNome: string
}

const NAV_ITEMS = [
  { label: 'Início', href: '/professor', icon: LayoutDashboard },
  { label: 'Minhas Turmas', href: '/professor/turmas', icon: BookOpen },
  { label: 'Comunicados', href: '/professor/comunicados', icon: MessageSquare },
]

export default function ProfessorSidebar({ orgName, logoUrl, primaryColor, userNome }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <Menu size={20} className="text-gray-600" />
      </button>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 flex flex-col transition-transform lg:static lg:translate-x-0 lg:z-auto shrink-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          {logoUrl ? (
            <img src={logoUrl} alt={orgName} className="h-8 w-8 object-contain rounded" />
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: primaryColor }}>
              {orgName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold text-gray-900 truncate">{orgName}</span>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-gray-400"><X size={18} /></button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = href === '/professor' ? pathname === '/professor' : pathname.startsWith(href)
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition group',
                  isActive ? 'text-white font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
                style={isActive ? { backgroundColor: primaryColor } : {}}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto text-white/70" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style={{ backgroundColor: primaryColor }}>
              {getInitials(userNome)}
            </div>
            <p className="text-xs font-medium text-gray-900 truncate">{userNome}</p>
          </div>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition">
              <LogOut size={15} />Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
