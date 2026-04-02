import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { AdminTopNavigation } from "@/components/layout/admin-top-navigation";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (error || !adminUser) {
    redirect("/acesso-negado");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminTopNavigation />

      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <main>{children}</main>
      </div>
    </div>
  );
}
