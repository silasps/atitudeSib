"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [changeSummary, setChangeSummary] = useState<string[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

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

  function buildChangeSummary() {
    const summary: string[] = [];
    const normalizedName = form.nome.trim();
    const initialName = initialUser.nome || "";

    if (normalizedName !== initialName) {
      summary.push("Nome alterado com sucesso.");
    }

    if (form.role !== initialUser.role) {
      summary.push("Perfil alterado com sucesso.");
    }

    if (form.ativo !== initialUser.ativo) {
      summary.push("Status alterado com sucesso.");
    }

    if (form.password.trim()) {
      summary.push("Senha temporária atualizada com sucesso.");
    }

    return summary.length ? summary : ["Nenhuma alteração detectada."];
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload: Record<string, unknown> = {
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

    const summary = buildChangeSummary();
    setChangeSummary(summary);
    setShowSuccessModal(true);
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }
    successTimerRef.current = setTimeout(() => {
      setShowSuccessModal(false);
    }, 2000);

    setForm((prev) => ({ ...prev, password: "" }));
    setSaving(false);
    router.refresh();
  }

  async function confirmDelete() {
    setDeleting(true);
    setMessage("");

    const response = await fetch(`/api/admin/usuarios/${initialUser.id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Erro ao excluir usuário.");
      setDeleting(false);
      setShowConfirmDelete(false);
      return;
    }

    router.push("/admin/usuarios");
  }

  function handleDeleteClick() {
    setShowConfirmDelete(true);
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
              readOnly
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 outline-none"
            />
            <p className="mt-2 text-xs text-zinc-500">
              O e-mail está vinculado ao Supabase Auth e não pode ser alterado por aqui.
            </p>
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
              Usuário autorizado para acessar o painel referente ao seu perfil e às atribuições definidas
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
              onClick={handleDeleteClick}
              disabled={deleting}
              className="w-full rounded-xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-700 disabled:opacity-60 md:w-auto"
            >
              {deleting ? "Removendo..." : "Remover usuário"}
            </button>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-xl">
            <p className="text-lg font-semibold text-zinc-900">
              Alterações realizadas com sucesso!
            </p>
            <div className="mt-4 space-y-1 text-sm text-zinc-600">
              {changeSummary.map((detail, index) => (
                <p key={`${detail}-${index}`}>{detail}</p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 text-left shadow-xl">
            <p className="text-sm font-semibold text-zinc-900">
              Tem certeza que deseja remover{" "}
              <span className="font-semibold text-zinc-900">
                {initialUser.nome || initialUser.email}
              </span>{" "}
              ({initialUser.email}) do sistema?
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Essa ação remove o acesso no Supabase Auth e a autorização no painel.
            </p>
            <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="w-full rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 md:w-auto"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 md:w-auto"
              >
                {deleting ? "Removendo..." : "Confirmar remoção"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
