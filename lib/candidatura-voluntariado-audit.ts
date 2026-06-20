const AUDIT_MARKER = "__ATITUDE_CANDIDATURA_AUDIT_V2__";

export const VOLUNTARIADO_DOCUMENT_VERSIONS = {
  termoAdesao: "termo-adesao-v2-2026-04-08",
  lgpdPrivacidade: "lgpd-privacidade-v1-2026-04-08",
  usoImagem: "uso-imagem-v1-2026-04-08",
} as const;

export type ConsentDecision = "accepted" | "declined";

export type VoluntariadoAuditArtifactKey = "dossie_html" | "auditoria_json";

export const VOLUNTARIADO_CANDIDATURA_STATUSES = [
  "pendente",
  "aprovado",
  "rejeitado",
] as const;

export type VoluntariadoCandidaturaStatus =
  (typeof VOLUNTARIADO_CANDIDATURA_STATUSES)[number];

export const VOLUNTARIADO_EDITABLE_FIELDS = [
  "nomeCompleto",
  "cpf",
  "rg",
  "dataNascimento",
  "email",
  "telefone",
  "cep",
  "endereco",
  "numero",
  "complemento",
  "bairro",
  "cidade",
  "estado",
  "disponibilidade",
] as const;

export type VoluntariadoEditableField =
  (typeof VOLUNTARIADO_EDITABLE_FIELDS)[number];

export const VOLUNTARIADO_EDITABLE_FIELD_LABELS: Record<
  VoluntariadoEditableField,
  string
> = {
  nomeCompleto: "Nome completo",
  cpf: "CPF",
  rg: "RG",
  dataNascimento: "Data de nascimento",
  email: "E-mail",
  telefone: "Telefone",
  cep: "CEP",
  endereco: "Endereco",
  numero: "Numero",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  estado: "Estado",
  disponibilidade: "Disponibilidade",
};

export type VoluntariadoConsentDocument = {
  key: "termo_adesao" | "lgpd_privacidade" | "uso_imagem";
  title: string;
  version: string;
  required: boolean;
  decision: ConsentDecision;
  decidedAt: string | null;
};

export type VoluntariadoCandidateSnapshot = {
  necessidadeId: number;
  necessidadeTitulo: string;
  nomeCompleto: string;
  cpf: string;
  rg: string | null;
  dataNascimento: string | null;
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
};

export type VoluntariadoSignatureAudit = {
  signedName: string;
  signedCpf: string;
  signedAt: string;
  signatureMethod: "typed_name_and_drawn_signature";
  signatureDataUrl: string | null;
  consentHash: string;
  ipAddress: string | null;
  userAgent: string | null;
  acceptLanguage: string | null;
  timezone: string | null;
};

export type VoluntariadoAuditArtifact = {
  key: VoluntariadoAuditArtifactKey;
  title: string;
  bucket: string;
  path: string;
  fileName: string;
  contentType: string;
  createdAt: string | null;
};

export type VoluntariadoAdminFieldChange = {
  field: VoluntariadoEditableField;
  label: string;
  previousValue: string | null;
  nextValue: string | null;
};

export type VoluntariadoAdminChangeLogEntry = {
  changedAt: string;
  actorUserId: string;
  actorEmail: string | null;
  changes: VoluntariadoAdminFieldChange[];
};

export type VoluntariadoLinkedAccessAudit = {
  userId: string;
  email: string | null;
  role: string | null;
  ativo: boolean;
  linkedAt: string;
  lastSyncedAt: string | null;
};

export const VOLUNTARIADO_PARTICIPANT_STATUSES = ["ativo", "inativo"] as const;

export type VoluntariadoParticipantStatus =
  (typeof VOLUNTARIADO_PARTICIPANT_STATUSES)[number];

export type VoluntariadoParticipantAudit = {
  status: VoluntariadoParticipantStatus;
  joinedAt: string | null;
  leftAt: string | null;
  internalNotes: string | null;
  lastUpdatedAt: string | null;
};

export type VoluntariadoParticipantChangeLogEntry = {
  changedAt: string;
  actorUserId: string;
  actorEmail: string | null;
  previousStatus: VoluntariadoParticipantStatus | null;
  nextStatus: VoluntariadoParticipantStatus;
  previousJoinedAt: string | null;
  nextJoinedAt: string | null;
  previousLeftAt: string | null;
  nextLeftAt: string | null;
  previousInternalNotes: string | null;
  nextInternalNotes: string | null;
};

export type VoluntariadoStatusChangeLogEntry = {
  changedAt: string;
  actorUserId: string;
  actorEmail: string | null;
  previousStatus: VoluntariadoCandidaturaStatus;
  nextStatus: VoluntariadoCandidaturaStatus;
  accessUserId: string | null;
  accessEmail: string | null;
  accessRole: string | null;
  accessWasActive: boolean | null;
  accessIsActive: boolean | null;
  note: string | null;
};

export type VoluntariadoCandidaturaAudit = {
  observacaoLivre: string | null;
  documents: VoluntariadoConsentDocument[];
  signature: VoluntariadoSignatureAudit;
  candidateSnapshot: VoluntariadoCandidateSnapshot;
  artifacts?: VoluntariadoAuditArtifact[];
  changeHistory?: VoluntariadoAdminChangeLogEntry[];
  linkedAccess?: VoluntariadoLinkedAccessAudit | null;
  participant?: VoluntariadoParticipantAudit | null;
  participantHistory?: VoluntariadoParticipantChangeLogEntry[];
  statusHistory?: VoluntariadoStatusChangeLogEntry[];
};

function normalizeText(value?: string | null) {
  return String(value ?? "").trim();
}

function isConsentDecision(value: unknown): value is ConsentDecision {
  return value === "accepted" || value === "declined";
}

function isArtifactKey(value: unknown): value is VoluntariadoAuditArtifactKey {
  return value === "dossie_html" || value === "auditoria_json";
}

function isEditableField(value: unknown): value is VoluntariadoEditableField {
  return VOLUNTARIADO_EDITABLE_FIELDS.some((field) => field === value);
}

export function normalizeVoluntariadoParticipantStatus(
  value: unknown
): VoluntariadoParticipantStatus {
  return value === "inativo" ? "inativo" : "ativo";
}

export function getVoluntariadoParticipantStatusLabel(
  status: VoluntariadoParticipantStatus
) {
  return status === "inativo" ? "Inativo" : "Ativo";
}

export function normalizeVoluntariadoCandidaturaStatus(
  value: unknown
): VoluntariadoCandidaturaStatus {
  const normalized = normalizeText(String(value ?? "")).toLowerCase();

  if (normalized === "aprovado" || normalized === "rejeitado") {
    return normalized;
  }

  return "pendente";
}

export function getVoluntariadoCandidaturaStatusLabel(
  status: VoluntariadoCandidaturaStatus
) {
  if (status === "aprovado") {
    return "Aprovada";
  }

  if (status === "rejeitado") {
    return "Rejeitada";
  }

  return "Pendente";
}

export function serializeVoluntariadoAudit(
  audit: VoluntariadoCandidaturaAudit
) {
  return `${AUDIT_MARKER}${JSON.stringify(audit)}`;
}

export function parseVoluntariadoAudit(rawObservacoes?: string | null): {
  observacaoLivre: string | null;
  audit: VoluntariadoCandidaturaAudit | null;
} {
  const raw = String(rawObservacoes ?? "");

  if (!raw) {
    return {
      observacaoLivre: null,
      audit: null,
    };
  }

  if (!raw.startsWith(AUDIT_MARKER)) {
    return {
      observacaoLivre: raw.trim() || null,
      audit: null,
    };
  }

  try {
    const parsed = JSON.parse(
      raw.slice(AUDIT_MARKER.length)
    ) as Partial<VoluntariadoCandidaturaAudit>;

    const documents = Array.isArray(parsed.documents)
      ? parsed.documents
          .map((item) => {
            const key = String(item?.key ?? "") as VoluntariadoConsentDocument["key"];
            const decision = isConsentDecision(item?.decision)
              ? item.decision
              : "declined";

            if (
              key !== "termo_adesao" &&
              key !== "lgpd_privacidade" &&
              key !== "uso_imagem"
            ) {
              return null;
            }

            return {
              key,
              title: normalizeText(item?.title) || key,
              version: normalizeText(item?.version) || "não informado",
              required: item?.required !== false,
              decision,
              decidedAt: normalizeText(item?.decidedAt) || null,
            };
          })
          .filter((item): item is VoluntariadoConsentDocument => Boolean(item))
      : [];

    const artifacts = Array.isArray(parsed.artifacts)
      ? parsed.artifacts
          .map((item) => {
            const key = String(item?.key ?? "");

            if (!isArtifactKey(key)) {
              return null;
            }

            const bucket = normalizeText(item?.bucket);
            const path = normalizeText(item?.path);
            const fileName = normalizeText(item?.fileName);

            if (!bucket || !path || !fileName) {
              return null;
            }

            return {
              key,
              title: normalizeText(item?.title) || key,
              bucket,
              path,
              fileName,
              contentType:
                normalizeText(item?.contentType) || "application/octet-stream",
              createdAt: normalizeText(item?.createdAt) || null,
            };
          })
          .filter((item): item is VoluntariadoAuditArtifact => Boolean(item))
      : [];

    const changeHistory = Array.isArray(parsed.changeHistory)
      ? parsed.changeHistory
          .map((item) => {
            const changedAt = normalizeText(item?.changedAt);
            const actorUserId = normalizeText(item?.actorUserId);

            const changes = Array.isArray(item?.changes)
              ? item.changes
                  .map((change) => {
                    const field = String(change?.field ?? "");

                    if (!isEditableField(field)) {
                      return null;
                    }

                    return {
                      field,
                      label:
                        normalizeText(change?.label) ||
                        VOLUNTARIADO_EDITABLE_FIELD_LABELS[field],
                      previousValue:
                        normalizeText(change?.previousValue) || null,
                      nextValue: normalizeText(change?.nextValue) || null,
                    };
                  })
                  .filter(
                    (
                      change
                    ): change is VoluntariadoAdminFieldChange => Boolean(change)
                  )
              : [];

            if (!changedAt || !actorUserId || !changes.length) {
              return null;
            }

            return {
              changedAt,
              actorUserId,
              actorEmail: normalizeText(item?.actorEmail) || null,
              changes,
            };
          })
          .filter(
            (
              item
            ): item is VoluntariadoAdminChangeLogEntry => Boolean(item)
          )
      : [];

    const linkedAccess = parsed.linkedAccess
      ? {
          userId: normalizeText(parsed.linkedAccess.userId),
          email: normalizeText(parsed.linkedAccess.email) || null,
          role: normalizeText(parsed.linkedAccess.role) || null,
          ativo: parsed.linkedAccess.ativo !== false,
          linkedAt: normalizeText(parsed.linkedAccess.linkedAt),
          lastSyncedAt:
            normalizeText(parsed.linkedAccess.lastSyncedAt) || null,
        }
      : null;

    const participant = parsed.participant
      ? {
          status: normalizeVoluntariadoParticipantStatus(
            parsed.participant.status
          ),
          joinedAt: normalizeText(parsed.participant.joinedAt) || null,
          leftAt: normalizeText(parsed.participant.leftAt) || null,
          internalNotes:
            normalizeText(parsed.participant.internalNotes) || null,
          lastUpdatedAt:
            normalizeText(parsed.participant.lastUpdatedAt) || null,
        }
      : null;

    const participantHistory = Array.isArray(parsed.participantHistory)
      ? parsed.participantHistory
          .map((item) => {
            const changedAt = normalizeText(item?.changedAt);
            const actorUserId = normalizeText(item?.actorUserId);

            if (!changedAt || !actorUserId) {
              return null;
            }

            return {
              changedAt,
              actorUserId,
              actorEmail: normalizeText(item?.actorEmail) || null,
              previousStatus:
                item?.previousStatus == null
                  ? null
                  : normalizeVoluntariadoParticipantStatus(
                      item.previousStatus
                    ),
              nextStatus: normalizeVoluntariadoParticipantStatus(
                item?.nextStatus
              ),
              previousJoinedAt:
                normalizeText(item?.previousJoinedAt) || null,
              nextJoinedAt: normalizeText(item?.nextJoinedAt) || null,
              previousLeftAt: normalizeText(item?.previousLeftAt) || null,
              nextLeftAt: normalizeText(item?.nextLeftAt) || null,
              previousInternalNotes:
                normalizeText(item?.previousInternalNotes) || null,
              nextInternalNotes:
                normalizeText(item?.nextInternalNotes) || null,
            };
          })
          .filter(
            (
              item
            ): item is VoluntariadoParticipantChangeLogEntry => Boolean(item)
          )
      : [];

    const statusHistory = Array.isArray(parsed.statusHistory)
      ? parsed.statusHistory
          .map((item) => {
            const changedAt = normalizeText(item?.changedAt);
            const actorUserId = normalizeText(item?.actorUserId);

            if (!changedAt || !actorUserId) {
              return null;
            }

            return {
              changedAt,
              actorUserId,
              actorEmail: normalizeText(item?.actorEmail) || null,
              previousStatus: normalizeVoluntariadoCandidaturaStatus(
                item?.previousStatus
              ),
              nextStatus: normalizeVoluntariadoCandidaturaStatus(
                item?.nextStatus
              ),
              accessUserId: normalizeText(item?.accessUserId) || null,
              accessEmail: normalizeText(item?.accessEmail) || null,
              accessRole: normalizeText(item?.accessRole) || null,
              accessWasActive:
                typeof item?.accessWasActive === "boolean"
                  ? item.accessWasActive
                  : null,
              accessIsActive:
                typeof item?.accessIsActive === "boolean"
                  ? item.accessIsActive
                  : null,
              note: normalizeText(item?.note) || null,
            };
          })
          .filter(
            (
              item
            ): item is VoluntariadoStatusChangeLogEntry => Boolean(item)
          )
      : [];

    const signature = parsed.signature
      ? {
          signedName: normalizeText(parsed.signature.signedName),
          signedCpf: normalizeText(parsed.signature.signedCpf),
          signedAt: normalizeText(parsed.signature.signedAt),
          signatureMethod: "typed_name_and_drawn_signature" as const,
          signatureDataUrl:
            normalizeText(parsed.signature.signatureDataUrl) || null,
          consentHash: normalizeText(parsed.signature.consentHash),
          ipAddress: normalizeText(parsed.signature.ipAddress) || null,
          userAgent: normalizeText(parsed.signature.userAgent) || null,
          acceptLanguage:
            normalizeText(parsed.signature.acceptLanguage) || null,
          timezone: normalizeText(parsed.signature.timezone) || null,
        }
      : null;

    const snapshot = parsed.candidateSnapshot
      ? {
          necessidadeId: Number(parsed.candidateSnapshot.necessidadeId ?? 0),
          necessidadeTitulo: normalizeText(
            parsed.candidateSnapshot.necessidadeTitulo
          ),
          nomeCompleto: normalizeText(parsed.candidateSnapshot.nomeCompleto),
          cpf: normalizeText(parsed.candidateSnapshot.cpf),
          rg: normalizeText(parsed.candidateSnapshot.rg) || null,
          dataNascimento:
            normalizeText(parsed.candidateSnapshot.dataNascimento) || null,
          email: normalizeText(parsed.candidateSnapshot.email) || null,
          telefone: normalizeText(parsed.candidateSnapshot.telefone) || null,
          cep: normalizeText(parsed.candidateSnapshot.cep) || null,
          endereco: normalizeText(parsed.candidateSnapshot.endereco) || null,
          numero: normalizeText(parsed.candidateSnapshot.numero) || null,
          complemento:
            normalizeText(parsed.candidateSnapshot.complemento) || null,
          bairro: normalizeText(parsed.candidateSnapshot.bairro) || null,
          cidade: normalizeText(parsed.candidateSnapshot.cidade) || null,
          estado: normalizeText(parsed.candidateSnapshot.estado) || null,
          disponibilidade:
            normalizeText(parsed.candidateSnapshot.disponibilidade) || null,
        }
      : null;

    if (!signature || !snapshot) {
      return {
        observacaoLivre:
          normalizeText(parsed.observacaoLivre) || raw.trim() || null,
        audit: null,
      };
    }

    return {
      observacaoLivre: normalizeText(parsed.observacaoLivre) || null,
      audit: {
        observacaoLivre: normalizeText(parsed.observacaoLivre) || null,
        documents,
        signature,
        candidateSnapshot: snapshot,
        artifacts,
        changeHistory,
        linkedAccess:
          linkedAccess && linkedAccess.userId && linkedAccess.linkedAt
            ? linkedAccess
            : null,
        participant,
        participantHistory,
        statusHistory,
      },
    };
  } catch {
    return {
      observacaoLivre: raw.trim() || null,
      audit: null,
    };
  }
}

export function getConsentLabel(decision: ConsentDecision) {
  return decision === "accepted" ? "Aceito" : "Não autorizado";
}

export type ResolvedVoluntariadoParticipant = {
  status: VoluntariadoParticipantStatus;
  joinedAt: string | null;
  leftAt: string | null;
  internalNotes: string | null;
  lastUpdatedAt: string | null;
};

export function resolveVoluntariadoParticipantState(params: {
  audit: VoluntariadoCandidaturaAudit | null;
  candidaturaStatus: VoluntariadoCandidaturaStatus;
  candidaturaCreatedAt?: string | null;
}): ResolvedVoluntariadoParticipant {
  const { audit, candidaturaStatus, candidaturaCreatedAt } = params;
  const participant = audit?.participant ?? null;
  const firstApprovalEntry =
    audit?.statusHistory?.find((entry) => entry.nextStatus === "aprovado") ??
    null;
  const derivedJoinedAt =
    participant?.joinedAt ??
    firstApprovalEntry?.changedAt ??
    (candidaturaStatus === "aprovado"
      ? normalizeText(candidaturaCreatedAt) || null
      : null);
  const resolvedStatus =
    participant?.status ??
    (candidaturaStatus === "aprovado" ? "ativo" : "inativo");

  return {
    status: resolvedStatus,
    joinedAt: derivedJoinedAt,
    leftAt:
      resolvedStatus === "inativo" ? participant?.leftAt ?? null : null,
    internalNotes: participant?.internalNotes ?? null,
    lastUpdatedAt: participant?.lastUpdatedAt ?? null,
  };
}
