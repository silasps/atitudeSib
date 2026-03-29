"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function Header() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div>
        <p className="text-sm text-zinc-500">Sistema de gestão</p>
        <h1 className="text-lg font-semibold text-zinc-900">Atitude</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900"
        >
          Sair
        </button>
      </div>
    </header>
  );
}