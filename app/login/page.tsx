"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setMessage("Não foi possível entrar. Verifique e-mail e senha.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Não foi possível confirmar sua conta.");
      setLoading(false);
      return;
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .eq("ativo", true)
      .maybeSingle();

    if (adminError) {
      setMessage("Não foi possível verificar sua autorização.");
      setLoading(false);
      return;
    }

    let destination = "/acesso-negado";

    if (adminUser) {
      destination = "/admin";
    } else {
      const { data: turmas, error: turmasError } = await supabase
        .from("turmas")
        .select("id")
        .eq("professor_user_id", user.id)
        .limit(1);

      if (turmasError) {
        setMessage("Não foi possível verificar sua autorização.");
        setLoading(false);
        return;
      }

      if (turmas?.length) {
        destination = "/professor/turmas";
      }
    }

    router.push(destination);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-4 md: p-4 md: p-4 md: p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Entrar no sistema</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Acesso restrito para administração e equipe autorizada.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </div>

          {message ? (
            <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
