import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Header } from "@/components/layout/header";
import { AdminSidebarProvider } from "@/components/layout/admin-sidebar-context";
import { ProfessorSidebar } from "@/components/layout/professor-sidebar";

export default async function ProfessorLayout({
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

  return (
    <AdminSidebarProvider>
      <div className="min-h-screen bg-zinc-50 md:flex">
        <ProfessorSidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}