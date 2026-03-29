"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTitle } from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";
import type { FuncaoVoluntariado, NecessidadeVoluntariado } from "@/types";

type NecessidadeComFuncao = NecessidadeVoluntariado & {
  funcao?: FuncaoVoluntariado | null;
  data_limite_inscricao_em?: string | null;
};

export default function NecessidadesVoluntariadoPage() {
  const [necessidades, setNecessidades] = useState<NecessidadeComFuncao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<"todas" | "aberta" | "fechada">("todas");

  useEffect(() => {
    async function fetchNecessidades() {
      const { data, error } = await supabase
        .from("necessidades_voluntariado")
        .select(`
          *,
          funcao:funcao_id (
            id,
            nome,
            descricao,
            ativo,
            created_at,
            updated_at
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar necessidades:", error);
        setNecessidades([]);
        setLoading(false);
        return;
      }

      setNecessidades((data ?? []) as NecessidadeComFuncao[]);
      setLoading(false);
    }

    fetchNecessidades();
  }, []);

  const necessidadesFiltradas = useMemo(() => {
    if (filtroStatus === "todas") return necessidades;
    return necessidades.filter((item) => item.status === filtroStatus);
  }, [necessidades, filtroStatus]);

  function getVagasRestantes(item: NecessidadeComFuncao) {
    return Math.max(item.quantidade_total - item.quantidade_aprovada, 0);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />

          <main className="flex-1 p-4 md:p-4 md: p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <PageTitle
                title="Necessidades de voluntariado"
                subtitle="Cadastre e acompanhe as vagas que a instituição precisa preencher"
              />

              <Link
                href="/admin/necessidades-voluntariado/nova"
                className="rounded-xl border bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
              >
                Nova necessidade
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroStatus("todas")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  filtroStatus === "todas"
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700"
                }`}
              >
                Todas
              </button>

              <button
                onClick={() => setFiltroStatus("aberta")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  filtroStatus === "aberta"
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700"
                }`}
              >
                Abertas
              </button>

              <button
                onClick={() => setFiltroStatus("fechada")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  filtroStatus === "fechada"
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700"
                }`}
              >
                Fechadas
              </button>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-zinc-600">Carregando necessidades...</p>
              </div>
            ) : necessidadesFiltradas.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-zinc-600">
                  Nenhuma necessidade cadastrada ainda.
                </p>
              </div>
            ) : (
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {necessidadesFiltradas.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/necessidades-voluntariado/${item.id}`}
                    className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md"
                  >
                    <p className="text-sm text-zinc-500">
                      {item.funcao?.nome ?? "Função não definida"}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                      {item.titulo_publico}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {item.descricao || "Sem descrição cadastrada."}
                    </p>

                    <div className="mt-4 space-y-2 text-sm text-zinc-600">
                      <p>
                        <span className="font-medium text-zinc-900">Status:</span>{" "}
                        {item.status}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">Total:</span>{" "}
                        {item.quantidade_total}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">Aprovados:</span>{" "}
                        {item.quantidade_aprovada}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">Restantes:</span>{" "}
                        {getVagasRestantes(item)}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">Pública:</span>{" "}
                        {item.exibir_publicamente ? "Sim" : "Não"}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">Data limite:</span>{" "}
                        {item.data_limite_inscricao_em
                            ? new Date(item.data_limite_inscricao_em).toLocaleString("pt-BR")
                            : "Não informada"}
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