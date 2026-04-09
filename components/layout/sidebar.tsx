"use client";

import Link from "next/link";
import {
  Home,
  BookOpen,
  ClipboardList,
  HeartHandshake,
  FileText,
  Settings,
  Users,
  Image as ImageIcon,
  School,
  GraduationCap,
  CheckSquare,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAdminSidebar } from "@/components/layout/admin-sidebar-context";

const items = [
  { title: "Painel", href: "/admin", icon: Home },
  { title: "Funções", href: "/admin/funcoes-voluntariado", icon: BookOpen },
  { title: "Necessidades", href: "/admin/necessidades-voluntariado", icon: ClipboardList },
  { title: "Candidaturas", href: "/admin/candidaturas-voluntariado", icon: HeartHandshake },
  { title: "Documentos", href: "/admin/documentos-voluntariado", icon: FileText },
  { title: "Turmas", href: "/admin/turmas", icon: School },
  { title: "Presenças", href: "/admin/presencas", icon: CheckSquare },
  { title: "Alunos", href: "/admin/alunos", icon: GraduationCap },
  { title: "Usuários", href: "/admin/usuarios", icon: Users },
  { title: "Galeria", href: "/admin/galeria", icon: ImageIcon },
  { title: "Configurações", href: "/admin/configuracoes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, closeMobile } = useAdminSidebar();

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/40 md:hidden cursor-pointer"
          aria-label="Fechar menu"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 md:static md:z-auto md:w-64 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Atitude</h2>
            <p className="text-sm text-zinc-500">Projeto Social</p>
          </div>

          <button
            type="button"
            onClick={closeMobile}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 text-zinc-900 md:hidden cursor-pointer"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition cursor-pointer ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <Icon size={18} />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
