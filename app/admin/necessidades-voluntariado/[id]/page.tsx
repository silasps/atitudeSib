"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageTitle } from "@/components/ui/page-title";
import {
  NecessidadeVoluntariadoForm,
  type NecessidadeVoluntariadoFormData,
} from "@/components/admin/necessidade-voluntariado-form";
import { supabase } from "@/lib/supabase";
import {
  listToTextArea,
  parseNecessidadeRichContent,
  serializeNecessidadeRichContent,
  textAreaToList,
} from "@/lib/voluntariado-necessidade-content";
import type { FuncaoVoluntariado } from "@/types";

const emptyFormData: NecessidadeVoluntariadoFormData = {
  funcao_id: "",
  titulo_publico: "",
  resumo_curto: "",
  descricao_completa: "",
  imagem_url: "",
  imagem_alt: "",
  local_atuacao: "",
  formato_atuacao: "",
  carga_horaria: "",
  periodo: "",
  atividades: "",
  perfil_desejado: "",
  diferenciais: "",
  quantidade_total: "1",
  quantidade_aprovada: "0",
  data_limite_inscricao_em: "",
  status: "aberta",
  exibir_publicamente: true,
};

export default function EditarNecessidadeVoluntariadoPage() {
  const params = useParams();
  const id = String(params.id);

  const [funcoes, setFuncoes] = useState<FuncaoVoluntariado[]>([]);
  const [loadingFuncoes, setLoadingFuncoes] = useState(true);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] =
    useState<NecessidadeVoluntariadoFormData>(emptyFormData);

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

      const richContent = parseNecessidadeRichContent(data.descricao);

      setFormData({
        funcao_id: String(data.funcao_id ?? ""),
        titulo_publico: data.titulo_publico ?? "",
        resumo_curto: richContent.resumoCurto,
        descricao_completa: richContent.descricaoCompleta,
        imagem_url: richContent.imagemUrl ?? "",
        imagem_alt: richContent.imagemAlt ?? "",
        local_atuacao: richContent.localAtuacao ?? "",
        formato_atuacao: richContent.formatoAtuacao ?? "",
        carga_horaria: richContent.cargaHoraria ?? "",
        periodo: richContent.periodo ?? "",
        atividades: listToTextArea(richContent.atividades),
        perfil_desejado: listToTextArea(richContent.perfilDesejado),
        diferenciais: listToTextArea(richContent.diferenciais),
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

    void fetchData();
  }, [id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingSave(true);
    setMessage("");

    const payload = {
      funcao_id: Number(formData.funcao_id),
      titulo_publico: formData.titulo_publico.trim(),
      descricao: serializeNecessidadeRichContent({
        resumoCurto: formData.resumo_curto,
        descricaoCompleta: formData.descricao_completa,
        imagemUrl: formData.imagem_url,
        imagemAlt: formData.imagem_alt,
        localAtuacao: formData.local_atuacao,
        formatoAtuacao: formData.formato_atuacao,
        cargaHoraria: formData.carga_horaria,
        periodo: formData.periodo,
        atividades: textAreaToList(formData.atividades),
        perfilDesejado: textAreaToList(formData.perfil_desejado),
        diferenciais: textAreaToList(formData.diferenciais),
      }),
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
      <main className="min-h-screen bg-zinc-50 p-4 md:p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">Carregando necessidade...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex items-start justify-between gap-4">
                <PageTitle
                  title="Editar necessidade"
                  subtitle="Atualize a vaga pública, a imagem e a narrativa completa da oportunidade."
                />

                <Link
                  href="/admin/necessidades-voluntariado"
                  className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900"
                >
                  Voltar
                </Link>
              </div>

              <NecessidadeVoluntariadoForm
                formData={formData}
                setFormData={setFormData}
                funcoes={funcoes}
                loadingFuncoes={loadingFuncoes}
                loadingSubmit={loadingSave}
                submitLabel="Salvar alterações"
                message={message}
                onSubmit={handleSubmit}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

