"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTitle } from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";
import type { FuncaoVoluntariado } from "@/types";

type FormDataType = {
  funcao_id: string;
  titulo_publico: string;
  descricao: string;
  quantidade_total: string;
  quantidade_aprovada: string;
  data_limite_inscricao_em: string;
  status: string;
  exibir_publicamente: boolean;
};

export default function EditarNecessidadeVoluntariadoPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [funcoes, setFuncoes] = useState<FuncaoVoluntariado[]>([]);
  const [loadingFuncoes, setLoadingFuncoes] = useState(true);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState<FormDataType>({
    funcao_id: "",
    titulo_publico: "",
    descricao: "",
    quantidade_total: "1",
    quantidade_aprovada: "0",
    data_limite_inscricao_em: "",
    status: "aberta",
    exibir_publicamente: true,
  });

  useEffect(() => {
    async function fetchData() {
      const [{ data: funcoesData, error: funcoesError }, { data, error }] =
        await Promise.all([
          supabase
            .from("funcoes_voluntariado")
            .select("*")
            .eq("ativo", true)
            .order("nome", { ascending: true }),
          supabase
            .from("necessidades_voluntariado")
            .select("*")
            .eq("id", id)
            .single(),
        ]);

      if (funcoesError) {
        console.error("Erro ao buscar funções:", funcoesError);
      } else {
        setFuncoes((funcoesData ?? []) as FuncaoVoluntariado[]);
      }

      setLoadingFuncoes(false);

      if (error || !data) {
        console.error("Erro ao buscar necessidade:", error);
        setLoadingPage(false);
        return;
      }

      setFormData({
        funcao_id: String(data.funcao_id ?? ""),
        titulo_publico: data.titulo_publico ?? "",
        descricao: data.descricao ?? "",
        quantidade_total: String(data.quantidade_total ?? 1),
        quantidade_aprovada: String(data.quantidade_aprovada ?? 0),
        data_limite_inscricao_em: data.data_limite_inscricao_em
          ? new Date(data.data_limite_inscricao_em).toISOString().slice(0, 16)
          : "",
        status: data.status ?? "aberta",
        exibir_publicamente: Boolean(data.exibir_publicamente),
      });

      setLoadingPage(false);
    }

    fetchData();
  }, [id]);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    setLoadingSave(true);
    setMessage("");

    const payload = {
      funcao_id: Number(formData.funcao_id),
      titulo_publico: formData.titulo_publico,
      descricao: formData.descricao || null,
      quantidade_total: Number(formData.quantidade_total),
      quantidade_aprovada: Number(formData.quantidade_aprovada),
      data_limite_inscricao_em: formData.data_limite_inscricao_em || null,
      status: formData.status,
      exibir_publicamente: formData.exibir_publicamente,
    };

    const { error } = await supabase
      .from("necessidades_voluntariado")
      .update(payload)
      .eq("id", id);

    if (error) {
      setMessage(`Erro ao salvar necessidade: ${error.message}`);
      setLoadingSave(false);
      return;
    }

    setMessage("Necessidade atualizada com sucesso.");
    setLoadingSave(false);
  }

  if (loadingPage) {
    return (
      <main className="min-h-screen bg-zinc-50 p-4 md: p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
          <p className="text-sm text-zinc-600">Carregando necessidade...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />

          <main className="flex-1 p-4 md:p-4 md: p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="flex items-start justify-between gap-4">
                <PageTitle
                  title="Editar necessidade"
                  subtitle="Atualize a vaga e controle sua exibição pública"
                />

                <Link
                  href="/admin/necessidades-voluntariado"
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900"
                >
                  Voltar
                </Link>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Função
                    </label>
                    <select
                      name="funcao_id"
                      value={formData.funcao_id}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    >
                      <option value="">
                        {loadingFuncoes ? "Carregando funções..." : "Selecione uma função"}
                      </option>

                      {funcoes.map((funcao) => (
                        <option key={funcao.id} value={funcao.id}>
                          {funcao.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Título público
                    </label>
                    <input
                      name="titulo_publico"
                      value={formData.titulo_publico}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Descrição
                    </label>
                    <textarea
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Quantidade total
                    </label>
                    <input
                      type="number"
                      min="1"
                      name="quantidade_total"
                      value={formData.quantidade_total}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Quantidade aprovada
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="quantidade_aprovada"
                      value={formData.quantidade_aprovada}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Data e horário limite
                    </label>
                    <input
                      type="datetime-local"
                      name="data_limite_inscricao_em"
                      value={formData.data_limite_inscricao_em}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    >
                      <option value="aberta">Aberta</option>
                      <option value="fechada">Fechada</option>
                    </select>
                  </div>

                  <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3">
                    <input
                      type="checkbox"
                      name="exibir_publicamente"
                      checked={formData.exibir_publicamente}
                      onChange={handleCheckboxChange}
                    />
                    <span className="text-sm text-zinc-700">
                      Exibir esta necessidade publicamente
                    </span>
                  </label>
                </div>

                {message ? (
                  <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                    {message}
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loadingSave}
                    className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {loadingSave ? "Salvando..." : "Salvar alterações"}
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