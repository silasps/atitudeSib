"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTitle } from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type CandidaturaComNecessidade = {
  id: number;
  nome_completo: string;
  cpf: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  status: string;
  created_at: string;
  necessidade: {
    id: number;
    titulo_publico: string;
  } | null;
};

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("pt-BR");
}

export default function CandidaturasVoluntariadoPage() {
  const [candidaturas, setCandidaturas] = useState<CandidaturaComNecessidade[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<
    "todas" | "pendente" | "aprovado" | "rejeitado"
  >("pendente");

  useEffect(() => {
    async function fetchCandidaturas() {
      const { data, error } = await supabase
        .from("candidaturas_voluntariado")
        .select(`
          id,
          nome_completo,
          cpf,
          email,
          telefone,
          cidade,
          estado,
          status,
          created_at,
          necessidade:necessidade_id (
            id,
            titulo_publico
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar candidaturas:", error);
        setCandidaturas([]);
        setLoading(false);
        return;
      }

      const normalized: CandidaturaComNecessidade[] = (data ?? []).map(
        (item: any) => ({
          id: Number(item.id),
          nome_completo: item.nome_completo ?? "",
          cpf: item.cpf ?? "",
          email: item.email ?? null,
          telefone: item.telefone ?? null,
          cidade: item.cidade ?? null,
          estado: item.estado ?? null,
          status: item.status ?? "pendente",
          created_at: item.created_at ?? "",
          necessidade: item.necessidade
            ? {
                id: Number(item.necessidade.id),
                titulo_publico: item.necessidade.titulo_publico ?? "",
              }
            : null,
        })
      );

      setCandidaturas(normalized);
      setLoading(false);
    }

    fetchCandidaturas();
  }, []);

  const candidaturasFiltradas = useMemo(() => {
    if (filtro === "todas") return candidaturas;
    return candidaturas.filter((item) => item.status === filtro);
  }, [candidaturas, filtro]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />

          <main className="flex-1 p-4 md:p-4 md: p-6">
            <PageTitle
              title="Candidaturas de voluntariado"
              subtitle="Acompanhe os candidatos que entraram no fluxo público"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltro("pendente")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  filtro === "pendente"
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700"
                }`}
              >
                Pendentes
              </button>

              <button
                onClick={() => setFiltro("todas")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  filtro === "todas"
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700"
                }`}
              >
                Todas
              </button>

              <button
                onClick={() => setFiltro("aprovado")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  filtro === "aprovado"
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700"
                }`}
              >
                Aprovadas
              </button>

              <button
                onClick={() => setFiltro("rejeitado")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  filtro === "rejeitado"
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700"
                }`}
              >
                Rejeitadas
              </button>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
                <p className="text-sm text-zinc-600">Carregando candidaturas...</p>
              </div>
            ) : candidaturasFiltradas.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
                <p className="text-sm text-zinc-600">
                  Nenhuma candidatura encontrada.
                </p>
              </div>
            ) : (
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {candidaturasFiltradas.map((item) => (
                    <Link
                    key={item.id}
                    href={`/admin/candidaturas-voluntariado/${item.id}`}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm block hover:shadow-md"
                    >
                        <p className="text-sm text-zinc-500">
                            {item.necessidade?.titulo_publico ??
                            "Necessidade não encontrada"}
                        </p>

                        <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                            {item.nome_completo}
                        </h3>

                        <div className="mt-4 space-y-2 text-sm text-zinc-600">
                            <p>
                            <span className="font-medium text-zinc-900">CPF:</span> {item.cpf}
                            </p>
                            <p>
                            <span className="font-medium text-zinc-900">E-mail:</span>{" "}
                            {item.email || "Não informado"}
                            </p>
                            <p>
                            <span className="font-medium text-zinc-900">Telefone:</span>{" "}
                            {item.telefone || "Não informado"}
                            </p>
                            <p>
                            <span className="font-medium text-zinc-900">Cidade:</span>{" "}
                            {[item.cidade, item.estado].filter(Boolean).join(" / ") || "Não informada"}
                            </p>
                            <p>
                            <span className="font-medium text-zinc-900">Status:</span> {item.status}
                            </p>
                            <p>
                            <span className="font-medium text-zinc-900">Recebida em:</span>{" "}
                            {formatDateTime(item.created_at)}
                            </p>
                        </div>
                    </Link>
                ))}
                </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}