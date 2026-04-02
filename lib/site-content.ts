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

const emptyWorkContent: SiteWorkContent = {
  summary: "",
  posts: [],
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
