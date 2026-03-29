"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTitle } from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

type FormDataType = {
  nome: string;
  descricao: string;
  ativo: boolean;
};

export default function NovaFuncaoVoluntariadoPage() {
  const [formData, setFormData] = useState<FormDataType>({
    nome: "",
    descricao: "",
    ativo: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("funcoes_voluntariado").insert([
      {
        nome: formData.nome,
        descricao: formData.descricao || null,
        ativo: formData.ativo,
      },
    ]);

    if (error) {
      setMessage(`Erro ao cadastrar função: ${error.message}`);
      setLoading(false);
      return;
    }

    setMessage("Função cadastrada com sucesso!");

    setFormData({
      nome: "",
      descricao: "",
      ativo: true,
    });

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />

          <main className="flex-1 p-4 md:p-4 md: p-6">
            <div className="mx-auto max-w-3xl space-y-6">
              <PageTitle
                title="Nova função"
                subtitle="Cadastre uma nova área de serviço voluntário"
              />

              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Nome da função
                  </label>
                  <input
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3">
                  <input
                    type="checkbox"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleCheckboxChange}
                  />
                  <span className="text-sm text-zinc-700">
                    Função ativa para uso no sistema
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
                    disabled={loading}
                    className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {loading ? "Salvando..." : "Cadastrar função"}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}