import Link from "next/link";
import {
  Home,
  BookOpen,
  ClipboardList,
  HeartHandshake,
  Settings,
  Users,
  Image as ImageIcon,
} from "lucide-react";

const items = [
  { title: "Painel", href: "/admin", icon: Home },
  { title: "Funções", href: "/admin/funcoes-voluntariado", icon: BookOpen },
  { title: "Necessidades", href: "/admin/necessidades-voluntariado", icon: ClipboardList },
  { title: "Candidaturas", href: "/admin/candidaturas-voluntariado", icon: HeartHandshake },
  { title: "Usuários", href: "/admin/usuarios", icon: Users },
  { title: "Galeria", href: "/admin/galeria", icon: ImageIcon },
  { title: "Configurações", href: "/admin/configuracoes", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-zinc-200 bg-white md:flex md:flex-col">
      <div className="border-b border-zinc-200 px-6 py-5">
        <h2 className="text-xl font-bold text-zinc-900">Atitude</h2>
        <p className="text-sm text-zinc-500">Projeto Social</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              <Icon size={18} />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}