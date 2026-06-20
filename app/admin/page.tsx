"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  totalFuncoes: number;
  necessidadesAbertas: number;
  candidaturasPendentes: number;
  participantesAprovados: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFuncoes: 0,
    necessidadesAbertas: 0,
    candidaturasPendentes: 0,
    participantesAprovados: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [
        { data: funcoesData, error: funcoesError },
        { data: necessidadesData, error: necessidadesError },
        { data: candidaturasData, error: candidaturasError },
        { data: participantesData, error: participantesError },
      ] = await Promise.all([
        supabase.from("funcoes_voluntariado").select("id"),
        supabase
          .from("necessidades_voluntariado")
          .select("id, status")
          .eq("status", "aberta"),
        supabase
          .from("candidaturas_voluntariado")
          .select("id, status")
          .eq("status", "pendente"),
        supabase
          .from("candidaturas_voluntariado")
          .select("id, status")
          .eq("status", "aprovado"),
      ]);

      if (
        funcoesError ||
        necessidadesError ||
        candidaturasError ||
        participantesError
      ) {
        console.error(
          funcoesError ||
            necessidadesError ||
            candidaturasError ||
            participantesError
        );
        return;
      }

      setStats({
        totalFuncoes: (funcoesData ?? []).length,
        necessidadesAbertas: (necessidadesData ?? []).length,
        candidaturasPendentes: (candidaturasData ?? []).length,
        participantesAprovados: (participantesData ?? []).length,
      });
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-4 md: p-6">
            <PageTitle
              title="Painel administrativo"
              subtitle="Visão geral do voluntariado, das candidaturas e de quem já faz parte do projeto"
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/admin/funcoes-voluntariado"
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                <p className="text-sm text-zinc-500">Funções cadastradas</p>
                <h3 className="mt-2 text-3xl font-bold text-zinc-900">
                  {stats.totalFuncoes}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Clique para abrir as funções
                </p>
              </Link>

              <Link
                href="/admin/necessidades-voluntariado"
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                <p className="text-sm text-zinc-500">Necessidades abertas</p>
                <h3 className="mt-2 text-3xl font-bold text-zinc-900">
                  {stats.necessidadesAbertas}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Clique para abrir as necessidades
                </p>
              </Link>

              <Link
                href="/admin/candidaturas-voluntariado"
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                <p className="text-sm text-zinc-500">Candidaturas pendentes</p>
                <h3 className="mt-2 text-3xl font-bold text-zinc-900">
                  {stats.candidaturasPendentes}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Clique para abrir as candidaturas
                </p>
              </Link>

              <Link
                href="/admin/participantes"
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                <p className="text-sm text-zinc-500">Participantes aprovados</p>
                <h3 className="mt-2 text-3xl font-bold text-zinc-900">
                  {stats.participantesAprovados}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Clique para acompanhar quem já entrou no projeto
                </p>
              </Link>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
