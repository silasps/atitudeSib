import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function ProfessorTurmasPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: turmas, error } = await supabase
    .from("turmas")
    .select("*")
    .eq("professor_user_id", user.id)
    .order("nome");

  if (error) {
    throw new Error(`Erro ao carregar turmas: ${error.message}`);
  }

  const turmaIds = (turmas ?? []).map((item) => Number(item.id));

  const { data: matriculasAtivas } = turmaIds.length
    ? await supabase
        .from("matriculas")
        .select("id, turma_id")
        .in("turma_id", turmaIds)
        .eq("status", "ativa")
    : { data: [] as any[] };

  const countByTurmaId = new Map<string, number>();
  for (const matricula of matriculasAtivas ?? []) {
    const turmaId = String(matricula.turma_id);
    countByTurmaId.set(turmaId, (countByTurmaId.get(turmaId) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <p className="text-sm text-zinc-500">Área do professor</p>
        <h1 className="text-2xl font-bold text-zinc-900">Minhas turmas</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Acompanhe as turmas atribuídas a você e registre a presença dos alunos.
        </p>
      </div>

      {turmas?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {turmas.map((turma: any) => {
            const matriculados = countByTurmaId.get(String(turma.id)) ?? 0;

            return (
              <div
                key={turma.id}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {turma.nome}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {turma.dias_horarios || "Dias e horários não informados"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      turma.status === "ativa"
                        ? "bg-emerald-100 text-emerald-700"
                        : turma.status === "encerrada"
                        ? "bg-zinc-200 text-zinc-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {turma.status}
                  </span>
                </div>

                {turma.descricao ? (
                  <p className="mt-4 text-sm text-zinc-600">{turma.descricao}</p>
                ) : null}

                <div className="mt-4 space-y-2 text-sm text-zinc-600">
                  <p>
                    <span className="font-medium text-zinc-900">Matriculados:</span>{" "}
                    {matriculados}
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <Link
                    href={`/professor/turmas/${turma.id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900"
                  >
                    Ver turma
                  </Link>

                  <Link
                    href={`/professor/turmas/${turma.id}/presenca`}
                    className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Registrar presença
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            Nenhuma turma vinculada
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Quando uma turma for atribuída ao seu usuário, ela aparecerá aqui.
          </p>
        </div>
      )}
    </div>
  );
}