"use client";

import { useEffect, useState } from "react";
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

export default function NovaNecessidadeVoluntariadoPage() {
  const [funcoes, setFuncoes] = useState<FuncaoVoluntariado[]>([]);
  const [loadingFuncoes, setLoadingFuncoes] = useState(true);
  const [loading, setLoading] = useState(false);
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
    async function fetchFuncoes() {
      const { data, error } = await supabase
        .from("funcoes_voluntariado")
        .select("*")
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro ao buscar funções:", error);
        setFuncoes([]);
        setLoadingFuncoes(false);
        return;
      }

      setFuncoes((data ?? []) as FuncaoVoluntariado[]);
      setLoadingFuncoes(false);
    }

    fetchFuncoes();
  }, []);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFuncaoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedId = e.target.value;

    const funcaoSelecionada = funcoes.find(
      (funcao) => String(funcao.id) === selectedId
    );

    setFormData((prev) => ({
      ...prev,
      funcao_id: selectedId,
      descricao:
        funcaoSelecionada?.descricao && prev.descricao.trim() === ""
          ? funcaoSelecionada.descricao
          : prev.descricao,
      titulo_publico:
        prev.titulo_publico.trim() === "" && funcaoSelecionada?.nome
          ? funcaoSelecionada.nome
          : prev.titulo_publico,
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
      .insert([payload]);

    if (error) {
      setMessage(`Erro ao cadastrar necessidade: ${error.message}`);
      setLoading(false);
      return;
    }

    setMessage("Necessidade cadastrada com sucesso!");

    setFormData({
      funcao_id: "",
      titulo_publico: "",
      descricao: "",
      quantidade_total: "1",
      quantidade_aprovada: "0",
      data_limite_inscricao_em: "",
      status: "aberta",
      exibir_publicamente: true,
    });

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-4 md: p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <PageTitle
                title="Nova necessidade"
                subtitle="Defina uma demanda real da instituição para o voluntariado"
              />

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
                      onChange={handleFuncaoChange}
                      required
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
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
                      placeholder="Ex: Professor de reforço escolar"
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
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
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                    />
                    <p className="mt-2 text-xs text-zinc-500">
                      Ao selecionar uma função, a descrição base pode ser preenchida automaticamente.
                      Você pode editar esse texto antes de salvar.
                    </p>
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
                      required
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
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
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Data e horário limite de inscrição
                    </label>
                    <input
                      type="datetime-local"
                      name="data_limite_inscricao_em"
                      value={formData.data_limite_inscricao_em}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
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
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
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
                    disabled={loading}
                    className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {loading ? "Salvando..." : "Cadastrar necessidade"}
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