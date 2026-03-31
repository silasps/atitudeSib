"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
    <div className="space-y-6">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
                    className="flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div>
                      <p className="text-sm text-zinc-500">Função</p>
                      <h3 className="mt-1 text-lg font-semibold text-zinc-900">
                        {funcao.nome}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-zinc-600 line-clamp-3">
                        {funcao.descricao || "Sem descrição cadastrada."}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                        Status: {funcao.ativo ? "Ativa" : "Inativa"}
                      </span>
                      <Link
                        href={`/admin/funcoes-voluntariado/${funcao.id}`}
                        className="text-sm font-semibold text-zinc-900 transition hover:text-zinc-500"
                      >
                        Visualizar
                      </Link>
                    </div>
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
