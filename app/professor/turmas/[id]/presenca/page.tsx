import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  abrirEncontroAction,
  fecharEncontroAction,
  salvarPresencasAction,
} from "../../actions";

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
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

export default async function ProfessorPresencaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ data?: string }>;
}) {
  const { id } = await params;
  const turmaId = Number(id);

  if (!Number.isFinite(turmaId)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const dataSelecionada = resolvedSearchParams.data || getTodayISO();
  const returnPath = `/professor/turmas/${turmaId}/presenca?data=${dataSelecionada}`;

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

  const { data: encontro } = await supabase
    .from("encontros_turma")
    .select("*")
    .eq("turma_id", turmaId)
    .eq("data_encontro", dataSelecionada)
    .maybeSingle();

  const { data: presencas } = encontro
    ? await supabase
        .from("presencas")
        .select("*")
        .eq("encontro_turma_id", Number(encontro.id))
    : { data: [] as any[] };

  const presencasByMatriculaId = new Map<string, any>();
  for (const presenca of presencas ?? []) {
    presencasByMatriculaId.set(String(presenca.matricula_id), presenca);
  }

  const encontroFechado = encontro?.status === "fechado";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/professor/turmas/${turma.id}`}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          ← Voltar para turma
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">
          Presença · {turma.nome}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Controle por encontro/data.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <form className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <label
              htmlFor="data"
              className="text-sm font-medium text-zinc-800"
            >
              Data do encontro
            </label>
            <input
              id="data"
              name="data"
              type="date"
              defaultValue={dataSelecionada}
              className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <button
            type="submit"
            className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900"
          >
            Carregar data
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-600">
          <p>
            <span className="font-medium text-zinc-900">Data:</span>{" "}
            {formatDate(dataSelecionada)}
          </p>
          <p className="mt-1">
            <span className="font-medium text-zinc-900">Status do encontro:</span>{" "}
            {encontro ? encontro.status : "Ainda não aberto"}
          </p>
        </div>

        {!encontro ? (
          <form action={abrirEncontroAction} className="mt-5">
            <input type="hidden" name="turma_id" value={String(turma.id)} />
            <input type="hidden" name="data_encontro" value={dataSelecionada} />
            <input type="hidden" name="return_path" value={returnPath} />

            <button
              type="submit"
              className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
            >
              Abrir encontro
            </button>
          </form>
        ) : encontroFechado ? (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
            Este encontro já foi fechado. As presenças ficam disponíveis apenas para consulta.
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Lista de presença
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Marque a situação de cada aluno neste encontro.
            </p>
          </div>
        </div>

        {matriculas?.length ? (
          <form action={salvarPresencasAction} className="mt-5 space-y-4">
            <input type="hidden" name="turma_id" value={String(turma.id)} />
            <input type="hidden" name="data_encontro" value={dataSelecionada} />
            <input type="hidden" name="return_path" value={returnPath} />

            {matriculas.map((matricula: any) => {
              const aluno = alunosById.get(String(matricula.aluno_id));
              const presenca = presencasByMatriculaId.get(String(matricula.id));
              const defaultStatus = presenca?.status || "presente";

              return (
                <div
                  key={matricula.id}
                  className="rounded-2xl border border-zinc-200 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {aluno?.nome || "Aluno não encontrado"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        Responsável: {aluno?.nome_responsavel || "—"}
                      </p>
                    </div>

                    <select
                      name={`status_${matricula.id}`}
                      defaultValue={defaultStatus}
                      disabled={encontroFechado}
                      className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900 md:w-52"
                    >
                      <option value="presente">Presente</option>
                      <option value="falta">Falta</option>
                      <option value="justificada">Justificada</option>
                    </select>
                  </div>
                </div>
              );
            })}

            {!encontroFechado ? (
              <div className="flex flex-col gap-3 md:flex-row">
                <button
                  type="submit"
                  className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
                >
                  Salvar presença
                </button>

                {encontro ? (
                  <form action={fecharEncontroAction}>
                    <input
                      type="hidden"
                      name="encontro_id"
                      value={String(encontro.id)}
                    />
                    <input type="hidden" name="turma_id" value={String(turma.id)} />
                    <input
                      type="hidden"
                      name="return_path"
                      value={returnPath}
                    />
                    <button
                      type="submit"
                      className="rounded-2xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900"
                    >
                      Fechar encontro
                    </button>
                  </form>
                ) : null}
              </div>
            ) : null}
          </form>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">
            Não há alunos ativos matriculados nesta turma.
          </p>
        )}
      </div>
    </div>
  );
}