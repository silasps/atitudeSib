import Link from "next/link";
import { PageTitle } from "@/components/ui/page-title";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { AdminUser } from "@/types/admin-user";

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("pt-BR");
}

export default async function UsuariosPage() {
  const supabase = await createSupabaseServerClient();
  const { data: usuarios, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao carregar usuários: ${error.message}`);
  }

  const filteredUsers = (usuarios ?? []).filter(
    (user: AdminUser | null | undefined) => typeof user?.id === "string"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm text-zinc-500">Gestão do painel</p>
          <h1 className="text-2xl font-bold text-zinc-900">Usuários autorizados</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Monitore e edite quem pode acessar o dashboard administrativo.
          </p>
        </div>

        <Link
          href="/admin/usuarios/novo"
          className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
        >
          Novo usuário
        </Link>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 md:p-6 shadow-sm">
        <div className="mt-2">
          {filteredUsers.length === 0 ? (
            <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
              Nenhum usuário autorizado ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-zinc-900">
                      {user.nome || "Sem nome informado"}
                    </p>
                    <p className="text-sm text-zinc-600">{user.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">
                        Perfil: {user.role}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 font-semibold ${
                          user.ativo
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {user.ativo ? "Ativo" : "Inativo"}
                      </span>
                      <span>Criado em: {formatDateTime(user.created_at)}</span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/usuarios/${user.id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900"
                  >
                    Editar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
