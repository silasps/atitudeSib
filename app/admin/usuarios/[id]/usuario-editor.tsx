"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminUser, AdminUserRole } from "@/types/admin-user";

type Props = {
  initialUser: AdminUser;
};

type EditorForm = {
  email: string;
  nome: string;
  role: AdminUserRole;
  ativo: boolean;
  password: string;
};

export default function UsuarioEditor({ initialUser }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<EditorForm>({
    email: initialUser.email,
    nome: initialUser.nome || "",
    role: initialUser.role,
    ativo: initialUser.ativo,
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload: Record<string, unknown> = {
      email: form.email.trim().toLowerCase(),
      nome: form.nome.trim() || null,
      role: form.role,
      ativo: form.ativo,
    };

    if (form.password.trim()) {
      payload.password = form.password;
    }

    const response = await fetch(`/api/admin/usuarios/${initialUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Erro ao atualizar usuário.");
      setSaving(false);
      return;
    }

    setMessage("Atualizado com sucesso.");
    setForm((prev) => ({ ...prev, password: "" }));
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja remover este usuário do painel? Isso também removerá o Auth correspondente."
    );
    if (!confirmDelete) {
      return;
    }

    setDeleting(true);
    setMessage("");

    const response = await fetch(`/api/admin/usuarios/${initialUser.id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Erro ao excluir usuário.");
      setDeleting(false);
      return;
    }

    router.push("/admin/usuarios");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-zinc-500">ID no Auth</p>
            <p className="font-semibold text-zinc-900">{initialUser.id}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              form.ativo
                ? "bg-emerald-100 text-emerald-700"
                : "bg-zinc-200 text-zinc-700"
            }`}
          >
            {form.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 text-sm text-zinc-500 sm:grid-cols-2">
          <p>Criado em: {new Date(initialUser.created_at).toLocaleString("pt-BR")}</p>
          <p>
            Criado por: {initialUser.created_by_user_email || "Não informado"}
          </p>
        </div>

        <form onSubmit={handleUpdate} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              E-mail
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
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
              value={form.nome}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Senha temporária (preencha apenas se quiser redefinir)
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Perfil
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleInputChange}
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
              checked={form.ativo}
              onChange={handleCheckboxChange}
            />
            <span className="text-sm text-zinc-700">
              Usuário autorizado para acessar o painel
            </span>
          </label>

          {message ? (
            <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
              {message}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 md:flex-row-reverse md:items-center md:justify-between">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 md:w-auto"
            >
              {saving ? "Atualizando..." : "Salvar alterações"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full rounded-xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-700 disabled:opacity-60 md:w-auto"
            >
              {deleting ? "Removendo..." : "Remover usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
