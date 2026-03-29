"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type NecessidadePublica = {
  id: number;
  titulo_publico: string;
  descricao: string | null;
  quantidade_total: number;
  quantidade_aprovada: number;
  data_limite_inscricao_em: string | null;
  status: string;
  exibir_publicamente: boolean;
};

function formatDateTime(dateString: string | null) {
  if (!dateString) return "Não informada";
  return new Date(dateString).toLocaleString("pt-BR");
}

function vagasRestantes(item: NecessidadePublica) {
  return Math.max(item.quantidade_total - item.quantidade_aprovada, 0);
}

export default function SejaVoluntarioPage() {
  const [necessidades, setNecessidades] = useState<NecessidadePublica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNecessidadesPublicas() {
      const agora = new Date();

      const { data, error } = await supabase
        .from("necessidades_voluntariado")
        .select(
          "id, titulo_publico, descricao, quantidade_total, quantidade_aprovada, data_limite_inscricao_em, status, exibir_publicamente"
        )
        .eq("status", "aberta")
        .eq("exibir_publicamente", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar necessidades públicas:", error);
        setNecessidades([]);
        setLoading(false);
        return;
      }

      const filtradas = (data ?? []).filter((item) => {
        const restantes =
          Math.max(
            Number(item.quantidade_total ?? 0) -
              Number(item.quantidade_aprovada ?? 0),
            0
          ) > 0;

        const dentroDoPrazo =
          !item.data_limite_inscricao_em ||
          new Date(item.data_limite_inscricao_em) > agora;

        return restantes && dentroDoPrazo;
      }) as NecessidadePublica[];

      setNecessidades(filtradas);
      setLoading(false);
    }

    fetchNecessidadesPublicas();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-zinc-500">Projeto Atitude</p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900">
            Seja um voluntário
          </h1>
          <p className="mt-3 text-zinc-600">
            Veja as áreas em que a instituição precisa de apoio e candidate-se
            para servir no projeto.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-600">
                Carregando oportunidades...
              </p>
            </div>
          ) : necessidades.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-600">
                Não há oportunidades abertas no momento.
              </p>
            </div>
          ) : (
            necessidades.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-zinc-900">
                  {item.titulo_publico}
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {item.descricao || "Sem descrição disponível."}
                </p>

                <div className="mt-4 space-y-2 text-sm text-zinc-600">
                  <p>
                    <span className="font-medium text-zinc-900">
                      Vagas restantes:
                    </span>{" "}
                    {vagasRestantes(item)}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Data limite:
                    </span>{" "}
                    {formatDateTime(item.data_limite_inscricao_em)}
                  </p>
                </div>

                <Link
                  href={`/seja-voluntario/cadastro?necessidade=${item.id}`}
                  className="mt-5 inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Quero me candidatar
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}