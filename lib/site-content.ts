export type HeroMediaConfig = {
  galleryImageIds: number[];
  legacyImageUrl: string;
};

export type WorkPostMediaType = "image" | "carousel" | "video";

export type WorkPostDescriptionPosition =
  | "above"
  | "below"
  | "left"
  | "right"
  | "overlay-left"
  | "overlay-right"
  | "overlay-top"
  | "overlay-bottom";

export type SiteWorkMediaItem = {
  kind: "image" | "video";
  url: string;
  storagePath?: string;
  fileName?: string;
};

export type SiteWorkPost = {
  id: string;
  title: string;
  description: string;
  mediaType: WorkPostMediaType;
  descriptionPosition: WorkPostDescriptionPosition;
  mediaItems: SiteWorkMediaItem[];
  createdAt: string;
  updatedAt: string;
};

export type SiteWorkContent = {
  summary: string;
  posts: SiteWorkPost[];
};

export type InstitutionalContent = {
  presentation: string[];
  mission: string;
  vision: string;
  audience: string;
  territory: string;
  foundedLabel: string;
  impactLabel: string;
  activeProjects: string[];
  plannedProjects: string[];
  resourceHighlights: string[];
  boardMembers: string[];
  address: string;
  seoSummary: string;
};

const emptyWorkContent: SiteWorkContent = {
  summary: "",
  posts: [],
};

const INSTITUTIONAL_CONTENT_MARKER = "__ATITUDE_INSTITUTIONAL_V1__";

const emptyInstitutionalContent: InstitutionalContent = {
  presentation: [],
  mission: "",
  vision: "",
  audience: "",
  territory: "",
  foundedLabel: "",
  impactLabel: "",
  activeProjects: [],
  plannedProjects: [],
  resourceHighlights: [],
  boardMembers: [],
  address: "",
  seoSummary: "",
};

export const defaultInstitutionalContent: InstitutionalContent = {
  presentation: [
    "A ATITUDE é uma Organização da Sociedade Civil criada em setembro de 2021, em Almirante Tamandaré, para ampliar oportunidades de desenvolvimento humano por meio da educação, do esporte, da música, do voluntariado e de ações socioassistenciais.",
    "A atuação acontece no bairro Lamenha Grande, conectando crianças, adolescentes, idosos, famílias, educadores e apoiadores em uma rede comunitária de cuidado, aprendizagem e pertencimento.",
  ],
  mission:
    "Promover o ser humano como cidadão, desenvolvendo suas potencialidades por meio da inclusão social, da cidadania e de experiências culturais, artísticas, esportivas, socioeducativas, educacionais e de voluntariado.",
  vision:
    "Ser uma presença comunitária confiável, com projetos que fortalecem autonomia, convívio, acesso a oportunidades e futuro para quem vive em contexto de vulnerabilidade social.",
  audience:
    "Crianças e adolescentes de 3 a 18 anos, além de idosos a partir de 50 anos, em situação de vulnerabilidade e risco social.",
  territory: "Lamenha Grande, Almirante Tamandaré - PR",
  foundedLabel: "Desde setembro de 2021",
  impactLabel:
    "Educação, cultura, esporte, música, acolhimento e voluntariado articulados no mesmo território.",
  activeProjects: [
    "Aulas de Artesanato: encontros semanais com idosos, fortalecendo geração de renda, autonomia e convívio.",
    "Aulas de Pilates: cuidado corporal e melhora da qualidade de vida para idosos em turmas regulares.",
    "Aulas de Balé: formação artística e social para crianças e adolescentes em três faixas etárias.",
    "Aulas de Jiu-Jítsu: disciplina, autoconfiança e convivência saudável para crianças e adolescentes.",
  ],
  plannedProjects: [
    "Aulas de Computação: alfabetização tecnológica e uso consciente dos recursos digitais.",
    "Aulas de Violão e Teoria Musical: desenvolvimento cognitivo, motor e emocional por meio da música.",
  ],
  resourceHighlights: [
    "Equipe socioeducativa com educadores sociais, apoio administrativo e rotina de acompanhamento.",
    "Materiais didáticos, impressão de atividades e insumos pedagógicos para as turmas.",
    "Materiais específicos como quimonos, violão, colchonetes, halteres, tatames e itens de artesanato.",
    "Lanches, alimentação, limpeza e higiene para manter as atividades com continuidade e acolhimento.",
  ],
  boardMembers: [
    "Diretor Presidente: Raimundo Alberto Gonçalves da Silva",
    "Primeira Secretária: Edilsem Cristina Mengarda Figueirôa",
    "Segunda Secretária: Jessica Domingues",
    "Primeiro Tesoureiro: Welliton da Silva Santo",
    "Segunda Tesoureira: Cristiane Ribeiro Martins",
    "Conselho Fiscal: Maria da Penha Silva dos Santos, Reinaldo Vicente Traczynski",
  ],
  address:
    "Rua Vereador Wadislau Bugalski, 3827, Lamenha Grande, Almirante Tamandaré - PR",
  seoSummary:
    "Organização social em Almirante Tamandaré que atende crianças, adolescentes e idosos com educação, esporte, música, acolhimento e voluntariado.",
};

export function parseLegacyHeroGalleryIds(value?: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

export function parseHeroMediaConfig(
  value?: string | null,
  legacyGalleryIds?: string | null
): HeroMediaConfig {
  const fallback = {
    galleryImageIds: parseLegacyHeroGalleryIds(legacyGalleryIds),
    legacyImageUrl: value?.trim() ?? "",
  };

  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("{")) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(trimmed) as {
      galleryImageIds?: unknown;
      legacyImageUrl?: unknown;
    };

    const galleryImageIds = Array.isArray(parsed.galleryImageIds)
      ? parsed.galleryImageIds
          .map((item) => Number(item))
          .filter((item) => Number.isFinite(item))
      : fallback.galleryImageIds;

    const legacyImageUrl =
      typeof parsed.legacyImageUrl === "string"
        ? parsed.legacyImageUrl.trim()
        : "";

    return {
      galleryImageIds,
      legacyImageUrl,
    };
  } catch {
    return fallback;
  }
}

export function serializeHeroMediaConfig(config: HeroMediaConfig) {
  const galleryImageIds = config.galleryImageIds.filter((item) =>
    Number.isFinite(item)
  );
  const legacyImageUrl = config.legacyImageUrl.trim();

  if (galleryImageIds.length === 0) {
    return legacyImageUrl;
  }

  return JSON.stringify({
    galleryImageIds,
    legacyImageUrl,
  });
}

export function parseSiteWorkContent(value?: string | null): SiteWorkContent {
  if (!value) {
    return emptyWorkContent;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("{")) {
    return {
      summary: trimmed,
      posts: [],
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as {
      summary?: unknown;
      posts?: unknown;
    };

    const posts = Array.isArray(parsed.posts)
      ? parsed.posts.filter(isSiteWorkPost)
      : [];

    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      posts,
    };
  } catch {
    return {
      summary: trimmed,
      posts: [],
    };
  }
}

export function serializeSiteWorkContent(content: SiteWorkContent) {
  return JSON.stringify({
    summary: content.summary,
    posts: content.posts,
  });
}

export function workSummaryForPublicText(
  content: SiteWorkContent,
  fallback: string
) {
  return content.summary.trim() || fallback;
}

export function parseInstitutionalContent(
  value?: string | null
): InstitutionalContent {
  if (!value) {
    return emptyInstitutionalContent;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return emptyInstitutionalContent;
  }

  if (!trimmed.startsWith(INSTITUTIONAL_CONTENT_MARKER)) {
    return {
      ...emptyInstitutionalContent,
      presentation: [trimmed],
      mission: trimmed,
      seoSummary: trimmed,
    };
  }

  try {
    const parsed = JSON.parse(
      trimmed.slice(INSTITUTIONAL_CONTENT_MARKER.length)
    ) as Partial<InstitutionalContent>;

    return {
      presentation: normalizeParagraphs(parsed.presentation),
      mission: normalizeText(parsed.mission),
      vision: normalizeText(parsed.vision),
      audience: normalizeText(parsed.audience),
      territory: normalizeText(parsed.territory),
      foundedLabel: normalizeText(parsed.foundedLabel),
      impactLabel: normalizeText(parsed.impactLabel),
      activeProjects: normalizeList(parsed.activeProjects),
      plannedProjects: normalizeList(parsed.plannedProjects),
      resourceHighlights: normalizeList(parsed.resourceHighlights),
      boardMembers: normalizeList(parsed.boardMembers),
      address: normalizeText(parsed.address),
      seoSummary: normalizeText(parsed.seoSummary),
    };
  } catch {
    return {
      ...emptyInstitutionalContent,
      presentation: [trimmed],
      mission: trimmed,
      seoSummary: trimmed,
    };
  }
}

export function serializeInstitutionalContent(
  content: Partial<InstitutionalContent>
) {
  const normalized: InstitutionalContent = {
    presentation: normalizeParagraphs(content.presentation),
    mission: normalizeText(content.mission),
    vision: normalizeText(content.vision),
    audience: normalizeText(content.audience),
    territory: normalizeText(content.territory),
    foundedLabel: normalizeText(content.foundedLabel),
    impactLabel: normalizeText(content.impactLabel),
    activeProjects: normalizeList(content.activeProjects),
    plannedProjects: normalizeList(content.plannedProjects),
    resourceHighlights: normalizeList(content.resourceHighlights),
    boardMembers: normalizeList(content.boardMembers),
    address: normalizeText(content.address),
    seoSummary: normalizeText(content.seoSummary),
  };

  return `${INSTITUTIONAL_CONTENT_MARKER}${JSON.stringify(normalized)}`;
}

export function mergeInstitutionalContent(
  base: InstitutionalContent,
  override?: Partial<InstitutionalContent> | null
): InstitutionalContent {
  if (!override) {
    return base;
  }

  const resolvedPresentation = normalizeParagraphs(override.presentation);
  const resolvedActiveProjects = normalizeList(override.activeProjects);
  const resolvedPlannedProjects = normalizeList(override.plannedProjects);
  const resolvedResourceHighlights = normalizeList(override.resourceHighlights);
  const resolvedBoardMembers = normalizeList(override.boardMembers);

  return {
    presentation:
      resolvedPresentation.length > 0
        ? resolvedPresentation
        : base.presentation,
    mission: normalizeText(override.mission) || base.mission,
    vision: normalizeText(override.vision) || base.vision,
    audience: normalizeText(override.audience) || base.audience,
    territory: normalizeText(override.territory) || base.territory,
    foundedLabel: normalizeText(override.foundedLabel) || base.foundedLabel,
    impactLabel: normalizeText(override.impactLabel) || base.impactLabel,
    activeProjects:
      resolvedActiveProjects.length > 0
        ? resolvedActiveProjects
        : base.activeProjects,
    plannedProjects:
      resolvedPlannedProjects.length > 0
        ? resolvedPlannedProjects
        : base.plannedProjects,
    resourceHighlights:
      resolvedResourceHighlights.length > 0
        ? resolvedResourceHighlights
        : base.resourceHighlights,
    boardMembers:
      resolvedBoardMembers.length > 0
        ? resolvedBoardMembers
        : base.boardMembers,
    address: normalizeText(override.address) || base.address,
    seoSummary: normalizeText(override.seoSummary) || base.seoSummary,
  };
}

export function textAreaToParagraphs(value?: string | null) {
  return String(value ?? "")
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function paragraphsToTextArea(values?: string[] | null) {
  return normalizeParagraphs(values).join("\n\n");
}

function normalizeText(value?: string | null) {
  return String(value ?? "").trim();
}

function normalizeList(values?: string[] | null) {
  return (values ?? [])
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function normalizeParagraphs(values?: string[] | null) {
  return (values ?? [])
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function isSiteWorkPost(value: unknown): value is SiteWorkPost {
  if (!value || typeof value !== "object") {
    return false;
  }

  const post = value as Partial<SiteWorkPost>;

  return (
    typeof post.id === "string" &&
    typeof post.title === "string" &&
    typeof post.description === "string" &&
    isWorkPostMediaType(post.mediaType) &&
    isWorkDescriptionPosition(post.descriptionPosition) &&
    Array.isArray(post.mediaItems) &&
    post.mediaItems.every(isSiteWorkMediaItem) &&
    typeof post.createdAt === "string" &&
    typeof post.updatedAt === "string"
  );
}

function isSiteWorkMediaItem(value: unknown): value is SiteWorkMediaItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const media = value as Partial<SiteWorkMediaItem>;

  return (
    (media.kind === "image" || media.kind === "video") &&
    typeof media.url === "string"
  );
}

function isWorkPostMediaType(value: unknown): value is WorkPostMediaType {
  return value === "image" || value === "carousel" || value === "video";
}

function isWorkDescriptionPosition(
  value: unknown
): value is WorkPostDescriptionPosition {
  return (
    value === "above" ||
    value === "below" ||
    value === "left" ||
    value === "right" ||
    value === "overlay-left" ||
    value === "overlay-right" ||
    value === "overlay-top" ||
    value === "overlay-bottom"
  );
}
