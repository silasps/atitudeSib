const CONTENT_MARKER = "__ATITUDE_NECESSIDADE_V2__";

export type NecessidadeRichContent = {
  resumoCurto: string;
  descricaoCompleta: string;
  imagemUrl: string | null;
  imagemAlt: string | null;
  localAtuacao: string | null;
  formatoAtuacao: string | null;
  cargaHoraria: string | null;
  periodo: string | null;
  atividades: string[];
  perfilDesejado: string[];
  diferenciais: string[];
};

export type NecessidadeRichInput = {
  resumoCurto?: string | null;
  descricaoCompleta?: string | null;
  imagemUrl?: string | null;
  imagemAlt?: string | null;
  localAtuacao?: string | null;
  formatoAtuacao?: string | null;
  cargaHoraria?: string | null;
  periodo?: string | null;
  atividades?: string[] | null;
  perfilDesejado?: string[] | null;
  diferenciais?: string[] | null;
};

function normalizeText(value?: string | null) {
  return String(value ?? "").trim();
}

function normalizeList(values?: string[] | null) {
  return (values ?? [])
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function excerptFromText(rawText: string, maxLength = 180) {
  const collapsed = rawText.replace(/\s+/g, " ").trim();

  if (!collapsed) {
    return "";
  }

  if (collapsed.length <= maxLength) {
    return collapsed;
  }

  return `${collapsed.slice(0, maxLength).trimEnd()}...`;
}

function buildDefaultContent(rawDescription?: string | null): NecessidadeRichContent {
  const descricaoCompleta = normalizeText(rawDescription);

  return {
    resumoCurto: excerptFromText(descricaoCompleta),
    descricaoCompleta,
    imagemUrl: null,
    imagemAlt: null,
    localAtuacao: null,
    formatoAtuacao: null,
    cargaHoraria: null,
    periodo: null,
    atividades: [],
    perfilDesejado: [],
    diferenciais: [],
  };
}

export function parseNecessidadeRichContent(
  rawDescription?: string | null
): NecessidadeRichContent {
  const raw = String(rawDescription ?? "");

  if (!raw.startsWith(CONTENT_MARKER)) {
    return buildDefaultContent(rawDescription);
  }

  try {
    const json = JSON.parse(raw.slice(CONTENT_MARKER.length)) as NecessidadeRichInput;
    const descricaoCompleta = normalizeText(json.descricaoCompleta);

    return {
      resumoCurto:
        normalizeText(json.resumoCurto) || excerptFromText(descricaoCompleta),
      descricaoCompleta,
      imagemUrl: normalizeText(json.imagemUrl) || null,
      imagemAlt: normalizeText(json.imagemAlt) || null,
      localAtuacao: normalizeText(json.localAtuacao) || null,
      formatoAtuacao: normalizeText(json.formatoAtuacao) || null,
      cargaHoraria: normalizeText(json.cargaHoraria) || null,
      periodo: normalizeText(json.periodo) || null,
      atividades: normalizeList(json.atividades),
      perfilDesejado: normalizeList(json.perfilDesejado),
      diferenciais: normalizeList(json.diferenciais),
    };
  } catch {
    return buildDefaultContent(rawDescription);
  }
}

export function serializeNecessidadeRichContent(
  content: NecessidadeRichInput
): string {
  const normalized: NecessidadeRichContent = {
    resumoCurto: normalizeText(content.resumoCurto),
    descricaoCompleta: normalizeText(content.descricaoCompleta),
    imagemUrl: normalizeText(content.imagemUrl) || null,
    imagemAlt: normalizeText(content.imagemAlt) || null,
    localAtuacao: normalizeText(content.localAtuacao) || null,
    formatoAtuacao: normalizeText(content.formatoAtuacao) || null,
    cargaHoraria: normalizeText(content.cargaHoraria) || null,
    periodo: normalizeText(content.periodo) || null,
    atividades: normalizeList(content.atividades),
    perfilDesejado: normalizeList(content.perfilDesejado),
    diferenciais: normalizeList(content.diferenciais),
  };

  normalized.resumoCurto =
    normalized.resumoCurto || excerptFromText(normalized.descricaoCompleta);

  return `${CONTENT_MARKER}${JSON.stringify(normalized)}`;
}

export function textAreaToList(value?: string | null) {
  return String(value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function listToTextArea(values?: string[] | null) {
  return normalizeList(values).join("\n");
}

export function getNecessidadeSummary(rawDescription?: string | null) {
  return parseNecessidadeRichContent(rawDescription).resumoCurto;
}

