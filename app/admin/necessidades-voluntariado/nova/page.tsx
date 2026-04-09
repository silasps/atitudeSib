"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import {
  NecessidadeVoluntariadoForm,
  type NecessidadeVoluntariadoFormData,
} from "@/components/admin/necessidade-voluntariado-form";
import { supabase } from "@/lib/supabase";
import {
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

export default function NovaNecessidadeVoluntariadoPage() {
  const [funcoes, setFuncoes] = useState<FuncaoVoluntariado[]>([]);
  const [loadingFuncoes, setLoadingFuncoes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] =
    useState<NecessidadeVoluntariadoFormData>(emptyFormData);

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

    void fetchFuncoes();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
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
      .insert([payload]);

    if (error) {
      setMessage(`Erro ao cadastrar necessidade: ${error.message}`);
      setLoading(false);
      return;
    }

    setMessage("Necessidade cadastrada com sucesso!");
    setFormData(emptyFormData);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <PageTitle
                title="Nova necessidade"
                subtitle="Crie uma vaga pública com card resumido e página completa mais convidativa."
              />

              <NecessidadeVoluntariadoForm
                formData={formData}
                setFormData={setFormData}
                funcoes={funcoes}
                loadingFuncoes={loadingFuncoes}
                loadingSubmit={loading}
                submitLabel="Cadastrar necessidade"
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

