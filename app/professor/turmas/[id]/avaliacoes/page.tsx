import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfessorServerContext, getProfessorTurma } from "@/lib/professor-server";

type TurmaRecord = {
  id: number;
  nome: string;
};

type AvaliacaoRecord = {
  id: number;
  titulo: string;
  data?: string | null;
};

export default async function AvaliacoesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const turmaId = Number(id);

  if (!Number.isFinite(turmaId)) {
    notFound();
  }

  const { dataSupabase, user, allowed } = await getProfessorServerContext();

  if (!user) {
    redirect("/login");
  }

  if (!allowed) {
    redirect("/acesso-negado");
  }

  if (!dataSupabase) {
    throw new Error("Configuração do Supabase indisponível para leitura da turma.");
  }

  const turma = (await getProfessorTurma(
    dataSupabase,
    turmaId,
    user.id
  )) as TurmaRecord | null;

  if (!turma) {
    notFound();
  }

  // TODO: Implementar query para avaliacoes da turma
  const avaliacoes: AvaliacaoRecord[] = [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/professor/turmas/${turmaId}`}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          ← Voltar para {turma.nome}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">Avaliações</h1>
      </div>

      <div className="flex justify-between">
        <div />
        <button className="inline-flex rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white">
          Nova avaliação
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        {avaliacoes?.length ? (
          <div className="space-y-4">
            {avaliacoes.map((av) => (
              <div
                key={av.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 p-4"
              >
                <div>
                  <p className="font-semibold text-zinc-900">{av.titulo}</p>
                  <p className="text-sm text-zinc-600">Data: {av.data || "—"}</p>
                </div>
                <button className="text-sm font-medium text-zinc-900 underline">
                  Editar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Nenhuma avaliação criada ainda para esta turma.
          </p>
        )}
      </div>
    </div>
  );
}
