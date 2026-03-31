"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/ui/page-title";
import type { AdminUserRole } from "@/types/admin-user";

type FormData = {
  email: string;
  nome: string;
  password: string;
  role: AdminUserRole;
  ativo: boolean;
};

const emptyForm: FormData = {
  email: "",
  nome: "",
  password: "",
  role: "admin",
  ativo: true,
};

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function setField(
    field: keyof FormData,
    value: string | boolean
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      email: formData.email.trim().toLowerCase(),
      nome: formData.nome.trim() || null,
      password: formData.password,
      role: formData.role,
      ativo: formData.ativo,
    };

    const response = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Erro ao cadastrar usuário.");
      setSaving(false);
      return;
    }

    setMessage("Usuário autorizado cadastrado com sucesso.");
    setFormData(emptyForm);
    setSaving(false);

    router.prefetch("/admin/usuarios");
    router.push("/admin/usuarios");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <PageTitle
          title="Novo usuário"
          subtitle="Crie um acesso administrativo com perfil e senha temporária"
        />
        <Link
          href="/admin/usuarios"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          ← Voltar para usuários
        </Link>
      </div>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Autorizar acesso</h2>
        <p className="mt-1 text-sm text-zinc-500">
          O Supabase Auth criará o usuário automaticamente com a senha temporária informada.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(event) => setField("email", event.target.value)}
              required
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Nome
            </label>
            <input
              name="nome"
              value={formData.nome}
              onChange={(event) => setField("nome", event.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Senha temporária
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(event) => setField("password", event.target.value)}
              required
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Perfil
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={(event) =>
                setField("role", event.target.value as AdminUserRole)
              }
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            >
              <option value="admin">Admin</option>
              <option value="professor">Professor</option>
            </select>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3">
            <input
              type="checkbox"
              name="ativo"
              checked={formData.ativo}
              onChange={(event) => setField("ativo", event.target.checked)}
            />
            <span className="text-sm text-zinc-700">
              Usuário ativo para acessar o sistema
            </span>
          </label>

          {message ? (
            <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
              {message}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Autorizar usuário"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
