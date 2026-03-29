"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTitle } from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

type CandidaturaDetalhe = {
  id: number;
  necessidade_id: number;
  nome_completo: string;
  cpf: string;
  rg: string | null;
  data_nascimento: string | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  disponibilidade: string | null;
  observacoes: string | null;
  status: string;
  termo_aceito: boolean;
  termo_aceito_em: string | null;
  termo_versao: string | null;
  created_at: string;
  necessidade: {
    id: number;
    titulo_publico: string;
    quantidade_total: number;
    quantidade_aprovada: number;
    status: string;
  } | null;
};

function formatDateTime(dateString: string | null) {
  if (!dateString) return "Não informado";
  return new Date(dateString).toLocaleString("pt-BR");
}

export default function CandidaturaDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [candidatura, setCandidatura] = useState<CandidaturaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showCreateUser, setShowCreateUser] = useState(false);

  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    role: "professor",
  });

  useEffect(() => {
    async function fetchCandidatura() {
      const { data, error } = await supabase
        .from("candidaturas_voluntariado")
        .select(`
          *,
          necessidade:necessidade_id (
            id,
            titulo_publico,
            quantidade_total,
            quantidade_aprovada,
            status
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar candidatura:", error);
        setLoading(false);
        return;
      }

      const normalized: CandidaturaDetalhe = {
        id: Number(data.id),
        necessidade_id: Number(data.necessidade_id),
        nome_completo: data.nome_completo ?? "",
        cpf: data.cpf ?? "",
        rg: data.rg ?? null,
        data_nascimento: data.data_nascimento ?? null,
        email: data.email ?? null,
        telefone: data.telefone ?? null,
        cep: data.cep ?? null,
        endereco: data.endereco ?? null,
        numero: data.numero ?? null,
        complemento: data.complemento ?? null,
        bairro: data.bairro ?? null,
        cidade: data.cidade ?? null,
        estado: data.estado ?? null,
        disponibilidade: data.disponibilidade ?? null,
        observacoes: data.observacoes ?? null,
        status: data.status ?? "pendente",
        termo_aceito: Boolean(data.termo_aceito),
        termo_aceito_em: data.termo_aceito_em ?? null,
        termo_versao: data.termo_versao ?? null,
        created_at: data.created_at ?? "",
        necessidade: data.necessidade
          ? {
              id: Number(data.necessidade.id),
              titulo_publico: data.necessidade.titulo_publico ?? "",
              quantidade_total: Number(data.necessidade.quantidade_total ?? 0),
              quantidade_aprovada: Number(data.necessidade.quantidade_aprovada ?? 0),
              status: data.necessidade.status ?? "aberta",
            }
          : null,
      };

      setCandidatura(normalized);
      setLoading(false);
    }

    fetchCandidatura();
  }, [id]);

  const vagasRestantes = useMemo(() => {
    if (!candidatura?.necessidade) return 0;
    return Math.max(
      candidatura.necessidade.quantidade_total - candidatura.necessidade.quantidade_aprovada,
      0
    );
  }, [candidatura]);

  async function handleAprovar() {
    if (!candidatura) return;

    if (candidatura.status === "aprovado") {
        setMessage("Esta candidatura já foi aprovada.");
        return;
    }

    if (!candidatura.necessidade) {
        setMessage("Necessidade vinculada não encontrada.");
        return;
    }

    if (candidatura.necessidade.status !== "aberta") {
        setMessage("Não é possível aprovar porque a necessidade está fechada.");
        return;
    }

    if (vagasRestantes <= 0) {
        setMessage("Não há mais vagas disponíveis para esta necessidade.");
        return;
    }

    setActionLoading(true);
    setMessage("");

    const novoTotalAprovado = candidatura.necessidade.quantidade_aprovada + 1;
    const atingiuLimite =
        novoTotalAprovado >= candidatura.necessidade.quantidade_total;

    const { error: candidaturaError } = await supabase
        .from("candidaturas_voluntariado")
        .update({ status: "aprovado" })
        .eq("id", candidatura.id);

    if (candidaturaError) {
        setMessage(`Erro ao aprovar candidatura: ${candidaturaError.message}`);
        setActionLoading(false);
        return;
    }

    const { error: necessidadeError } = await supabase
        .from("necessidades_voluntariado")
        .update({
            quantidade_aprovada: novoTotalAprovado,
            status: atingiuLimite ? "fechada" : "aberta",
            exibir_publicamente: atingiuLimite ? false : true,
        })
        .eq("id", candidatura.necessidade.id);

    if (necessidadeError) {
        setMessage(
        `Candidatura aprovada, mas houve erro ao atualizar a necessidade: ${necessidadeError.message}`
        );
        setActionLoading(false);
        return;
    }

    router.push("/admin/candidaturas-voluntariado");
    }

async function handleCreateUser() {
  if (!candidatura) return;

  const res = await fetch("/api/admin/create-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userForm.email,
      password: userForm.password,
      nome: candidatura.nome_completo,
      role: userForm.role,
    }),
  });

  const text = await res.text();
  console.log("Resposta da API:", text);

  let result: { success?: boolean; message?: string } = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    alert("A rota respondeu sem JSON válido. Veja o terminal e o console.");
    return;
  }

  if (!res.ok || !result.success) {
    alert(result.message || "Erro ao criar usuário.");
    return;
  }

  await handleAprovar();
  setShowCreateUser(false);
  alert("Usuário criado e candidatura aprovada!");
}
  
    async function handleRejeitar() {
    if (!candidatura) return;

    if (candidatura.status === "rejeitado") {
      setMessage("Esta candidatura já foi rejeitada.");
      return;
    }

    setActionLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("candidaturas_voluntariado")
      .update({ status: "rejeitado" })
      .eq("id", candidatura.id);

    if (error) {
      setMessage(`Erro ao rejeitar candidatura: ${error.message}`);
      setActionLoading(false);
      return;
    }

    router.push("/admin/candidaturas-voluntariado");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-4 md: p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
          <p className="text-sm text-zinc-600">Carregando candidatura...</p>
        </div>
      </div>
    );
  }

  if (!candidatura) {
    return (
      <div className="min-h-screen bg-zinc-50 p-4 md: p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
          <p className="text-sm text-zinc-600">Candidatura não encontrada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />

          <main className="flex-1 p-4 md:p-4 md: p-6">
            <div className="flex items-start justify-between gap-4">
              <PageTitle
                title="Analisar candidatura"
                subtitle="Revise os dados e tome uma decisão"
              />

              <Link
                href="/admin/candidaturas-voluntariado"
                className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900"
              >
                Voltar
              </Link>
            </div>

            <div className="grid gap-4 md: p-6 xl:grid-cols-3">
              <section className="xl:col-span-2 rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-900">Dados do candidato</h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2 text-sm text-zinc-700">
                  <p><span className="font-medium text-zinc-900">Nome:</span> {candidatura.nome_completo}</p>
                  <p><span className="font-medium text-zinc-900">CPF:</span> {candidatura.cpf}</p>
                  <p><span className="font-medium text-zinc-900">RG:</span> {candidatura.rg || "Não informado"}</p>
                  <p><span className="font-medium text-zinc-900">Nascimento:</span> {candidatura.data_nascimento || "Não informado"}</p>
                  <p><span className="font-medium text-zinc-900">E-mail:</span> {candidatura.email || "Não informado"}</p>
                  <p><span className="font-medium text-zinc-900">Telefone:</span> {candidatura.telefone || "Não informado"}</p>
                  <p><span className="font-medium text-zinc-900">CEP:</span> {candidatura.cep || "Não informado"}</p>
                  <p><span className="font-medium text-zinc-900">Endereço:</span> {candidatura.endereco || "Não informado"}</p>
                  <p><span className="font-medium text-zinc-900">Número:</span> {candidatura.numero || "Não informado"}</p>
                  <p><span className="font-medium text-zinc-900">Complemento:</span> {candidatura.complemento || "Não informado"}</p>
                  <p><span className="font-medium text-zinc-900">Bairro:</span> {candidatura.bairro || "Não informado"}</p>
                  <p><span className="font-medium text-zinc-900">Cidade/UF:</span> {[candidatura.cidade, candidatura.estado].filter(Boolean).join(" / ") || "Não informado"}</p>
                </div>

                <div className="mt-6">
                  <h3 className="text-base font-semibold text-zinc-900">Disponibilidade</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">
                    {candidatura.disponibilidade || "Não informada"}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-base font-semibold text-zinc-900">Observações</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">
                    {candidatura.observacoes || "Nenhuma observação enviada."}
                  </p>
                </div>
              </section>

              <aside className="space-y-6">
                <section className="rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-zinc-900">Resumo da análise</h2>

                  <div className="mt-4 space-y-3 text-sm text-zinc-700">
                    <p>
                      <span className="font-medium text-zinc-900">Vaga:</span>{" "}
                      {candidatura.necessidade?.titulo_publico || "Não encontrada"}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Status atual:</span>{" "}
                      {candidatura.status}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Recebida em:</span>{" "}
                      {formatDateTime(candidatura.created_at)}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Termo aceito:</span>{" "}
                      {candidatura.termo_aceito ? "Sim" : "Não"}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Aceite em:</span>{" "}
                      {formatDateTime(candidatura.termo_aceito_em)}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Versão do termo:</span>{" "}
                      {candidatura.termo_versao || "Não informada"}
                    </p>
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-zinc-900">Capacidade da necessidade</h2>

                  <div className="mt-4 space-y-3 text-sm text-zinc-700">
                    <p>
                      <span className="font-medium text-zinc-900">Quantidade total:</span>{" "}
                      {candidatura.necessidade?.quantidade_total ?? 0}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Já aprovados:</span>{" "}
                      {candidatura.necessidade?.quantidade_aprovada ?? 0}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Vagas restantes:</span>{" "}
                      {vagasRestantes}
                    </p>
                  </div>
                </section>

                {message ? (
                  <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                    {message}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleAprovar}
                    disabled={actionLoading}
                    className="rounded-xl bg-green-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {actionLoading ? "Processando..." : "Aprovar candidatura"}
                  </button>

                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    Aprovar e criar acesso
                  </button>

                  <button
                    type="button"
                    onClick={handleRejeitar}
                    disabled={actionLoading}
                    className="rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {actionLoading ? "Processando..." : "Rejeitar candidatura"}
                  </button>
                </div>
              </aside>
            </div>
            {showCreateUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="w-full max-w-md rounded-2xl bg-white p-4 md: p-6">
                  <h2 className="text-lg font-semibold">Criar acesso</h2>

                  <div className="mt-4 space-y-3">
                    <input
                      placeholder="E-mail"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    />

                    <input
                      placeholder="Senha provisória"
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    />

                    <select
                      value={userForm.role}
                      onChange={(e) =>
                        setUserForm((prev) => ({ ...prev, role: e.target.value }))
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    >
                      <option value="professor">Professor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowCreateUser(false)}
                      className="px-4 py-2"
                    >
                      Cancelar
                    </button>

                    <button
                      onClick={handleCreateUser}
                      className="rounded-xl bg-green-600 px-4 py-2 text-white"
                    >
                      Criar e aprovar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}