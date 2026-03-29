"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTitle } from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  totalFuncoes: number;
  necessidadesAbertas: number;
  candidaturasPendentes: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFuncoes: 0,
    necessidadesAbertas: 0,
    candidaturasPendentes: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [
        { data: funcoesData, error: funcoesError },
        { data: necessidadesData, error: necessidadesError },
        { data: candidaturasData, error: candidaturasError },
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
      ]);

      if (funcoesError || necessidadesError || candidaturasError) {
        console.error(funcoesError || necessidadesError || candidaturasError);
        return;
      }

      setStats({
        totalFuncoes: (funcoesData ?? []).length,
        necessidadesAbertas: (necessidadesData ?? []).length,
        candidaturasPendentes: (candidaturasData ?? []).length,
      });
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <Header />

          <main className="flex-1 space-y-6 p-6">
            <PageTitle
              title="Painel administrativo"
              subtitle="Visão geral do voluntariado e das candidaturas"
            />

            <section className="grid gap-4 md:grid-cols-3">
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
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}