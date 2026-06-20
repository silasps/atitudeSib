"use client";

import Link from "next/link";
import { ArrowUpRight, HeartHandshake, Menu, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PublicAccessButton } from "@/components/layout/public-access-button";

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
  const [headerVisible, setHeaderVisible] = useState(true);
  const pathname = usePathname();
  const lastScrollY = useRef(0);

  function closeMenu() {
    setMobileOpen(false);
    setHeaderVisible(true);
  }

  function toggleMobile() {
    setMobileOpen((prev) => {
      const next = !prev;

      if (next) {
        setHeaderVisible(true);
      }

      return next;
    });
  }

  useEffect(() => {
    function handleScroll() {
      const current = window.scrollY;
      const delta = current - lastScrollY.current;

      if (current <= 20) {
        setHeaderVisible(true);
      } else if (delta > 15) {
        setHeaderVisible(false);
      } else if (delta < -10) {
        setHeaderVisible(true);
      }

      lastScrollY.current = current;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-white/60 bg-white/85 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-transform duration-200 ease-out will-change-transform ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-800">
              <Sparkles size={12} />
              Projeto social ativo
            </div>
            <Link
              href="/"
              className="flex items-center gap-3 text-zinc-950"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg shadow-zinc-950/15">
                <HeartHandshake size={19} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-bold md:text-2xl">
                  {projectName}
                </span>
                {projectSubtitle ? (
                  <span className="block truncate text-xs font-medium text-zinc-500 md:text-sm">
                    {projectSubtitle}
                  </span>
                ) : null}
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-2 rounded-full border border-zinc-200/80 bg-white/90 px-3 py-2 text-sm text-zinc-700 md:flex">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-2 transition ${
                    active
                      ? "bg-zinc-950 text-white shadow-sm"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/seja-voluntario"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:translate-y-[-1px]"
            >
              Seja voluntário
              <ArrowUpRight size={16} />
            </Link>

            <PublicAccessButton />
          </div>

          <button
            type="button"
            onClick={toggleMobile}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-300 bg-white text-zinc-900 md:hidden"
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
            className="fixed inset-0 z-40 bg-zinc-950/45 md:hidden"
            aria-label="Fechar menu"
          />
          <div className="fixed inset-x-4 top-20 z-50 rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-2xl backdrop-blur md:hidden">
            <div className="mb-4 rounded-[1.5rem] bg-zinc-950 px-4 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.35em] text-white/65">
                Navegação pública
              </p>
              <p className="mt-2 text-lg font-semibold">{projectName}</p>
              {projectSubtitle ? (
                <p className="mt-1 text-sm text-white/75">{projectSubtitle}</p>
              ) : null}
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                      active
                        ? "bg-zinc-950 text-white"
                        : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}

              <Link
                href="/seja-voluntario"
                onClick={closeMenu}
                className="mt-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Seja voluntário
              </Link>

              <div className="mt-2">
                <PublicAccessButton mobile onNavigate={closeMenu} />
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </>
  );
}
