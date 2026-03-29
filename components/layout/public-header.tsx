"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

type PublicHeaderProps = {
  projectName: string;
  projectSubtitle?: string | null;
};

const navItems = [
  { title: "Início", href: "/" },
  { title: "Quem somos", href: "/quem-somos" },
  { title: "O que fazemos", href: "/o-que-estamos-fazendo" },
  { title: "Faça parte", href: "/faca-parte" },
  { title: "Contato", href: "/contato" },
];

export function PublicHeader({
  projectName,
  projectSubtitle,
}: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  function closeMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 md:py-5">
          <div className="min-w-0">
            <Link href="/" className="block text-xl font-bold text-zinc-900 md:text-2xl">
              {projectName}
            </Link>
            {projectSubtitle ? (
              <p className="truncate text-xs text-zinc-500 md:text-sm">
                {projectSubtitle}
              </p>
            ) : null}
          </div>

          <nav className="hidden items-center gap-4 md: p-6 text-sm text-zinc-700 md:flex">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "font-semibold text-zinc-900" : ""}
                >
                  {item.title}
                </Link>
              );
            })}

            <Link
              href="/seja-voluntario"
              className="rounded-xl bg-zinc-900 px-4 py-2 font-medium text-white"
            >
              Seja voluntário
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 text-zinc-900 md:hidden"
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <>
          <button
            type="button"
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-label="Fechar menu"
          />
          <div className="fixed inset-x-4 top-20 z-50 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl md:hidden">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`rounded-xl px-4 py-3 text-sm font-medium ${
                      active
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}

              <Link
                href="/seja-voluntario"
                onClick={closeMenu}
                className="mt-2 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-medium text-white"
              >
                Seja voluntário
              </Link>
            </nav>
          </div>
        </>
      ) : null}
    </>
  );
}