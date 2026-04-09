const AUDIT_MARKER = "__ATITUDE_CANDIDATURA_AUDIT_V2__";

export const VOLUNTARIADO_DOCUMENT_VERSIONS = {
  termoAdesao: "termo-adesao-v2-2026-04-08",
  lgpdPrivacidade: "lgpd-privacidade-v1-2026-04-08",
  usoImagem: "uso-imagem-v1-2026-04-08",
} as const;

export type ConsentDecision = "accepted" | "declined";

export type VoluntariadoAuditArtifactKey = "dossie_html" | "auditoria_json";

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

export type VoluntariadoCandidaturaAudit = {
  observacaoLivre: string | null;
  documents: VoluntariadoConsentDocument[];
  signature: VoluntariadoSignatureAudit;
  candidateSnapshot: VoluntariadoCandidateSnapshot;
  artifacts?: VoluntariadoAuditArtifact[];
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
