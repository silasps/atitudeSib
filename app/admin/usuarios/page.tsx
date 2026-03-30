"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTitle } from "@/components/ui/page-title";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type AdminUser = {
  id: string;
  email: string;
  role: string;
  nome: string | null;
  ativo: boolean;
  created_at: string;
  created_by_user_id: string | null;
  created_by_user_email: string | null;
};

type FormDataType = {
  id: string;
  email: string;
  nome: string;
  role: string;
  ativo: boolean;
};

const emptyForm: FormDataType = {
  id: "",
  email: "",
  nome: "",
  role: "admin",
  ativo: true,
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
      id: formData.id.trim(),
      email: formData.email.trim().toLowerCase(),
      nome: formData.nome.trim() || null,
      role: formData.role,
      ativo: formData.ativo,
    };

    const { error } = await supabase.from("admin_users").insert([payload]);

    if (error) {
      setMessage(`Erro ao cadastrar usuário: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Usuário autorizado cadastrado com sucesso.");
    setFormData(emptyForm);
    await fetchUsuarios();
    setSaving(false);
  }

  async function toggleAtivo(user: AdminUser) {
    const { error } = await supabase
      .from("admin_users")
      .update({ ativo: !user.ativo })
      .eq("id", user.id);

    if (error) {
      setMessage(`Erro ao atualizar usuário: ${error.message}`);
      return;
    }

    setMessage(
      !user.ativo
        ? "Usuário ativado com sucesso."
        : "Usuário desativado com sucesso."
    );

    await fetchUsuarios();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-4 md: p-6">
            <div className="mx-auto max-w-6xl space-y-6">
              <PageTitle
                title="Usuários do painel"
                subtitle="Gerencie quem pode acessar a área administrativa"
              />

              <div className="space-y-6">
                <section className="rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Autorizar novo usuário
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Este cadastro libera o acesso ao painel para um usuário já criado no Supabase Auth.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        ID do usuário no Auth
                      </label>
                      <input
                        name="id"
                        value={formData.id}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                      />
                    </div>

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

                <section className="rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Usuários autorizados
                  </h2>

                  <div className="mt-6 space-y-4">
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
                          className="rounded-2xl border border-zinc-200 p-4"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-1">
                              <p className="font-semibold text-zinc-900">
                                {user.nome || "Sem nome informado"}
                              </p>
                              <p className="text-sm text-zinc-600">{user.email}</p>
                              <p className="text-xs text-zinc-500">
                                ID: {user.id}
                              </p>
                              <p className="text-sm text-zinc-600">
                                Perfil: {user.role}
                              </p>
                              <p className="text-sm text-zinc-600">
                                Criado por: {user.created_by_user_email || "Não informado"}
                                </p>
                              <p className="text-sm text-zinc-600">
                                Criado em: {formatDateTime(user.created_at)}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  user.ativo
                                    ? "bg-green-100 text-green-700"
                                    : "bg-zinc-200 text-zinc-700"
                                }`}
                              >
                                {user.ativo ? "Ativo" : "Inativo"}
                              </span>

                              <button
                                type="button"
                                onClick={() => toggleAtivo(user)}
                                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900"
                              >
                                {user.ativo ? "Desativar" : "Ativar"}
                              </button>
                            </div>
                          </div>
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