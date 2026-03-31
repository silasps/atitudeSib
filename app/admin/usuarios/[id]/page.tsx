import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { PageTitle } from "@/components/ui/page-title";
import type { AdminUser } from "@/types/admin-user";
import UsuarioEditor from "./usuario-editor";

export default async function UsuarioDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createSupabaseServerClient();
  const { data: usuario, error } = await supabase
    .from<AdminUser>("admin_users")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao carregar usuário: ${error.message}`);
  }

  if (!usuario) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <PageTitle
          title="Usuário autorizado"
          subtitle={`Gerencie ${usuario.nome || usuario.email}`}
        />
        <Link
          href="/admin/usuarios"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          ← Voltar para lista de usuários
        </Link>
      </div>

      <div className="grid gap-6">
        <UsuarioEditor initialUser={usuario} />
      </div>
    </div>
  );
}
