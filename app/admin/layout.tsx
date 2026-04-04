import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { resolveUserRole, isAdminRole } from "@/lib/auth-utils";
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

  const { role, isActive } = await resolveUserRole(user);

  if (!isActive || !isAdminRole(role)) {
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
