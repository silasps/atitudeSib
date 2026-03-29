"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "atitude_candidatura_voluntariado";
const TERMO_VERSAO = "v1";

type StoredData = {
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

export default function TermoVoluntariadoPublicoPage() {
  const router = useRouter();
  const [dataReady, setDataReady] = useState(false);
  const [aceito, setAceito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      router.replace("/seja-voluntario/cadastro");
      return;
    }

    setDataReady(true);
  }, [router]);

  async function handleSubmit() {
    setMessage("");

    if (!aceito) {
      setMessage("Você precisa ler e aceitar o termo para concluir.");
      return;
    }

    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      setMessage("Os dados do cadastro não foram encontrados. Preencha novamente.");
      return;
    }

    let parsed: StoredData;

    try {
      parsed = JSON.parse(raw) as StoredData;
    } catch {
      setMessage("Não foi possível recuperar os dados do cadastro.");
      return;
    }

    setLoading(true);

    const { data: necessidadeAtual, error: necessidadeError } = await supabase
      .from("necessidades_voluntariado")
      .select("id, quantidade_total, quantidade_aprovada, status, exibir_publicamente, data_limite_inscricao_em")
      .eq("id", Number(parsed.necessidade_id))
      .single();

    if (necessidadeError || !necessidadeAtual) {
      setMessage("A oportunidade selecionada não foi encontrada.");
      setLoading(false);
      return;
    }

    const vagasRestantes =
      Math.max(
        Number(necessidadeAtual.quantidade_total ?? 0) -
          Number(necessidadeAtual.quantidade_aprovada ?? 0),
        0
      ) > 0;

    const dentroDoPrazo =
      !necessidadeAtual.data_limite_inscricao_em ||
      new Date(necessidadeAtual.data_limite_inscricao_em) > new Date();

    const disponivel =
      necessidadeAtual.status === "aberta" &&
      necessidadeAtual.exibir_publicamente === true &&
      vagasRestantes &&
      dentroDoPrazo;

    if (!disponivel) {
      setMessage("Esta oportunidade não está mais disponível para candidatura.");
      setLoading(false);
      return;
    }

    const payload = {
      necessidade_id: Number(parsed.necessidade_id),
      nome_completo: parsed.nome_completo,
      cpf: parsed.cpf,
      rg: parsed.rg || null,
      data_nascimento: parsed.data_nascimento || null,
      email: parsed.email || null,
      telefone: parsed.telefone || null,
      cep: parsed.cep || null,
      endereco: parsed.endereco || null,
      numero: parsed.numero || null,
      complemento: parsed.complemento || null,
      bairro: parsed.bairro || null,
      cidade: parsed.cidade || null,
      estado: parsed.estado || null,
      disponibilidade: parsed.disponibilidade || null,
      observacoes: parsed.observacoes || null,
      status: "pendente",
      termo_aceito: true,
      termo_aceito_em: new Date().toISOString(),
      termo_versao: TERMO_VERSAO,
    };

    const { error } = await supabase
      .from("candidaturas_voluntariado")
      .insert([payload]);

    if (error) {
      setMessage(`Erro ao enviar candidatura: ${error.message}`);
      setLoading(false);
      return;
    }

    sessionStorage.removeItem(STORAGE_KEY);
    router.push("/seja-voluntario/sucesso");
  }

  if (!dataReady) {
    return (
      <main className="min-h-screen bg-zinc-50 p-4 md: p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
          <p className="text-sm text-zinc-600">Carregando termo...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md: p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-sm font-medium text-zinc-500">Projeto Atitude</p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900">
            Termo de voluntariado
          </h1>
          <p className="mt-2 text-sm text-zinc-600">Versão {TERMO_VERSAO}</p>
        </div>

        <div className="mt-8 space-y-5 text-sm leading-7 text-zinc-700">
          <p>
            Pelo presente termo, o participante declara ciência de que atuará de
            forma voluntária junto ao Projeto Atitude, sem vínculo empregatício,
            sem obrigação trabalhista, previdenciária ou afim.
          </p>

          <p>
            O voluntário compromete-se a exercer suas atividades com zelo,
            responsabilidade, respeito às diretrizes institucionais do projeto,
            cuidado com crianças, adolescentes e famílias atendidas, e observância
            às orientações da coordenação.
          </p>

          <p>
            O projeto poderá definir funções, horários, responsabilidades e regras
            de conduta para organização interna, sem que isso descaracterize a
            natureza voluntária da atuação.
          </p>

          <p>
            O candidato declara que as informações fornecidas em seu cadastro são
            verdadeiras e autoriza seu armazenamento para fins de organização
            administrativa, segurança institucional e análise interna da
            candidatura.
          </p>

          <p>
            O aceite digital deste termo será registrado com data e hora no
            sistema, vinculado à candidatura enviada.
          </p>
        </div>

        <label className="mt-8 flex items-start gap-3">
          <input
            type="checkbox"
            checked={aceito}
            onChange={(e) => setAceito(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-zinc-700">
            Confirmo que li o termo de voluntariado e concordo com seu conteúdo.
          </span>
        </label>

        {message ? (
          <div className="mt-6 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
            {message}
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Link
            href="/seja-voluntario/cadastro"
            className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900"
          >
            Voltar ao cadastro
          </Link>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Aceitar e enviar candidatura"}
          </button>
        </div>
      </div>
    </main>
  );
}