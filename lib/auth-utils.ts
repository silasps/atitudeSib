import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type AuthUser = {
  id: string;
  email?: string | null;
  app_metadata?: Record<string, unknown>;
};

export type UserRoleResult = {
  role: string;
  isActive: boolean;
};

function normalizeRole(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

export function getRoleFromMetadata(user: AuthUser | null) {
  if (!user?.app_metadata) {
    return "";
  }

  return normalizeRole(
    (user.app_metadata.app_role ?? user.app_metadata.role ?? "") as string
  );
}

export function createServiceRoleClient(): SupabaseClient | null {
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getStoredUserRole(user: AuthUser | null) {
  if (!user) {
    return {
      role: "",
      isActive: true,
    };
  }

  const supabaseAdmin = createServiceRoleClient();
  if (!supabaseAdmin) {
    return {
      role: "",
      isActive: true,
    };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .select("role, ativo")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("auth-utils/getStoredUserRole", error);
    }

    if (data) {
      return {
        role: normalizeRole(data.role),
        isActive: (data.ativo ?? true) !== false,
      };
    }

    if (user.email) {
      const { data: byEmail, error: byEmailError } = await supabaseAdmin
        .from("admin_users")
        .select("role, ativo")
        .ilike("email", user.email)
        .maybeSingle();

      if (byEmailError) {
        console.error("auth-utils/getStoredUserRole.byEmail", byEmailError);
      }

      if (byEmail) {
        return {
          role: normalizeRole(byEmail.role),
          isActive: (byEmail.ativo ?? true) !== false,
        };
      }
    }
  } catch (error) {
    console.error("auth-utils/getStoredUserRole.catch", error);
  }

  return {
    role: "",
    isActive: true,
  };
}

export async function resolveUserRole(user: AuthUser | null) {
  const storedRole = await getStoredUserRole(user);
  if (storedRole.role) {
    return storedRole;
  }

  return {
    role: getRoleFromMetadata(user),
    isActive: true,
  };
}

export function isAdminRole(role: string) {
  return normalizeRole(role) === "admin";
}

export function isProfessorOrAdminRole(role: string) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "professor" || normalizedRole === "admin";
}

export async function getLoginDestination(
  user: AuthUser | null,
  browserSupabase: SupabaseClient
) {
  if (!user) {
    return "/acesso-negado";
  }

  const metadataRole = getRoleFromMetadata(user);
  if (isAdminRole(metadataRole)) {
    return "/admin";
  }

  if (isProfessorOrAdminRole(metadataRole)) {
    return "/professor/turmas";
  }

  try {
    const { data, error } = await browserSupabase
      .from("admin_users")
      .select("role, ativo")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      const role = normalizeRole(data.role);
      const isActive = (data.ativo ?? true) !== false;

      if (isActive) {
        if (isAdminRole(role)) {
          return "/admin";
        }

        if (isProfessorOrAdminRole(role)) {
          return "/professor/turmas";
        }
      }
    }
  } catch (error) {
    console.error("auth-utils/getLoginDestination/admin_users", error);
  }

  try {
    const { data: turmas, error: turmasError } = await browserSupabase
      .from("turmas")
      .select("id")
      .eq("professor_user_id", user.id)
      .limit(1);

    if (!turmasError && turmas?.length) {
      return "/professor/turmas";
    }
  } catch (error) {
    console.error("auth-utils/getLoginDestination/turmas", error);
  }

  return "/acesso-negado";
}
