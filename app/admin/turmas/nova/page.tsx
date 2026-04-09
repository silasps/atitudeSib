import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createTurmaAction } from "../actions";

function getUserLabel(user: any) {
  return user?.full_name || user?.nome || user?.email || "Sem identificação";
}

export default async function NovaTurmaPage() {
  const supabase = await createSupabaseServerClient();

  const { data: adminUsers } = await supabase.from("admin_users").select("*");

  const professores = (adminUsers ?? []).filter((user: any) => {
    const active = user.is_active !== false;
    const role = String(user.role ?? "");
    return active && (role === "professor" || role === "admin");
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">Gestão acadêmica</p>
          <h1 className="text-2xl font-bold text-zinc-900">Nova turma</h1>
        </div>

        <Link
          href="/admin/turmas"
          className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900"
        >
          Voltar
        </Link>
      </div>

      <form
        action={createTurmaAction}
        className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium text-zinc-800">
            Nome da turma
          </label>
          <input
            id="nome"
            name="nome"
            required
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none ring-0 focus:border-zinc-900"
            placeholder="Ex.: Judô infantil - manhã"
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
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            placeholder="Detalhes sobre objetivo, faixa etária ou observações gerais da turma"
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
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              defaultValue=""
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
              defaultValue="ativa"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            >
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
              <option value="encerrada">Encerrada</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="horario_inicio"
              className="text-sm font-medium text-zinc-800"
            >
              Horário de início
            </label>
            <input
              id="horario_inicio"
              name="horario_inicio"
              type="time"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="horario_fim"
              className="text-sm font-medium text-zinc-800"
            >
              Horário de fim
            </label>
            <input
              id="horario_fim"
              name="horario_fim"
              type="time"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="duracao_horas"
              className="text-sm font-medium text-zinc-800"
            >
              Duração (horas)
            </label>
            <input
              id="duracao_horas"
              name="duracao_horas"
              type="number"
              step="0.5"
              min="0"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              placeholder="Ex.: 1.5"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Salvar turma
          </button>
        </div>
      </form>
    </div>
  );
}