import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createServiceRoleClient,
  isProfessorOrAdminRole,
  resolveUserRole,
} from "@/lib/auth-utils";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ProfessorServerContext = {
  authSupabase: SupabaseClient;
  dataSupabase: SupabaseClient | null;
  user: {
    id: string;
    email?: string | null;
    app_metadata?: Record<string, unknown>;
  } | null;
  role: string;
  isActive: boolean;
  allowed: boolean;
};

export async function getProfessorServerContext(): Promise<ProfessorServerContext> {
  const authSupabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return {
      authSupabase,
      dataSupabase: null,
      user: null,
      role: "",
      isActive: false,
      allowed: false,
    };
  }

  const { role, isActive } = await resolveUserRole(user);

  return {
    authSupabase,
    dataSupabase: createServiceRoleClient(),
    user,
    role,
    isActive,
    allowed: isActive && isProfessorOrAdminRole(role),
  };
}

export async function getProfessorTurma(
  dataSupabase: SupabaseClient,
  turmaId: number,
  userId: string,
  select = "*"
): Promise<Record<string, unknown> | null> {
  const { data, error } = await dataSupabase
    .from("turmas")
    .select(select)
    .eq("id", turmaId)
    .eq("professor_user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao carregar turma: ${error.message}`);
  }

  return (data ?? null) as Record<string, unknown> | null;
}
