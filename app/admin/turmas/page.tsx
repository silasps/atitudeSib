import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function getUserLabel(user: any) {
  return user?.full_name || user?.nome || user?.email || "Sem identificação";
}

export default async function AdminTurmasPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: turmas }, { data: adminUsers }, { data: matriculasAtivas }] =
    await Promise.all([
      supabase.from("turmas").select("*").order("created_at", { ascending: false }),
      supabase.from("admin_users").select("*"),
      supabase.from("matriculas").select("id, turma_id").eq("status", "ativa"),
    ]);

  const usersById = new Map<string, any>();
  for (const user of adminUsers ?? []) {
    const key = String(user.user_id ?? user.id ?? "");
    if (key) usersById.set(key, user);
  }

  const countByTurmaId = new Map<string, number>();
  for (const matricula of matriculasAtivas ?? []) {
    const turmaId = String(matricula.turma_id);
    countByTurmaId.set(turmaId, (countByTurmaId.get(turmaId) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm text-zinc-500">Gestão acadêmica</p>
          <h1 className="text-2xl font-bold text-zinc-900">Turmas</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Cadastre turmas, vincule professor e acompanhe matrículas.
          </p>
        </div>

        <Link
          href="/admin/turmas/nova"
          className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
        >
          Nova turma
        </Link>
      </div>

      {turmas?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 flex-1 p-4 md:p-4 md: p-6">
          {turmas.map((turma: any) => {
            const professor = turma.professor_user_id
              ? usersById.get(String(turma.professor_user_id))
              : null;

            const matriculados = countByTurmaId.get(String(turma.id)) ?? 0;

            return (
              <Link
                key={turma.id}
                href={`/admin/turmas/${turma.id}`}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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

                <div className="mt-4 space-y-2 text-sm text-zinc-600">
                  <p>
                    <span className="font-medium text-zinc-900">Professor:</span>{" "}
                    {professor ? getUserLabel(professor) : "Não definido"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Matriculados:</span>{" "}
                    {matriculados}
                  </p>
                </div>

                {turma.descricao ? (
                  <p className="mt-4 line-clamp-3 text-sm text-zinc-600">
                    {turma.descricao}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            Nenhuma turma cadastrada
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Comece criando a primeira turma do projeto.
          </p>
          <Link
            href="/admin/turmas/nova"
            className="mt-5 inline-flex rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
          >
            Criar turma
          </Link>
        </div>
      )}
    </div>
  );
}