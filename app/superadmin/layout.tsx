import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { Building2, LogOut, LayoutDashboard, Users, Settings } from 'lucide-react'
import { SuperadminBottomNav } from './superadmin-bottom-nav'

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['superadmin'])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-56 border-r border-white/10 flex-col p-4 shrink-0">
        <div className="flex items-center gap-2 px-2 py-3 mb-6">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-xs font-black">OS</span>
          </div>
          <div>
            <span className="text-sm font-semibold block">Ostrick Social</span>
            <span className="text-xs text-gray-500">Super Admin</span>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <p className="text-xs text-gray-600 uppercase tracking-wider px-3 mb-1">Plataforma</p>
          <Link href="/superadmin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link href="/superadmin/organizacoes" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">
            <Building2 size={16} /> Organizações
          </Link>
          <Link href="/superadmin/usuarios" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">
            <Users size={16} /> Usuários
          </Link>

          <p className="text-xs text-gray-600 uppercase tracking-wider px-3 mt-4 mb-1">Sistema</p>
          <Link href="/superadmin/configuracoes" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">
            <Settings size={16} /> Configurações
          </Link>
        </nav>

        <form action="/api/auth/signout" method="post">
          <button type="submit" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition w-full text-left">
            <LogOut size={16} /> Sair
          </button>
        </form>
      </aside>

      <SuperadminBottomNav />

      <main className="flex-1 overflow-auto pb-16 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
