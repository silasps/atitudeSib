import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  createMatriculaAction,
  encerrarMatriculaAction,
  updateTurmaAction,
} from "../actions";

function getUserLabel(user: any) {
  return user?.full_name || user?.nome || user?.email || "Sem identificação";
}

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

export default async function TurmaDetalhePage({
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

  const [{ data: turma }, { data: adminUsers }, { data: matriculas }, { data: alunos }] =
    await Promise.all([
      supabase.from("turmas").select("*").eq("id", turmaId).single(),
      supabase.from("admin_users").select("*"),
      supabase
        .from("matriculas")
        .select("*")
        .eq("turma_id", turmaId)
        .order("created_at", { ascending: false }),
      supabase.from("alunos").select("*").order("nome"),
    ]);

  if (!turma) {
    notFound();
  }

  const professores = (adminUsers ?? []).filter((user: any) => {
    const active = user.is_active !== false;
    const role = String(user.role ?? "");
    return active && (role === "professor" || role === "admin");
  });

  const usersById = new Map<string, any>();
  for (const user of adminUsers ?? []) {
    const key = String(user.user_id ?? user.id ?? "");
    if (key) usersById.set(key, user);
  }

  const alunosById = new Map<string, any>();
  for (const aluno of alunos ?? []) {
    alunosById.set(String(aluno.id), aluno);
  }

  const matriculasDaTurma = matriculas ?? [];
  const alunoIdsJaVinculados = new Set(
    matriculasDaTurma.map((item: any) => String(item.aluno_id))
  );

  const alunosDisponiveis = (alunos ?? []).filter((aluno: any) => {
    const ativo = aluno.status !== "inativo";
    return ativo && !alunoIdsJaVinculados.has(String(aluno.id));
  });

  const matriculasAtivas = matriculasDaTurma.filter(
    (item: any) => item.status === "ativa"
  );

  const professorAtual = turma.professor_user_id
    ? usersById.get(String(turma.professor_user_id))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/admin/turmas"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
          >
            ← Voltar para turmas
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">{turma.nome}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {turma.dias_horarios || "Dias e horários não informados"}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form
          action={updateTurmaAction}
          className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6"
        >
          <input type="hidden" name="id" value={String(turma.id)} />

          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Dados da turma</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Atualize professor, horários e status.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="nome" className="text-sm font-medium text-zinc-800">
              Nome da turma
            </label>
            <input
              id="nome"
              name="nome"
              required
              defaultValue={turma.nome ?? ""}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="descricao"
              className="text-sm font-medium text-zinc-800"
            >
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={4}
              defaultValue={turma.descricao ?? ""}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="professor_user_id"
                className="text-sm font-medium text-zinc-800"
              >
                Professor responsável
              </label>
              <select
                id="professor_user_id"
                name="professor_user_id"
                defaultValue={turma.professor_user_id ?? ""}
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              >
                <option value="">Selecionar depois</option>
                {professores.map((user: any) => (
                  <option
                    key={String(user.user_id ?? user.id ?? "")}
                    value={String(user.user_id ?? user.id ?? "")}
                  >
                    {getUserLabel(user)} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-zinc-800">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={turma.status ?? "ativa"}
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              >
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
                <option value="encerrada">Encerrada</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="dias_horarios"
              className="text-sm font-medium text-zinc-800"
            >
              Dias e horários
            </label>
            <input
              id="dias_horarios"
              name="dias_horarios"
              defaultValue={turma.dias_horarios ?? ""}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">Professor atual:</span>{" "}
              {professorAtual ? getUserLabel(professorAtual) : "Não definido"}
            </p>
            <p className="mt-1">
              <span className="font-medium text-zinc-900">Matriculados ativos:</span>{" "}
              {matriculasAtivas.length}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Salvar alterações
            </button>
          </div>
        </form>

        <form
          action={createMatriculaAction}
          className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6"
        >
          <input type="hidden" name="turma_id" value={String(turma.id)} />

          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Matricular aluno
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Vincule um aluno já cadastrado a esta turma.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="aluno_id" className="text-sm font-medium text-zinc-800">
              Aluno
            </label>
            <select
              id="aluno_id"
              name="aluno_id"
              required
              defaultValue=""
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            >
              <option value="">Selecione um aluno</option>
              {alunosDisponiveis.map((aluno: any) => (
                <option key={aluno.id} value={String(aluno.id)}>
                  {aluno.nome} — {aluno.nome_responsavel}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="observacoes"
              className="text-sm font-medium text-zinc-800"
            >
              Observações da matrícula
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              rows={4}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              placeholder="Opcional"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!alunosDisponiveis.length}
              className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Matricular aluno
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Alunos vinculados
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Histórico de matrículas desta turma.
            </p>
          </div>
        </div>

        {matriculasDaTurma.length ? (
          <div className="mt-5 space-y-3">
            {matriculasDaTurma.map((matricula: any) => {
              const aluno = alunosById.get(String(matricula.aluno_id));

              return (
                <div
                  key={matricula.id}
                  className="rounded-2xl border border-zinc-200 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-zinc-900">
                        {aluno?.nome || "Aluno não encontrado"}
                      </p>
                      <p className="text-sm text-zinc-600">
                        Responsável: {aluno?.nome_responsavel || "—"}
                      </p>
                      <p className="text-sm text-zinc-600">
                        Telefone: {aluno?.telefone_responsavel || "—"}
                      </p>
                      <p className="text-sm text-zinc-500">
                        Matrícula em {formatDate(matricula.data_matricula)}
                      </p>
                      {matricula.observacoes ? (
                        <p className="text-sm text-zinc-500">
                          Obs.: {matricula.observacoes}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          matricula.status === "ativa"
                            ? "bg-emerald-100 text-emerald-700"
                            : matricula.status === "encerrada"
                            ? "bg-zinc-200 text-zinc-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {matricula.status}
                      </span>

                      {matricula.status === "ativa" ? (
                        <form action={encerrarMatriculaAction}>
                          <input
                            type="hidden"
                            name="matricula_id"
                            value={String(matricula.id)}
                          />
                          <input
                            type="hidden"
                            name="turma_id"
                            value={String(turma.id)}
                          />
                          <button
                            type="submit"
                            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900"
                          >
                            Encerrar matrícula
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-5 text-sm text-zinc-500">
            Nenhum aluno foi vinculado a esta turma ainda.
          </p>
        )}
      </div>
    </div>
  );
}