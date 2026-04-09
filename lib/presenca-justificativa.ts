export type PresencaJustificativa = {
  descricao: string;
  documentoUrl: string | null;
  documentoNome: string | null;
  storagePath: string | null;
};

type PresencaJustificativaPayload = {
  tipo: "justificativa_presenca";
  descricao: string;
  documentoUrl?: string | null;
  documentoNome?: string | null;
  storagePath?: string | null;
};

function isPayload(value: unknown): value is PresencaJustificativaPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    payload.tipo === "justificativa_presenca" &&
    typeof payload.descricao === "string"
  );
}

export function parsePresencaJustificativa(
  observacoes?: string | null
): PresencaJustificativa | null {
  const raw = String(observacoes ?? "").trim();

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (isPayload(parsed)) {
      return {
        descricao: parsed.descricao.trim(),
        documentoUrl:
          typeof parsed.documentoUrl === "string" ? parsed.documentoUrl : null,
        documentoNome:
          typeof parsed.documentoNome === "string" ? parsed.documentoNome : null,
        storagePath:
          typeof parsed.storagePath === "string" ? parsed.storagePath : null,
      };
    }
  } catch {
    // Mantem compatibilidade com observacoes antigas em texto puro.
  }

  return {
    descricao: raw,
    documentoUrl: null,
    documentoNome: null,
    storagePath: null,
  };
}

export function serializePresencaJustificativa(
  justificativa: PresencaJustificativa
) {
  return JSON.stringify({
    tipo: "justificativa_presenca",
    descricao: justificativa.descricao.trim(),
    documentoUrl: justificativa.documentoUrl ?? null,
    documentoNome: justificativa.documentoNome ?? null,
    storagePath: justificativa.storagePath ?? null,
  } satisfies PresencaJustificativaPayload);
}
