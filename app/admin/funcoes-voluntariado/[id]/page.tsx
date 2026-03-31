import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { PageTitle } from "@/components/ui/page-title";
import type { FuncaoVoluntariado } from "@/types";
import FuncaoEditor from "@/components/admin/funcao-editor";

export default async function FuncaoDetalhePage({
  params,
}: {
  params: { id?: string };
}) {
  const id = params?.id;

  if (!id) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const { data: funcao, error } = await supabase
    .from("funcoes_voluntariado")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao carregar função: ${error.message}`);
  }

  if (!funcao) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex space-y-2 flex-col">
        <PageTitle
          title="Função de voluntariado"
          subtitle="Visualize e altere os dados cadastrados"
        />

        <Link
          href="/admin/funcoes-voluntariado"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          ← Voltar para funções
        </Link>
      </div>

      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Status atual</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900">
            {funcao.ativo ? "Ativa" : "Inativa"}
          </p>
          <p className="text-sm text-zinc-600">
            Criado em {new Date(funcao.created_at).toLocaleString("pt-BR")}
          </p>
        </div>

        <FuncaoEditor initialData={funcao as FuncaoVoluntariado} />
      </section>
    </div>
  );
}
