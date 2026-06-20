import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { resolveUserRole, isAdminRole, isProfessorOrAdminRole } from "@/lib/auth-utils";

export default async function PainelRedirectPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { role, isActive } = await resolveUserRole(user);

  if (!isActive) {
    redirect("/acesso-negado");
  }

  if (isProfessorOrAdminRole(role) && !isAdminRole(role)) {
    redirect("/professor");
  }

  if (isAdminRole(role)) {
    redirect("/admin");
  }

  redirect("/acesso-negado");
}
