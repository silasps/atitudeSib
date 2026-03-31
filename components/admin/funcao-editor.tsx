"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FuncaoVoluntariado } from "@/types";

type Props = {
  initialData: FuncaoVoluntariado;
};

export default function FuncaoEditor({ initialData }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: initialData.nome,
    descricao: initialData.descricao ?? "",
    ativo: initialData.ativo,
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch(
      `/api/admin/funcoes-voluntariado/${initialData.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim() || null,
          ativo: formData.ativo,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Erro ao atualizar função.");
      setSaving(false);
      return;
    }

    setMessage("Função atualizada com sucesso.");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Nome da função
          </label>
          <input
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Descrição
          </label>
          <textarea
            name="descricao"
            rows={4}
            value={formData.descricao}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
          />
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3">
          <input
            type="checkbox"
            name="ativo"
            checked={formData.ativo}
            onChange={handleChange}
          />
          <span className="text-sm text-zinc-700">
            Função ativa no sistema
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
            {saving ? "Atualizando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
