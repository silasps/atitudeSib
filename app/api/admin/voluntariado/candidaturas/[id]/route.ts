import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isAdminRole, resolveUserRole } from "@/lib/auth-utils";
import {
  parseVoluntariadoAudit,
  serializeVoluntariadoAudit,
  VOLUNTARIADO_EDITABLE_FIELD_LABELS,
  normalizeVoluntariadoCandidaturaStatus,
  type VoluntariadoCandidaturaStatus,
  type VoluntariadoEditableField,
  type VoluntariadoLinkedAccessAudit,
} from "@/lib/candidatura-voluntariado-audit";

type AdminSupabaseClient = SupabaseClient;

type EditableDbKey =
  | "nome_completo"
  | "cpf"
  | "rg"
  | "data_nascimento"
  | "email"
  | "telefone"
  | "cep"
  | "endereco"
  | "numero"
  | "complemento"
  | "bairro"
  | "cidade"
  | "estado"
  | "disponibilidade";

type EditableFieldDefinition = {
  dbKey: EditableDbKey;
  auditField: VoluntariadoEditableField;
};

type ExistingCandidaturaRecord = {
  id: number;
  observacoes: string | null;
} & Record<EditableDbKey, string | null>;

type CandidateFieldChange = {
  field: VoluntariadoEditableField;
  label: string;
  previousValue: string | null;
  nextValue: string | null;
};

type NecessidadeRow =
  | {
      id: number | string | null;
      titulo_publico: string | null;
      quantidade_total: number | string | null;
      quantidade_aprovada: number | string | null;
      status: string | null;
      exibir_publicamente: boolean | null;
    }
  | Array<{
      id: number | string | null;
      titulo_publico: string | null;
      quantidade_total: number | string | null;
      quantidade_aprovada: number | string | null;
      status: string | null;
      exibir_publicamente: boolean | null;
    }>
  | null;

type CandidaturaDetailRow = {
  id: number | string | null;
  necessidade_id: number | string | null;
  nome_completo: string | null;
  cpf: string | null;
  rg: string | null;
  data_nascimento: string | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  disponibilidade: string | null;
  observacoes: string | null;
  status: string | null;
  termo_aceito: boolean | null;
  termo_aceito_em: string | null;
  termo_versao: string | null;
  created_at: string | null;
  necessidade: NecessidadeRow;
};

type AdminUserRow = {
  id: string;
  email: string | null;
  nome: string | null;
  role: string | null;
  ativo: boolean | null;
};

type LinkedAccessInfo = {
  userId: string;
  email: string | null;
  nome: string | null;
  role: string | null;
  active: boolean;
};

type NeedState = {
  id: number;
  tituloPublico: string;
  quantidadeTotal: number;
  quantidadeAprovada: number;
  status: string;
  exibirPublicamente: boolean;
};

type StatusAction = "approve" | "approve_with_access" | "reject";

type StatusActionPayload = {
  action?: string;
  email?: string;
  password?: string;
  role?: string;
};

const EDITABLE_FIELDS: EditableFieldDefinition[] = [
  { dbKey: "nome_completo", auditField: "nomeCompleto" },
  { dbKey: "cpf", auditField: "cpf" },
  { dbKey: "rg", auditField: "rg" },
  { dbKey: "data_nascimento", auditField: "dataNascimento" },
  { dbKey: "email", auditField: "email" },
  { dbKey: "telefone", auditField: "telefone" },
  { dbKey: "cep", auditField: "cep" },
  { dbKey: "endereco", auditField: "endereco" },
  { dbKey: "numero", auditField: "numero" },
  { dbKey: "complemento", auditField: "complemento" },
  { dbKey: "bairro", auditField: "bairro" },
  { dbKey: "cidade", auditField: "cidade" },
  { dbKey: "estado", auditField: "estado" },
  { dbKey: "disponibilidade", auditField: "disponibilidade" },
];

const SELECT_FIELDS = ["id", "observacoes", ...EDITABLE_FIELDS.map((field) => field.dbKey)].join(
  ", "
);

const DETAIL_SELECT_FIELDS = `
  id,
  necessidade_id,
  nome_completo,
  cpf,
  rg,
  data_nascimento,
  email,
  telefone,
  cep,
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  disponibilidade,
  observacoes,
  status,
  termo_aceito,
  termo_aceito_em,
  termo_versao,
  created_at,
  necessidade:necessidade_id (
    id,
    titulo_publico,
    quantidade_total,
    quantidade_aprovada,
    status,
    exibir_publicamente
  )
`;

function envError(field: string) {
  return NextResponse.json(
    { success: false, message: `${field} não definida.` },
    { status: 500 }
  );
}

function normalizeOptionalText(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function normalizeRequiredText(value: unknown, label: string) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    throw new Error(`${label} é obrigatório.`);
  }

  return normalized;
}

function normalizeRole(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function buildUpdatePayload(body: Record<string, unknown>) {
  return {
    nome_completo: normalizeRequiredText(body.nome_completo, "Nome completo"),
    cpf: normalizeRequiredText(body.cpf, "CPF"),
    rg: normalizeOptionalText(body.rg),
    data_nascimento: normalizeOptionalText(body.data_nascimento),
    email: normalizeOptionalText(body.email),
    telefone: normalizeOptionalText(body.telefone),
    cep: normalizeOptionalText(body.cep),
    endereco: normalizeOptionalText(body.endereco),
    numero: normalizeOptionalText(body.numero),
    complemento: normalizeOptionalText(body.complemento),
    bairro: normalizeOptionalText(body.bairro),
    cidade: normalizeOptionalText(body.cidade),
    estado: normalizeOptionalText(body.estado),
    disponibilidade: normalizeOptionalText(body.disponibilidade),
  } satisfies Record<EditableDbKey, string | null>;
}

function parseAction(value: unknown): StatusAction | null {
  if (
    value === "approve" ||
    value === "approve_with_access" ||
    value === "reject"
  ) {
    return value;
  }

  return null;
}

function normalizeCandidaturaStatusMessage(status: VoluntariadoCandidaturaStatus) {
  if (status === "aprovado") return "aprovada";
  if (status === "rejeitado") return "rejeitada";
  return "pendente";
}

function normalizeLinkedAccess(row: AdminUserRow | null): LinkedAccessInfo | null {
  if (!row?.id) {
    return null;
  }

  return {
    userId: row.id,
    email: row.email ?? null,
    nome: row.nome ?? null,
    role: row.role ?? null,
    active: row.ativo !== false,
  };
}

function normalizeNeed(row: NecessidadeRow): NeedState | null {
  const value = Array.isArray(row) ? row[0] : row;

  if (!value?.id) {
    return null;
  }

  return {
    id: Number(value.id),
    tituloPublico: value.titulo_publico ?? "",
    quantidadeTotal: Number(value.quantidade_total ?? 0),
    quantidadeAprovada: Number(value.quantidade_aprovada ?? 0),
    status: String(value.status ?? "aberta"),
    exibirPublicamente: value.exibir_publicamente !== false,
  };
}

function buildNeedUpdatePayload(need: NeedState, delta: number) {
  const quantidadeAprovada = Math.max(need.quantidadeAprovada + delta, 0);
  const atingiuLimite =
    need.quantidadeTotal > 0 && quantidadeAprovada >= need.quantidadeTotal;

  return {
    quantidade_aprovada: quantidadeAprovada,
    status: atingiuLimite ? "fechada" : "aberta",
    exibir_publicamente: !atingiuLimite,
  };
}

function buildLinkedAccessAudit(
  linkedAccess: LinkedAccessInfo,
  previousAudit: VoluntariadoLinkedAccessAudit | null,
  now: string
): VoluntariadoLinkedAccessAudit {
  return {
    userId: linkedAccess.userId,
    email: linkedAccess.email,
    role: linkedAccess.role,
    ativo: linkedAccess.active,
    linkedAt: previousAudit?.linkedAt ?? now,
    lastSyncedAt: now,
  };
}

function buildStatusChangeNote(
  action: StatusAction,
  accessBefore: boolean | null,
  accessAfter: boolean | null
) {
  if (action === "approve_with_access") {
    return "Acesso criado durante a aprovação.";
  }

  if (action === "approve" && accessBefore === false && accessAfter === true) {
    return "Acesso reativado automaticamente.";
  }

  if (action === "reject" && accessBefore === true && accessAfter === false) {
    return "Acesso bloqueado automaticamente.";
  }

  return null;
}

function buildStatusResponseMessage(
  nextStatus: VoluntariadoCandidaturaStatus,
  accessBefore: boolean | null,
  accessAfter: boolean | null,
  createdAccess: boolean
) {
  if (createdAccess) {
    return "Candidatura aprovada e acesso criado com sucesso.";
  }

  if (nextStatus === "aprovado" && accessBefore === false && accessAfter === true) {
    return "Candidatura aprovada e acesso reativado.";
  }

  if (nextStatus === "rejeitado" && accessBefore === true && accessAfter === false) {
    return "Candidatura rejeitada e acesso bloqueado.";
  }

  return `Candidatura ${normalizeCandidaturaStatusMessage(nextStatus)} com sucesso.`;
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

async function fetchCandidaturaDetail(
  supabaseAdmin: AdminSupabaseClient,
  candidaturaId: number
) {
  const { data, error } = await supabaseAdmin
    .from("candidaturas_voluntariado")
    .select(DETAIL_SELECT_FIELDS)
    .eq("id", candidaturaId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as CandidaturaDetailRow | null) ?? null;
}

async function findLinkedAdminUser(
  supabaseAdmin: AdminSupabaseClient,
  email: string | null,
  auditLinkedAccess: VoluntariadoLinkedAccessAudit | null
) {
  const auditUserId = normalizeOptionalText(auditLinkedAccess?.userId);

  if (auditUserId) {
    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, nome, role, ativo")
      .eq("id", auditUserId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const normalized = normalizeLinkedAccess(data as AdminUserRow | null);

    if (normalized) {
      return normalized;
    }
  }

  const candidateEmails = Array.from(
    new Set(
      [normalizeOptionalText(email), normalizeOptionalText(auditLinkedAccess?.email)].filter(
        Boolean
      )
    )
  ) as string[];

  for (const candidateEmail of candidateEmails) {
    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, nome, role, ativo")
      .ilike("email", candidateEmail)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const normalized = normalizeLinkedAccess(data as AdminUserRow | null);

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

async function setLinkedAccessActiveState(
  supabaseAdmin: AdminSupabaseClient,
  userId: string,
  active: boolean
) {
  const { error } = await supabaseAdmin
    .from("admin_users")
    .update({ ativo: active })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

async function createLinkedAccess(
  supabaseAdmin: AdminSupabaseClient,
  actorUser: { id: string; email?: string | null },
  candidatura: CandidaturaDetailRow,
  email: string,
  password: string,
  role: string
) {
  const normalizedRole = normalizeRole(role);

  if (!["admin", "professor"].includes(normalizedRole)) {
    throw new Error("Perfil inválido para criação de acesso.");
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { app_role: normalizedRole },
    user_metadata: { nome: candidatura.nome_completo ?? null },
  });

  if (error || !data.user) {
    throw new Error(error?.message || "Erro ao criar usuário no Auth.");
  }

  const { error: insertError } = await supabaseAdmin
    .from("admin_users")
    .upsert(
      {
        id: data.user.id,
        email,
        nome: candidatura.nome_completo ?? null,
        role: normalizedRole,
        ativo: true,
        created_by_user_id: actorUser.id,
        created_by_user_email: actorUser.email ?? null,
      },
      { onConflict: "id" }
    );

  if (insertError) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    throw new Error(insertError.message);
  }

  return {
    createdUserId: data.user.id,
    linkedAccess: {
      userId: data.user.id,
      email,
      nome: candidatura.nome_completo ?? null,
      role: normalizedRole,
      active: true,
    } satisfies LinkedAccessInfo,
  };
}

async function rollbackCreatedAccess(
  supabaseAdmin: AdminSupabaseClient,
  userId: string | null
) {
  if (!userId) {
    return;
  }

  try {
    await supabaseAdmin.auth.admin.deleteUser(userId);
  } catch (error) {
    console.error("voluntariado-candidatura/rollbackCreatedAccess", error);
  }

  try {
    await supabaseAdmin.from("admin_users").delete().eq("id", userId);
  } catch (error) {
    console.error("voluntariado-candidatura/rollbackCreatedAccess/adminUsers", error);
  }
}

async function rollbackLinkedAccessState(
  supabaseAdmin: AdminSupabaseClient,
  linkedAccess: LinkedAccessInfo | null,
  previousActiveState: boolean | null
) {
  if (!linkedAccess || typeof previousActiveState !== "boolean") {
    return;
  }

  try {
    await setLinkedAccessActiveState(
      supabaseAdmin,
      linkedAccess.userId,
      previousActiveState
    );
  } catch (error) {
    console.error("voluntariado-candidatura/rollbackLinkedAccessState", error);
  }
}

async function rollbackNeedState(
  supabaseAdmin: AdminSupabaseClient,
  need: NeedState | null
) {
  if (!need) {
    return;
  }

  try {
    await supabaseAdmin
      .from("necessidades_voluntariado")
      .update({
        quantidade_aprovada: need.quantidadeAprovada,
        status: need.status,
        exibir_publicamente: need.exibirPublicamente,
      })
      .eq("id", need.id);
  } catch (error) {
    console.error("voluntariado-candidatura/rollbackNeedState", error);
  }
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const candidaturaId = Number(id);

    if (!Number.isInteger(candidaturaId) || candidaturaId <= 0) {
      return NextResponse.json(
        { success: false, message: "Candidatura inválida." },
        { status: 400 }
      );
    }

    const context = await getSupabaseContext();

    if (context instanceof NextResponse) {
      return context;
    }

    const { supabaseAdmin } = context;
    const candidatura = await fetchCandidaturaDetail(supabaseAdmin, candidaturaId);

    if (!candidatura) {
      return NextResponse.json(
        { success: false, message: "Candidatura não encontrada." },
        { status: 404 }
      );
    }

    const parsedAudit = parseVoluntariadoAudit(candidatura.observacoes);
    const linkedAccess = await findLinkedAdminUser(
      supabaseAdmin,
      candidatura.email ?? null,
      parsedAudit.audit?.linkedAccess ?? null
    );

    return NextResponse.json({
      success: true,
      candidatura,
      linkedAccess,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
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
        { success: false, message: "Candidatura inválida." },
        { status: 400 }
      );
    }

    const context = await getSupabaseContext();

    if (context instanceof NextResponse) {
      return context;
    }

    const { currentUser, supabaseAdmin } = context;
    const rawBody = await req.json();

    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
      return NextResponse.json(
        { success: false, message: "Payload inválido." },
        { status: 400 }
      );
    }

    const updatePayload = buildUpdatePayload(rawBody as Record<string, unknown>);

    const { data: existingRaw, error: existingError } = await supabaseAdmin
      .from("candidaturas_voluntariado")
      .select(SELECT_FIELDS)
      .eq("id", candidaturaId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { success: false, message: existingError.message },
        { status: 500 }
      );
    }

    const existing = existingRaw as ExistingCandidaturaRecord | null;

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Candidatura não encontrada." },
        { status: 404 }
      );
    }

    const changes = EDITABLE_FIELDS.map((field) => {
      const previousValue = normalizeOptionalText(existing[field.dbKey]);
      const nextValue = updatePayload[field.dbKey];

      if (previousValue === nextValue) {
        return null;
      }

      return {
        field: field.auditField,
        label: VOLUNTARIADO_EDITABLE_FIELD_LABELS[field.auditField],
        previousValue,
        nextValue,
      };
    }).filter((change): change is CandidateFieldChange => Boolean(change));

    if (!changes.length) {
      return NextResponse.json({
        success: true,
        updated: false,
        message: "Nenhuma alteração detectada.",
      });
    }

    const parsedAudit = parseVoluntariadoAudit(existing.observacoes);

    if (!parsedAudit.audit) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Não foi possível registrar a trilha de alterações porque a auditoria original da candidatura não foi encontrada.",
        },
        { status: 409 }
      );
    }

    const updatedAudit = {
      ...parsedAudit.audit,
      changeHistory: [
        ...(parsedAudit.audit.changeHistory ?? []),
        {
          changedAt: new Date().toISOString(),
          actorUserId: currentUser.id,
          actorEmail: currentUser.email ?? null,
          changes,
        },
      ],
    };

    const { error: updateError } = await supabaseAdmin
      .from("candidaturas_voluntariado")
      .update({
        ...updatePayload,
        observacoes: serializeVoluntariadoAudit(updatedAudit),
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
      message: "Candidatura atualizada com histórico registrado.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const candidaturaId = Number(id);

    if (!Number.isInteger(candidaturaId) || candidaturaId <= 0) {
      return NextResponse.json(
        { success: false, message: "Candidatura inválida." },
        { status: 400 }
      );
    }

    const context = await getSupabaseContext();

    if (context instanceof NextResponse) {
      return context;
    }

    const { currentUser, supabaseAdmin } = context;
    const rawBody = (await req.json().catch(() => null)) as StatusActionPayload | null;

    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
      return NextResponse.json(
        { success: false, message: "Payload inválido." },
        { status: 400 }
      );
    }

    const action = parseAction(rawBody.action);

    if (!action) {
      return NextResponse.json(
        { success: false, message: "Ação de status inválida." },
        { status: 400 }
      );
    }

    const candidatura = await fetchCandidaturaDetail(supabaseAdmin, candidaturaId);

    if (!candidatura) {
      return NextResponse.json(
        { success: false, message: "Candidatura não encontrada." },
        { status: 404 }
      );
    }

    const parsedAudit = parseVoluntariadoAudit(candidatura.observacoes);
    const currentStatus = normalizeVoluntariadoCandidaturaStatus(candidatura.status);
    const nextStatus: VoluntariadoCandidaturaStatus =
      action === "reject" ? "rejeitado" : "aprovado";
    const need = normalizeNeed(candidatura.necessidade);
    const linkedAccess = await findLinkedAdminUser(
      supabaseAdmin,
      candidatura.email ?? null,
      parsedAudit.audit?.linkedAccess ?? null
    );
    const accessBefore = linkedAccess?.active ?? null;
    const statusDelta =
      currentStatus === "aprovado" && nextStatus !== "aprovado"
        ? -1
        : currentStatus !== "aprovado" && nextStatus === "aprovado"
        ? 1
        : 0;

    if (nextStatus === "aprovado" && statusDelta > 0) {
      if (!need) {
        return NextResponse.json(
          { success: false, message: "Necessidade vinculada não encontrada." },
          { status: 409 }
        );
      }

      if (need.status !== "aberta") {
        return NextResponse.json(
          {
            success: false,
            message: "Não é possível aprovar porque a necessidade está fechada.",
          },
          { status: 409 }
        );
      }

      if (need.quantidadeTotal - need.quantidadeAprovada <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Não há mais vagas disponíveis para esta necessidade.",
          },
          { status: 409 }
        );
      }
    }

    if (action === "approve_with_access" && linkedAccess) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Este voluntário já possui um acesso vinculado. Use apenas a aprovação/reprovação para reativar ou bloquear o acesso existente.",
        },
        { status: 409 }
      );
    }

    const accessEmail = normalizeOptionalText(rawBody.email) ?? candidatura.email ?? null;
    const accessPassword = normalizeOptionalText(rawBody.password);
    const accessRole = normalizeRole(rawBody.role ?? "professor") || "professor";

    if (action === "approve_with_access") {
      if (!accessEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Informe um e-mail para criar o acesso deste voluntário.",
          },
          { status: 400 }
        );
      }

      if (!accessPassword) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Informe uma senha provisória para criar o acesso deste voluntário.",
          },
          { status: 400 }
        );
      }

      if (!["admin", "professor"].includes(accessRole)) {
        return NextResponse.json(
          { success: false, message: "Perfil inválido para criação de acesso." },
          { status: 400 }
        );
      }
    }

    const accessNeedsStateChange =
      (action === "approve" && linkedAccess && linkedAccess.active === false) ||
      (action === "reject" && linkedAccess && linkedAccess.active === true);
    const noStatusChange = currentStatus === nextStatus;
    const noActionNeeded =
      noStatusChange && !accessNeedsStateChange && action !== "approve_with_access";

    if (noActionNeeded) {
      return NextResponse.json({
        success: true,
        updated: false,
        message: `A candidatura já está ${normalizeCandidaturaStatusMessage(nextStatus)}.`,
        linkedAccess,
      });
    }

    let workingLinkedAccess = linkedAccess;
    let createdUserId: string | null = null;
    let accessWasMutated = false;

    if (action === "approve_with_access" && accessEmail && accessPassword) {
      const creation = await createLinkedAccess(
        supabaseAdmin,
        currentUser,
        candidatura,
        accessEmail,
        accessPassword,
        accessRole
      );

      workingLinkedAccess = creation.linkedAccess;
      createdUserId = creation.createdUserId;
      accessWasMutated = true;
    } else if (action === "approve" && linkedAccess && linkedAccess.active === false) {
      await setLinkedAccessActiveState(supabaseAdmin, linkedAccess.userId, true);
      workingLinkedAccess = { ...linkedAccess, active: true };
      accessWasMutated = true;
    } else if (action === "reject" && linkedAccess && linkedAccess.active === true) {
      await setLinkedAccessActiveState(supabaseAdmin, linkedAccess.userId, false);
      workingLinkedAccess = { ...linkedAccess, active: false };
      accessWasMutated = true;
    }

    const nextNeedPayload =
      need && statusDelta !== 0 ? buildNeedUpdatePayload(need, statusDelta) : null;

    if (need && nextNeedPayload) {
      const { error: needError } = await supabaseAdmin
        .from("necessidades_voluntariado")
        .update(nextNeedPayload)
        .eq("id", need.id);

      if (needError) {
        if (createdUserId) {
          await rollbackCreatedAccess(supabaseAdmin, createdUserId);
        } else if (accessWasMutated) {
          await rollbackLinkedAccessState(supabaseAdmin, linkedAccess, accessBefore);
        }

        return NextResponse.json(
          { success: false, message: needError.message },
          { status: 500 }
        );
      }
    }

    const now = new Date().toISOString();
    const accessAfter = workingLinkedAccess?.active ?? accessBefore;
    const statusNote = buildStatusChangeNote(action, accessBefore, accessAfter);
    const nextAudit = parsedAudit.audit
      ? {
          ...parsedAudit.audit,
          linkedAccess: workingLinkedAccess
            ? buildLinkedAccessAudit(
                workingLinkedAccess,
                parsedAudit.audit.linkedAccess ?? null,
                now
              )
            : parsedAudit.audit.linkedAccess ?? null,
          statusHistory: [
            ...(parsedAudit.audit.statusHistory ?? []),
            {
              changedAt: now,
              actorUserId: currentUser.id,
              actorEmail: currentUser.email ?? null,
              previousStatus: currentStatus,
              nextStatus,
              accessUserId: workingLinkedAccess?.userId ?? null,
              accessEmail: workingLinkedAccess?.email ?? null,
              accessRole: workingLinkedAccess?.role ?? null,
              accessWasActive: accessBefore,
              accessIsActive: accessAfter,
              note: statusNote,
            },
          ],
        }
      : null;

    const candidaturaUpdatePayload: Record<string, unknown> = {};

    if (currentStatus !== nextStatus) {
      candidaturaUpdatePayload.status = nextStatus;
    }

    if (nextAudit) {
      candidaturaUpdatePayload.observacoes = serializeVoluntariadoAudit(nextAudit);
    }

    if (Object.keys(candidaturaUpdatePayload).length) {
      const { error: candidaturaError } = await supabaseAdmin
        .from("candidaturas_voluntariado")
        .update(candidaturaUpdatePayload)
        .eq("id", candidatura.id);

      if (candidaturaError) {
        if (need) {
          await rollbackNeedState(supabaseAdmin, need);
        }

        if (createdUserId) {
          await rollbackCreatedAccess(supabaseAdmin, createdUserId);
        } else if (accessWasMutated) {
          await rollbackLinkedAccessState(supabaseAdmin, linkedAccess, accessBefore);
        }

        return NextResponse.json(
          { success: false, message: candidaturaError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      updated: true,
      message: buildStatusResponseMessage(
        nextStatus,
        accessBefore,
        accessAfter,
        action === "approve_with_access"
      ),
      linkedAccess: workingLinkedAccess,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
