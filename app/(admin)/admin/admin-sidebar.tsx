'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  Heart, Globe, Settings, LogOut, ChevronRight
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import {
  canVerDashboard, canVerAlunos, canVerTurmas,
  canGerenciarUsuarios, canGerenciarVoluntariado,
  canGerenciarSite, canGerenciarConfiguracoes,
  ROLE_LABELS,
} from '@/lib/rbac'
import { RolePreviewSelector } from '@/components/admin/role-preview-selector'
import type { UserRole } from '@/types'

interface AdminSidebarProps {
  orgName: string
  logoUrl: string | null
  primaryColor: string
  userNome: string
  userRole: UserRole
  effectiveRole: UserRole
  previewRole: UserRole | null
}

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/admin',                icon: LayoutDashboard, can: canVerDashboard },
  { label: 'Usuários',     href: '/admin/usuarios',       icon: Users,           can: canGerenciarUsuarios },
  { label: 'Alunos',       href: '/admin/alunos',         icon: GraduationCap,   can: canVerAlunos },
  { label: 'Turmas',       href: '/admin/turmas',         icon: BookOpen,        can: canVerTurmas },
  { label: 'Voluntariado', href: '/admin/voluntariado',   icon: Heart,           can: canGerenciarVoluntariado },
  { label: 'Site Público', href: '/admin/site',           icon: Globe,           can: canGerenciarSite },
  { label: 'Configurações',href: '/admin/configuracoes',  icon: Settings,        can: canGerenciarConfiguracoes },
]

export default function AdminSidebar({
  orgName, logoUrl, primaryColor, userNome, userRole, effectiveRole, previewRole
}: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const visibleItems = NAV_ITEMS.filter(({ can }) => can(effectiveRole))

  return (
    <>
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r border-gray-200">
        {/* Cabeçalho da org */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          {logoUrl ? (
            <img src={logoUrl} alt={orgName} className="h-8 w-8 object-contain rounded" />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {orgName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold text-gray-900 truncate">{orgName}</span>
        </div>

        {/* Seletor de preview — apenas superadmin */}
        {userRole === 'superadmin' && (
          <RolePreviewSelector currentPreview={previewRole} />
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-auto">
          {visibleItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition group',
                  active ? 'text-white font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
                style={active ? { backgroundColor: primaryColor } : {}}
              >
                <Icon size={16} className={active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-white/70" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer com usuário */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {getInitials(userNome)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{userNome}</p>
              <p className="text-xs text-gray-400 capitalize">{ROLE_LABELS[userRole]}</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              <LogOut size={15} />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Bottom nav — mobile only */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex items-stretch">
        {visibleItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors"
              style={active ? { color: primaryColor } : {}}
            >
              <Icon
                size={20}
                style={active ? { color: primaryColor } : {}}
                className={active ? '' : 'text-gray-400'}
              />
              <span className={active ? '' : 'text-gray-400'}>{label}</span>
            </Link>
          )
        })}
        <form action="/api/auth/signout" method="post" className="flex flex-1">
          <button
            type="submit"
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-gray-400"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </form>
      </nav>
    </>
  )
}
