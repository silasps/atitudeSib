"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTitle } from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";
import type { FuncaoVoluntariado } from "@/types";

export default function FuncoesVoluntariadoPage() {
  const [funcoes, setFuncoes] = useState<FuncaoVoluntariado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFuncoes() {
      const { data, error } = await supabase
        .from("funcoes_voluntariado")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar funções:", error);
        setFuncoes([]);
        setLoading(false);
        return;
      }

      setFuncoes((data ?? []) as FuncaoVoluntariado[]);
      setLoading(false);
    }

    fetchFuncoes();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />

          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <PageTitle
                title="Funções de voluntariado"
                subtitle="Cadastre as áreas em que a instituição precisa de pessoas"
              />

              <Link
                href="/admin/funcoes-voluntariado/nova"
                className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
              >
                Nova função
              </Link>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-zinc-600">Carregando funções...</p>
              </div>
            ) : funcoes.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-zinc-600">
                  Nenhuma função cadastrada ainda.
                </p>
              </div>
            ) : (
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {funcoes.map((funcao) => (
                  <div
                    key={funcao.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {funcao.nome}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {funcao.descricao || "Sem descrição cadastrada."}
                    </p>

                    <p className="mt-4 text-sm text-zinc-500">
                      Status: {funcao.ativo ? "Ativa" : "Inativa"}
                    </p>
                  </div>
                ))}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}