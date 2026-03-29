"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type NecessidadeOption = {
  id: number;
  titulo_publico: string;
  descricao: string | null;
  quantidade_total: number;
  quantidade_aprovada: number;
  data_limite_inscricao_em: string | null;
  status: string;
  exibir_publicamente: boolean;
};

type FormDataType = {
  necessidade_id: string;
  nome_completo: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  disponibilidade: string;
  observacoes: string;
};

const STORAGE_KEY = "atitude_candidatura_voluntariado";
const TERMO_VERSAO = "v1";

function formatDateTime(dateString: string | null) {
  if (!dateString) return "Não informada";
  return new Date(dateString).toLocaleString("pt-BR");
}

export default function CadastroVoluntarioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const necessidadePreSelecionada = searchParams.get("necessidade") ?? "";

  const [necessidades, setNecessidades] = useState<NecessidadeOption[]>([]);
  const [loadingNecessidades, setLoadingNecessidades] = useState(true);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState<FormDataType>({
    necessidade_id: necessidadePreSelecionada,
    nome_completo: "",
    cpf: "",
    rg: "",
    data_nascimento: "",
    email: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "PR",
    disponibilidade: "",
    observacoes: "",
  });

  useEffect(() => {
    async function fetchNecessidades() {
      const { data, error } = await supabase
        .from("necessidades_voluntariado")
        .select(
          "id, titulo_publico, descricao, quantidade_total, quantidade_aprovada, data_limite_inscricao_em, status, exibir_publicamente"
        )
        .eq("status", "aberta")
        .eq("exibir_publicamente", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoadingNecessidades(false);
        return;
      }

      const agora = new Date();

      const abertas = (data ?? []).filter((item) => {
        const vagasRestantes =
          Math.max(
            Number(item.quantidade_total ?? 0) -
              Number(item.quantidade_aprovada ?? 0),
            0
          ) > 0;

        const dentroDoPrazo =
          !item.data_limite_inscricao_em ||
          new Date(item.data_limite_inscricao_em) > agora;

        return vagasRestantes && dentroDoPrazo;
      }) as NecessidadeOption[];

      setNecessidades(abertas);
      setLoadingNecessidades(false);
    }

    fetchNecessidades();
  }, []);

  useEffect(() => {
    if (!necessidadePreSelecionada) return;

    setFormData((prev) => ({
      ...prev,
      necessidade_id: necessidadePreSelecionada,
    }));
  }, [necessidadePreSelecionada]);

  const necessidadeSelecionada = useMemo(() => {
    return necessidades.find(
      (item) => String(item.id) === formData.necessidade_id
    );
  }, [necessidades, formData.necessidade_id]);

  const candidaturaBloqueada = useMemo(() => {
    if (!necessidadeSelecionada) return false;

    const restantes = Math.max(
      necessidadeSelecionada.quantidade_total -
        necessidadeSelecionada.quantidade_aprovada,
      0
    );

    const foraDoPrazo =
      !!necessidadeSelecionada.data_limite_inscricao_em &&
      new Date(necessidadeSelecionada.data_limite_inscricao_em) <= new Date();

    return (
      necessidadeSelecionada.status !== "aberta" ||
      !necessidadeSelecionada.exibir_publicamente ||
      restantes <= 0 ||
      foraDoPrazo
    );
  }, [necessidadeSelecionada]);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!formData.necessidade_id) {
      setMessage("Selecione uma área.");
      return;
    }

    if (!necessidadeSelecionada) {
      setMessage("Esta oportunidade não está mais disponível.");
      return;
    }

    if (candidaturaBloqueada) {
      setMessage("Esta oportunidade não está mais disponível para candidatura.");
      return;
    }

    if (!formData.nome_completo || !formData.cpf) {
      setMessage("Preencha nome e CPF.");
      return;
    }

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...formData,
        termo_versao: TERMO_VERSAO,
      })
    );

    router.push("/seja-voluntario/termo");
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md: p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cadastro de voluntário</h1>
          <p className="text-zinc-600">
            Preencha seus dados para se candidatar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Área de atuação
            </label>
            <select
              name="necessidade_id"
              value={formData.necessidade_id}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            >
              <option value="">
                {loadingNecessidades ? "Carregando..." : "Selecione"}
              </option>

              {necessidades.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.titulo_publico}
                </option>
              ))}
            </select>
          </div>

          {necessidadeSelecionada && (
            <div className="rounded-xl bg-zinc-100 p-4 text-sm">
              <p className="font-semibold text-zinc-900">
                {necessidadeSelecionada.titulo_publico}
              </p>

              <p className="mt-2 text-zinc-700">
                {necessidadeSelecionada.descricao || "Sem descrição disponível."}
              </p>

              <div className="mt-3 space-y-1 text-zinc-700">
                <p>
                  <span className="font-medium text-zinc-900">Vagas restantes:</span>{" "}
                  {Math.max(
                    necessidadeSelecionada.quantidade_total -
                      necessidadeSelecionada.quantidade_aprovada,
                    0
                  )}
                </p>

                <p>
                  <span className="font-medium text-zinc-900">Prazo final:</span>{" "}
                  {formatDateTime(necessidadeSelecionada.data_limite_inscricao_em)}
                </p>
              </div>

              {candidaturaBloqueada && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  Esta oportunidade não está mais disponível para candidatura.
                </div>
              )}
            </div>
          )}

          <input
            name="nome_completo"
            placeholder="Nome completo"
            value={formData.nome_completo}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3"
          />

          <input
            name="cpf"
            placeholder="CPF"
            value={formData.cpf}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3"
          />

          <input
            name="telefone"
            placeholder="Telefone"
            value={formData.telefone}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3"
          />

          <textarea
            name="disponibilidade"
            placeholder="Disponibilidade"
            value={formData.disponibilidade}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3"
          />

          {message && (
            <div className="text-sm text-red-600">{message}</div>
          )}

          <div className="flex justify-between">
            <Link href="/seja-voluntario">Voltar</Link>

            <button
              type="submit"
              disabled={candidaturaBloqueada}
              className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}