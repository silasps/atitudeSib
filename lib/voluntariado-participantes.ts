import {
  normalizeVoluntariadoCandidaturaStatus,
  parseVoluntariadoAudit,
  resolveVoluntariadoParticipantState,
  type ResolvedVoluntariadoParticipant,
  type VoluntariadoParticipantChangeLogEntry,
} from "@/lib/candidatura-voluntariado-audit";

type ParticipanteNecessidadeRow =
  | {
      id: number | string | null;
      titulo_publico: string | null;
    }
  | Array<{
      id: number | string | null;
      titulo_publico: string | null;
    }>
  | null;

export type VoluntariadoParticipanteCandidateRow = {
  id: number | string | null;
  nome_completo: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  created_at: string | null;
  status: string | null;
  observacoes: string | null;
  necessidade: ParticipanteNecessidadeRow;
};

export type VoluntariadoParticipanteLinkedAccess = {
  userId: string | null;
  email: string | null;
  role: string | null;
  active: boolean;
  source: "admin_user" | "audit";
} | null;

export type VoluntariadoParticipanteListItem = {
  id: number;
  nomeCompleto: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  createdAt: string | null;
  candidaturaStatus: string;
  necessidade: {
    id: number;
    tituloPublico: string;
  } | null;
  participant: ResolvedVoluntariadoParticipant;
  linkedAccess: VoluntariadoParticipanteLinkedAccess;
  participantHistory: VoluntariadoParticipantChangeLogEntry[];
};

function normalizeText(value?: string | null) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export function normalizeEmail(value?: string | null) {
  const normalized = normalizeText(value);
  return normalized ? normalized.toLowerCase() : null;
}

export function normalizeParticipanteLinkedAccess(
  access: VoluntariadoParticipanteLinkedAccess
) {
  if (!access) {
    return null;
  }

  return {
    ...access,
    userId: normalizeText(access.userId),
    email: normalizeText(access.email),
    role: normalizeText(access.role),
  } satisfies VoluntariadoParticipanteLinkedAccess;
}

export function resolveParticipanteAccessState(
  candidateEmail: string | null,
  auditLinkedAccess:
    | {
        userId: string;
        email: string | null;
        role: string | null;
        ativo: boolean;
      }
    | null
    | undefined,
  adminUsersById: Map<
    string,
    { id: string; email: string | null; role: string | null; ativo: boolean | null }
  >,
  adminUsersByEmail: Map<
    string,
    { id: string; email: string | null; role: string | null; ativo: boolean | null }
  >
): VoluntariadoParticipanteLinkedAccess {
  const auditUserId = normalizeText(auditLinkedAccess?.userId);

  if (auditUserId && adminUsersById.has(auditUserId)) {
    const row = adminUsersById.get(auditUserId)!;

    return {
      userId: row.id,
      email: row.email ?? null,
      role: row.role ?? null,
      active: row.ativo !== false,
      source: "admin_user",
    };
  }

  const candidateEmails = Array.from(
    new Set(
      [normalizeEmail(candidateEmail), normalizeEmail(auditLinkedAccess?.email)].filter(
        Boolean
      )
    )
  ) as string[];

  for (const email of candidateEmails) {
    const row = adminUsersByEmail.get(email);

    if (!row) {
      continue;
    }

    return {
      userId: row.id,
      email: row.email ?? null,
      role: row.role ?? null,
      active: row.ativo !== false,
      source: "admin_user",
    };
  }

  if (auditLinkedAccess?.userId || auditLinkedAccess?.email || auditLinkedAccess?.role) {
    return {
      userId: normalizeText(auditLinkedAccess.userId),
      email: normalizeText(auditLinkedAccess.email),
      role: normalizeText(auditLinkedAccess.role),
      active: auditLinkedAccess.ativo !== false,
      source: "audit",
    };
  }

  return null;
}

export function buildVoluntariadoParticipanteListItem(
  row: VoluntariadoParticipanteCandidateRow,
  linkedAccess: VoluntariadoParticipanteLinkedAccess
): VoluntariadoParticipanteListItem {
  const parsedAudit = parseVoluntariadoAudit(row.observacoes);
  const necessidadeValue = Array.isArray(row.necessidade)
    ? row.necessidade[0]
    : row.necessidade;

  return {
    id: Number(row.id),
    nomeCompleto: row.nome_completo ?? "",
    email: normalizeText(row.email),
    telefone: normalizeText(row.telefone),
    cidade: normalizeText(row.cidade),
    estado: normalizeText(row.estado),
    createdAt: normalizeText(row.created_at),
    candidaturaStatus: normalizeVoluntariadoCandidaturaStatus(row.status),
    necessidade: necessidadeValue?.id
      ? {
          id: Number(necessidadeValue.id),
          tituloPublico: necessidadeValue.titulo_publico ?? "",
        }
      : null,
    participant: resolveVoluntariadoParticipantState({
      audit: parsedAudit.audit,
      candidaturaStatus: normalizeVoluntariadoCandidaturaStatus(row.status),
      candidaturaCreatedAt: row.created_at,
    }),
    linkedAccess: normalizeParticipanteLinkedAccess(linkedAccess),
    participantHistory: [...(parsedAudit.audit?.participantHistory ?? [])].reverse(),
  };
}

export function sortVoluntariadoParticipantes(
  items: VoluntariadoParticipanteListItem[]
) {
  return [...items].sort((left, right) => {
    const leftJoinedAt = left.participant.joinedAt
      ? Date.parse(left.participant.joinedAt)
      : 0;
    const rightJoinedAt = right.participant.joinedAt
      ? Date.parse(right.participant.joinedAt)
      : 0;

    if (leftJoinedAt !== rightJoinedAt) {
      return rightJoinedAt - leftJoinedAt;
    }

    return left.nomeCompleto.localeCompare(right.nomeCompleto, "pt-BR");
  });
}
