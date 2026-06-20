import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isAdminRole, resolveUserRole } from "@/lib/auth-utils";
import {
  normalizeVoluntariadoCandidaturaStatus,
  parseVoluntariadoAudit,
  resolveVoluntariadoParticipantState,
  serializeVoluntariadoAudit,
  type VoluntariadoParticipantStatus,
} from "@/lib/candidatura-voluntariado-audit";

type ParticipantPayload = {
  status?: string;
  joinedAt?: string | null;
  leftAt?: string | null;
  internalNotes?: string | null;
};

type CandidaturaParticipantRow = {
  id: number | string | null;
  status: string | null;
  created_at: string | null;
  observacoes: string | null;
};

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

function parseParticipantStatus(
  value: unknown
): VoluntariadoParticipantStatus | null {
  if (value === "ativo" || value === "inativo") {
    return value;
  }

  return null;
}

function normalizeDateValue(value: unknown) {
  const normalized = normalizeText(String(value ?? ""));

  if (!normalized) {
    return null;
  }

  const normalizedDateMatch = normalized.match(/^(\d{4}-\d{2}-\d{2})/);

  if (normalizedDateMatch) {
    return normalizedDateMatch[1];
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Foi informada uma data inválida.");
  }

  return parsed.toISOString().slice(0, 10);
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

  return { currentUser, supabaseAdmin };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const candidaturaId = Number(id);

    if (!Number.isInteger(candidaturaId) || candidaturaId <= 0) {
      return NextResponse.json(
        { success: false, message: "Participante inválido." },
        { status: 400 }
      );
    }

    const context = await getSupabaseContext();

    if (context instanceof NextResponse) {
      return context;
    }

    const { currentUser, supabaseAdmin } = context;
    const rawBody = (await req.json().catch(() => null)) as ParticipantPayload | null;

    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
      return NextResponse.json(
        { success: false, message: "Payload inválido." },
        { status: 400 }
      );
    }

    const nextStatus = parseParticipantStatus(rawBody.status);

    if (!nextStatus) {
      return NextResponse.json(
        { success: false, message: "Status do participante inválido." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("candidaturas_voluntariado")
      .select("id, status, created_at, observacoes")
      .eq("id", candidaturaId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const candidatura = (data as CandidaturaParticipantRow | null) ?? null;

    if (!candidatura) {
      return NextResponse.json(
        { success: false, message: "Participante não encontrado." },
        { status: 404 }
      );
    }

    const candidaturaStatus = normalizeVoluntariadoCandidaturaStatus(
      candidatura.status
    );

    if (candidaturaStatus !== "aprovado") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Somente voluntários aprovados podem ser gerenciados como participantes do projeto.",
        },
        { status: 409 }
      );
    }

    const parsedAudit = parseVoluntariadoAudit(candidatura.observacoes);

    if (!parsedAudit.audit) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Não foi possível salvar a gestão do participante porque a auditoria original da candidatura não foi encontrada.",
        },
        { status: 409 }
      );
    }

    const currentParticipant = resolveVoluntariadoParticipantState({
      audit: parsedAudit.audit,
      candidaturaStatus,
      candidaturaCreatedAt: candidatura.created_at,
    });

    const currentJoinedAt = normalizeDateValue(currentParticipant.joinedAt);
    const currentLeftAt = normalizeDateValue(currentParticipant.leftAt);
    const currentInternalNotes = normalizeText(currentParticipant.internalNotes);
    const today = new Date().toISOString().slice(0, 10);
    const nextJoinedAt =
      normalizeDateValue(rawBody.joinedAt) ?? currentJoinedAt ?? today;
    const nextLeftAt =
      nextStatus === "inativo"
        ? normalizeDateValue(rawBody.leftAt) ?? currentLeftAt ?? today
        : null;
    const nextInternalNotes = normalizeText(rawBody.internalNotes);

    if (nextLeftAt && nextJoinedAt && nextLeftAt < nextJoinedAt) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A data de desligamento não pode ser anterior à data de entrada no projeto.",
        },
        { status: 400 }
      );
    }

    const noChanges =
      currentParticipant.status === nextStatus &&
      currentJoinedAt === nextJoinedAt &&
      currentLeftAt === nextLeftAt &&
      currentInternalNotes === nextInternalNotes;

    if (noChanges) {
      return NextResponse.json({
        success: true,
        updated: false,
        message: "Nenhuma alteração detectada na gestão do participante.",
      });
    }

    const now = new Date().toISOString();
    const nextAudit = {
      ...parsedAudit.audit,
      participant: {
        status: nextStatus,
        joinedAt: nextJoinedAt,
        leftAt: nextLeftAt,
        internalNotes: nextInternalNotes,
        lastUpdatedAt: now,
      },
      participantHistory: [
        ...(parsedAudit.audit.participantHistory ?? []),
        {
          changedAt: now,
          actorUserId: currentUser.id,
          actorEmail: currentUser.email ?? null,
          previousStatus: currentParticipant.status,
          nextStatus,
          previousJoinedAt: currentJoinedAt,
          nextJoinedAt,
          previousLeftAt: currentLeftAt,
          nextLeftAt,
          previousInternalNotes: currentInternalNotes,
          nextInternalNotes,
        },
      ],
    };

    const { error: updateError } = await supabaseAdmin
      .from("candidaturas_voluntariado")
      .update({
        observacoes: serializeVoluntariadoAudit(nextAudit),
      })
      .eq("id", candidaturaId);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: true,
      message: "Participante atualizado com sucesso.",
      participant: resolveVoluntariadoParticipantState({
        audit: nextAudit,
        candidaturaStatus,
        candidaturaCreatedAt: candidatura.created_at,
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
