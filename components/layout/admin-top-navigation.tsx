"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const navItems = [
  { title: "Painel", href: "/admin" },
  { title: "Funções", href: "/admin/funcoes-voluntariado" },
  { title: "Necessidades", href: "/admin/necessidades-voluntariado" },
  { title: "Candidaturas", href: "/admin/candidaturas-voluntariado" },
  { title: "Turmas", href: "/admin/turmas" },
  { title: "Alunos", href: "/admin/alunos" },
  { title: "Usuários", href: "/admin/usuarios" },
  { title: "Galeria", href: "/admin/galeria" },
  { title: "Configurações", href: "/admin/configuracoes" },
];

export function AdminTopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  function toggleMobile() {
    setMobileOpen((prev) => !prev);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    closeMobile();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Link href="/admin" className="block text-xl font-bold text-zinc-900">
                Atitude
              </Link>
              <p className="text-sm text-zinc-500">Painel administrativo</p>
            </div>

            <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex lg:flex-wrap">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 lg:inline-flex"
              >
                Sair
              </button>

              <button
                type="button"
                onClick={toggleMobile}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 text-zinc-900 lg:hidden"
                aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <>
          <button
            type="button"
            onClick={closeMobile}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Fechar menu"
          />
          <div className="fixed inset-x-4 top-20 z-50 rounded-3xl border border-zinc-200 bg-white p-4 shadow-xl lg:hidden">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 rounded-xl border border-zinc-300 px-4 py-3 text-left text-sm font-medium text-zinc-900"
              >
                Sair
              </button>
            </nav>
          </div>
        </>
      ) : null}
    </>
  );
}
