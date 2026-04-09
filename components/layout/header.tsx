"use client";

import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useAdminSidebar } from "@/components/layout/admin-sidebar-context";
import { useEffect, useRef, useState } from "react";

export function Header() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { toggleMobile } = useAdminSidebar();
  const [hidden, setHidden] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll.current && current > 20) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScroll.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className={`sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 py-2 transition-transform duration-300 ease-out ${hidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobile}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 text-zinc-900 md:hidden cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <p className="text-sm text-zinc-500">Sistema de gestão</p>
          <h1 className="text-base font-semibold text-zinc-900 md:text-lg">
            Atitude
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 md:px-4 cursor-pointer"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
