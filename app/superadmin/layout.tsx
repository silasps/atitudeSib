import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { Building2, LogOut, LayoutDashboard } from 'lucide-react'

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['superadmin'])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-white/10 flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-2 px-2 py-3 mb-6">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-xs font-black">OS</span>
          </div>
          <span className="text-sm font-semibold">Ostrich Social</span>
        </div>

        <nav className="space-y-1 flex-1">
          <Link
            href="/superadmin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <Link
            href="/superadmin/organizacoes"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
          >
            <Building2 size={16} />
            Organizações
          </Link>
        </nav>

        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition w-full text-left"
          >
            <LogOut size={16} />
            Sair
          </button>
        </form>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
