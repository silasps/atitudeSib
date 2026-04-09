"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const error = searchParams.get("error") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-4 md:p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Entrar no sistema</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Acesso restrito para administração e equipe autorizada.
        </p>

        <form
          action="/api/auth/login"
          method="POST"
          className="mt-6 space-y-4"
          onSubmit={() => setLoading(true)}
        >
          <input type="hidden" name="redirect" value={redirect} />

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              E-mail
            </label>
            <input
              type="email"
              name="email"
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
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </div>

          {error ? (
            <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
