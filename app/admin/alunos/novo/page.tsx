import Link from "next/link";
import { AlunoCadastroForm } from "@/components/admin/aluno-cadastro-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function NovoAlunoPage() {
  const supabase = await createSupabaseServerClient();
  const { data: turmas } = await supabase
    .from("turmas")
    .select("id, nome")
    .in("status", ["ativa", "inativa"])
    .order("nome");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm text-zinc-500">Gestão acadêmica</p>
          <h1 className="text-2xl font-bold text-zinc-900">Novo aluno</h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-600">
            Cadastro expandido com dados pessoais, condições socioeconômicas,
            saúde, documentos e termos obrigatórios.
          </p>
        </div>

        <Link
          href="/admin/alunos"
          className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900"
        >
          Voltar
        </Link>
      </div>

      <AlunoCadastroForm turmas={((turmas ?? []) as { id: number; nome: string }[]).map(
        (turma) => ({
          id: Number(turma.id),
          nome: String(turma.nome ?? ""),
        })
      )} />
    </div>
  );
}
