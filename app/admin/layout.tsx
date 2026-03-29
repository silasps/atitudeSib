import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
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

  if (error) {
    redirect("/acesso-negado");
  }

  if (!adminUser) {
    redirect("/acesso-negado");
  }

  return <>{children}</>;
}