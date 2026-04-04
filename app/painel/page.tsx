import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

export default async function PainelRedirectPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1) Primeiro tenta app_metadata
  let role =
    ((user.app_metadata as Record<string, unknown>)?.app_role ??
      (user.app_metadata as Record<string, unknown>)?.role ??
      "") as string;

  // 2) Se não tiver app_role, consulta tabela admin_users com service role
  if (!role && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: adminUser } = await supabaseAdmin
      .from("admin_users")
      .select("role")
      .ilike("email", user.email ?? "")
      .maybeSingle();
    if (adminUser?.role) {
      role = adminUser.role as string;
    }
  }

  const normalizedRole = role.toString().toLowerCase();

  if (normalizedRole === "professor") {
    redirect("/professor");
  }

  // padrão: admin ou outro perfil
  redirect("/admin");
}
