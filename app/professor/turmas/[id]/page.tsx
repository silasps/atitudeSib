import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function parseDate(value?: string | null) {
  if (!value) return null;

  const normalized = String(value).trim();
  if (!normalized) return null;

  const safeValue = normalized.includes("T")
    ? normalized
    : `${normalized}T00:00:00`;

  const date = new Date(safeValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDate(value?: string | null) {
  const date = parseDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export default async function ProfessorTurmaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const turmaId = Number(id);

  if (!Number.isFinite(turmaId)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: turma, error: turmaError } = await supabase
    .from("turmas")
    .select("*")
    .eq("id", turmaId)
    .eq("professor_user_id", user.id)
    .maybeSingle();

  if (turmaError) {
    throw new Error(`Erro ao carregar turma: ${turmaError.message}`);
  }

  if (!turma) {
    notFound();
  }

  const { data: matriculas, error: matriculasError } = await supabase
    .from("matriculas")
    .select("*")
    .eq("turma_id", turmaId)
    .eq("status", "ativa")
    .order("created_at");

  if (matriculasError) {
    throw new Error(`Erro ao carregar matrículas: ${matriculasError.message}`);
  }

  const alunoIds = (matriculas ?? []).map((item: any) => Number(item.aluno_id));

  const { data: alunos } = alunoIds.length
    ? await supabase.from("alunos").select("*").in("id", alunoIds).order("nome")
    : { data: [] as any[] };

  const alunosById = new Map<string, any>();
  for (const aluno of alunos ?? []) {
    alunosById.set(String(aluno.id), aluno);
  }

  const { data: encontros } = await supabase
    .from("encontros_turma")
    .select("*")
    .eq("turma_id", turmaId)
    .order("data_encontro", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/professor/turmas"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          ← Voltar para minhas turmas
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">{turma.nome}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {turma.dias_horarios || "Dias e horários não informados"}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Dados da turma
            </h2>

            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <p>
                <span className="font-medium text-zinc-900">Status:</span>{" "}
                {turma.status}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Dias e horários:</span>{" "}
                {turma.dias_horarios || "Não informado"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Descrição:</span>{" "}
                {turma.descricao || "Sem descrição"}
              </p>
            </div>

            <Link
              href={`/professor/turmas/${turma.id}/presenca`}
              className="mt-5 inline-flex rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
            >
              Registrar presença
            </Link>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Alunos matriculados
            </h2>

            {matriculas?.length ? (
              <div className="mt-5 space-y-3">
                {matriculas.map((matricula: any) => {
                  const aluno = alunosById.get(String(matricula.aluno_id));

                  return (
                    <div
                      key={matricula.id}
                      className="rounded-2xl border border-zinc-200 p-4"
                    >
                      <p className="font-semibold text-zinc-900">
                        {aluno?.nome || "Aluno não encontrado"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        Responsável: {aluno?.nome_responsavel || "—"}
                      </p>
                      <p className="text-sm text-zinc-600">
                        Telefone: {aluno?.telefone_responsavel || "—"}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">
                Nenhum aluno ativo matriculado nesta turma.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Últimos encontros
          </h2>

          {encontros?.length ? (
            <div className="mt-5 space-y-3">
              {encontros.map((encontro: any) => (
                <div
                  key={encontro.id}
                  className="rounded-2xl border border-zinc-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {formatDate(encontro.data_encontro)}
                      </p>
                      {encontro.observacoes ? (
                        <p className="mt-1 text-sm text-zinc-600">
                          {encontro.observacoes}
                        </p>
                      ) : null}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        encontro.status === "aberto"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {encontro.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Nenhum encontro registrado ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}