"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageTitle } from "@/components/ui/page-title";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { AdminUser, AdminUserRole } from "@/types/admin-user";

type FormDataType = {
  email: string;
  nome: string;
  role: AdminUserRole;
  ativo: boolean;
  password: string;
};

const emptyForm: FormDataType = {
  email: "",
  nome: "",
  role: "admin",
  ativo: true,
  password: "",
};

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("pt-BR");
}

export default function UsuariosPage() {
  const supabase = createSupabaseBrowserClient();

  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [formData, setFormData] = useState<FormDataType>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchUsuarios() {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar usuários:", error);
      setUsuarios([]);
      setLoading(false);
      return;
    }

    setUsuarios((data ?? []) as AdminUser[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsuarios();
  }, []);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      email: formData.email.trim().toLowerCase(),
      nome: formData.nome.trim() || null,
      role: formData.role,
      password: formData.password,
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
    await fetchUsuarios();
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-6xl space-y-6">
              <PageTitle
                title="Usuários do painel"
                subtitle="Gerencie quem pode acessar a área administrativa"
              />

              <div className="space-y-6">
                <section className="rounded-2xl border border-zinc-200 bg-white p-4 md:p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Autorizar novo usuário
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Ao autorizar, um usuário será criado no Supabase Auth com as credenciais fornecidas e já terá permissão no painel.
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
                        value={formData.nome}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        checked={formData.ativo}
                        onChange={handleCheckboxChange}
                      />
                      <span className="text-sm text-zinc-700">
                        Usuário ativo para acessar o sistema
                      </span>
                    </label>

                    <p className="text-sm text-zinc-500">
                      Ao cadastrar, o Supabase Auth criará o usuário automaticamente com a senha temporária informada.
                    </p>

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

                <section className="rounded-2xl border border-zinc-200 bg-white p-4 md:p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-zinc-900">Usuários autorizados</h2>

                  <div className="mt-6 space-y-3">
                    {loading ? (
                      <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
                        Carregando usuários...
                      </div>
                    ) : usuarios.length === 0 ? (
                      <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
                        Nenhum usuário autorizado ainda.
                      </div>
                    ) : (
                      usuarios.map((user) => (
                        <div
                          key={user.id}
                          className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="font-semibold text-zinc-900">
                              {user.nome || "Sem nome informado"}
                            </p>
                            <p className="text-sm text-zinc-600">{user.email}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                              <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">
                                Perfil: {user.role}
                              </span>
                              <span
                                className={`rounded-full px-2 py-1 font-semibold ${
                                  user.ativo
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-zinc-200 text-zinc-700"
                                }`}
                              >
                                {user.ativo ? "Ativo" : "Inativo"}
                              </span>
                              <span>Criado em: {formatDateTime(user.created_at)}</span>
                            </div>
                          </div>

                          <Link
                            href={`/admin/usuarios/${user.id}`}
                            className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900"
                          >
                            Editar
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
