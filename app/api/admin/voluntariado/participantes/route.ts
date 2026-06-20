import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isAdminRole, resolveUserRole } from "@/lib/auth-utils";
import {
  buildVoluntariadoParticipanteListItem,
  normalizeEmail,
  resolveParticipanteAccessState,
  sortVoluntariadoParticipantes,
  type VoluntariadoParticipanteCandidateRow,
} from "@/lib/voluntariado-participantes";
import { parseVoluntariadoAudit } from "@/lib/candidatura-voluntariado-audit";

type AdminSupabaseClient = SupabaseClient;

type AdminUserRow = {
  id: string;
  email: string | null;
  role: string | null;
  ativo: boolean | null;
};

const PARTICIPANTES_SELECT_FIELDS = `
  id,
  nome_completo,
  email,
  telefone,
  cidade,
  estado,
  created_at,
  status,
  observacoes,
  necessidade:necessidade_id (
    id,
    titulo_publico
  )
`;

function envError(field: string) {
  return NextResponse.json(
    { success: false, message: `${field} não definida.` },
    { status: 500 }
  );
}

function normalizeText(value?: string | null) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

async function getSupabaseContext() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) return envError("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) return envError("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!serviceRoleKey) return envError("SUPABASE_SERVICE_ROLE_KEY");

  const cookieStore = await cookies();

  const supabaseServer = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user: currentUser },
  } = await supabaseServer.auth.getUser();

  if (!currentUser) {
    return NextResponse.json(
      { success: false, message: "Usuário não autenticado." },
      { status: 401 }
    );
  }

  const { role, isActive } = await resolveUserRole(currentUser);

  if (!isActive || !isAdminRole(role)) {
    return NextResponse.json(
      { success: false, message: "Acesso negado." },
      { status: 403 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  return { supabaseAdmin };
}

async function loadAdminUsersMaps(
  supabaseAdmin: AdminSupabaseClient,
  candidaturas: VoluntariadoParticipanteCandidateRow[]
) {
  const linkedUserIds = Array.from(
    new Set(
      candidaturas
        .map((row) => parseVoluntariadoAudit(row.observacoes).audit?.linkedAccess?.userId)
        .map((value) => normalizeText(value))
        .filter(Boolean)
    )
  ) as string[];

  const candidateEmails = Array.from(
    new Set(
      candidaturas
        .flatMap((row) => {
          const parsedAudit = parseVoluntariadoAudit(row.observacoes);

          return [row.email, parsedAudit.audit?.linkedAccess?.email];
        })
        .map((value) => normalizeEmail(value))
        .filter(Boolean)
    )
  ) as string[];

  const [usersByIdResult, usersByEmailResult] = await Promise.all([
    linkedUserIds.length
      ? supabaseAdmin
          .from("admin_users")
          .select("id, email, role, ativo")
          .in("id", linkedUserIds)
      : Promise.resolve({ data: [], error: null }),
    candidateEmails.length
      ? supabaseAdmin
          .from("admin_users")
          .select("id, email, role, ativo")
          .in("email", candidateEmails)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (usersByIdResult.error) {
    throw usersByIdResult.error;
  }

  if (usersByEmailResult.error) {
    throw usersByEmailResult.error;
  }

  const adminUsersById = new Map<string, AdminUserRow>();
  const adminUsersByEmail = new Map<string, AdminUserRow>();

  for (const row of (usersByIdResult.data ?? []) as AdminUserRow[]) {
    adminUsersById.set(row.id, row);

    const normalizedEmail = normalizeEmail(row.email);

    if (normalizedEmail) {
      adminUsersByEmail.set(normalizedEmail, row);
    }
  }

  for (const row of (usersByEmailResult.data ?? []) as AdminUserRow[]) {
    adminUsersById.set(row.id, row);

    const normalizedEmail = normalizeEmail(row.email);

    if (normalizedEmail) {
      adminUsersByEmail.set(normalizedEmail, row);
    }
  }

  return {
    adminUsersById,
    adminUsersByEmail,
  };
}

export async function GET() {
  try {
    const context = await getSupabaseContext();

    if (context instanceof NextResponse) {
      return context;
    }

    const { supabaseAdmin } = context;
    const { data, error } = await supabaseAdmin
      .from("candidaturas_voluntariado")
      .select(PARTICIPANTES_SELECT_FIELDS)
      .eq("status", "aprovado")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const candidaturas = (data ?? []) as VoluntariadoParticipanteCandidateRow[];
    const { adminUsersById, adminUsersByEmail } = await loadAdminUsersMaps(
      supabaseAdmin,
      candidaturas
    );

    const participantes = sortVoluntariadoParticipantes(
      candidaturas.map((row) => {
        const parsedAudit = parseVoluntariadoAudit(row.observacoes);
        const linkedAccess = resolveParticipanteAccessState(
          row.email,
          parsedAudit.audit?.linkedAccess,
          adminUsersById,
          adminUsersByEmail
        );

        return buildVoluntariadoParticipanteListItem(row, linkedAccess);
      })
    );

    return NextResponse.json({
      success: true,
      participantes,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
