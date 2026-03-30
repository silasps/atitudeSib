import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { updateAlunoAction } from "../actions";

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

export default async function AlunoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const alunoId = Number(id);

  if (!Number.isFinite(alunoId)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();

  const [{ data: aluno }, { data: matriculas }, { data: turmas }] =
    await Promise.all([
      supabase.from("alunos").select("*").eq("id", alunoId).single(),
      supabase
        .from("matriculas")
        .select("*")
        .eq("aluno_id", alunoId)
        .order("created_at", { ascending: false }),
      supabase.from("turmas").select("id, nome"),
    ]);

  if (!aluno) {
    notFound();
  }

  const turmasById = new Map<string, any>();
  for (const turma of turmas ?? []) {
    turmasById.set(String(turma.id), turma);
  }

  const idade = getAge(aluno.data_nascimento);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/alunos"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          ← Voltar para alunos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">{aluno.nome}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {idade !== null ? `${idade} anos` : "Idade não informada"}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form
          action={updateAlunoAction}
          className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6"
        >
          <input type="hidden" name="id" value={String(aluno.id)} />

          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Dados do aluno</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Atualize o cadastro e informações do responsável.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="nome" className="text-sm font-medium text-zinc-800">
              Nome do aluno
            </label>
            <input
              id="nome"
              name="nome"
              required
              defaultValue={aluno.nome ?? ""}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="data_nascimento"
                className="text-sm font-medium text-zinc-800"
              >
                Data de nascimento
              </label>
              <input
                id="data_nascimento"
                name="data_nascimento"
                type="date"
                defaultValue={aluno.data_nascimento ?? ""}
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-zinc-800">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={aluno.status ?? "ativo"}
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="nome_responsavel"
                className="text-sm font-medium text-zinc-800"
              >
                Nome do responsável
              </label>
              <input
                id="nome_responsavel"
                name="nome_responsavel"
                required
                defaultValue={aluno.nome_responsavel ?? ""}
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="telefone_responsavel"
                className="text-sm font-medium text-zinc-800"
              >
                Telefone do responsável
              </label>
              <input
                id="telefone_responsavel"
                name="telefone_responsavel"
                required
                defaultValue={aluno.telefone_responsavel ?? ""}
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="observacoes"
              className="text-sm font-medium text-zinc-800"
            >
              Observações
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              rows={5}
              defaultValue={aluno.observacoes ?? ""}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
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

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Histórico de matrículas
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Veja em quais turmas o aluno já foi vinculado.
          </p>

          {matriculas?.length ? (
            <div className="mt-5 space-y-3">
              {matriculas.map((matricula: any) => {
                const turma = turmasById.get(String(matricula.turma_id));

                return (
                  <div
                    key={matricula.id}
                    className="rounded-2xl border border-zinc-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {turma?.nome || "Turma não encontrada"}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          Matrícula em {formatDate(matricula.data_matricula)}
                        </p>
                        {matricula.observacoes ? (
                          <p className="mt-1 text-sm text-zinc-500">
                            Obs.: {matricula.observacoes}
                          </p>
                        ) : null}
                      </div>

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
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 text-sm text-zinc-500">
              Esse aluno ainda não possui matrículas registradas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}