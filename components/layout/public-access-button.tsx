"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function PublicAccessButton({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [targetHref, setTargetHref] = useState("/painel");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setIsLoggedIn(!!session);
      setTargetHref(resolveHref(session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setTargetHref(resolveHref(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Link
      href={targetHref}
      onClick={onNavigate}
      className={
        mobile
          ? "inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
          : "hidden sm:inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
      }
    >
      {isLoggedIn ? "Painel" : "Entrar"}
    </Link>
  );
}

function resolveHref(session: Awaited<ReturnType<ReturnType<typeof createSupabaseBrowserClient>["auth"]["getSession"]>>["data"]["session"]) {
  if (!session) return "/painel";
  return "/painel";
}
