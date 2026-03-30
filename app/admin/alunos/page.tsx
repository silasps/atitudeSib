import Link from "next/link";
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

function getAge(value?: string | null) {
  const birth = parseDate(value);
  if (!birth) return null;

  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

export default async function AdminAlunosPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: alunos }, { data: matriculasAtivas }, { data: turmas }] =
    await Promise.all([
      supabase.from("alunos").select("*").order("nome"),
      supabase.from("matriculas").select("*").eq("status", "ativa"),
      supabase.from("turmas").select("id, nome"),
    ]);

  const turmasById = new Map<string, any>();
  for (const turma of turmas ?? []) {
    turmasById.set(String(turma.id), turma);
  }

  const turmaAtualPorAluno = new Map<string, string>();
  for (const matricula of matriculasAtivas ?? []) {
    if (!turmaAtualPorAluno.has(String(matricula.aluno_id))) {
      turmaAtualPorAluno.set(String(matricula.aluno_id), String(matricula.turma_id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm text-zinc-500">Gestão acadêmica</p>
          <h1 className="text-2xl font-bold text-zinc-900">Alunos</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Cadastre alunos e acompanhe o vínculo deles com as turmas.
          </p>
        </div>

        <Link
          href="/admin/alunos/novo"
          className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
        >
          Novo aluno
        </Link>
      </div>

      {alunos?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {alunos.map((aluno: any) => {
            const turmaId = turmaAtualPorAluno.get(String(aluno.id));
            const turma = turmaId ? turmasById.get(turmaId) : null;
            const idade = getAge(aluno.data_nascimento);

            return (
              <Link
                key={aluno.id}
                href={`/admin/alunos/${aluno.id}`}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {aluno.nome}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {idade !== null ? `${idade} anos` : "Idade não informada"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      aluno.status === "ativo"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    {aluno.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-zinc-600">
                  <p>
                    <span className="font-medium text-zinc-900">Nascimento:</span>{" "}
                    {formatDate(aluno.data_nascimento)}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Responsável:</span>{" "}
                    {aluno.nome_responsavel}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Telefone:</span>{" "}
                    {aluno.telefone_responsavel}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Turma atual:</span>{" "}
                    {turma?.nome || "Sem matrícula ativa"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            Nenhum aluno cadastrado
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Comece cadastrando os alunos da instituição.
          </p>
          <Link
            href="/admin/alunos/novo"
            className="mt-5 inline-flex rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
          >
            Criar aluno
          </Link>
        </div>
      )}
    </div>
  );
}