import { cache } from "react";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  defaultInstitutionalContent,
  mergeInstitutionalContent,
  parseInstitutionalContent,
  serializeInstitutionalContent,
} from "@/lib/site-content";

export type SiteConfig = {
  id?: number;
  project_name: string;
  project_subtitle: string;
  hero_title: string;
  hero_subtitle: string;
  hero_button_primary_text: string;
  hero_button_primary_link: string;
  hero_button_secondary_text: string;
  hero_button_secondary_link: string;
  hero_image_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  about_title: string;
  about_text: string;
  work_title: string;
  work_text: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  hero_gallery_image_ids?: string | null;
};

export const defaultSiteConfig: SiteConfig = {
  project_name: "Atitude",
  project_subtitle: "Projeto Escola Social",
  hero_title: "Transformando vidas com cuidado, educação e acolhimento.",
  hero_subtitle:
    "Conectamos famílias, voluntários e parceiros para ampliar oportunidades reais de desenvolvimento humano no território.",
  hero_button_primary_text: "Seja voluntário",
  hero_button_primary_link: "/seja-voluntario",
  hero_button_secondary_text: "Conheça o projeto",
  hero_button_secondary_link: "/quem-somos",
  hero_image_url: "",
  primary_color: "#0f172a",
  secondary_color: "#f8fafc",
  accent_color: "#0f766e",
  about_title: "Quem somos",
  about_text: serializeInstitutionalContent(defaultInstitutionalContent),
  work_title: "O que estamos fazendo",
  work_text:
    "Acompanhe as ações, os encontros e os resultados que estão acontecendo no projeto.",
  contact_email: "contato@oatitude.org.br",
  contact_phone: "(41) 9 9288-1025",
  contact_whatsapp: "(41) 9 9288-1025",
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
};

export function normalizeSiteConfig(data?: Partial<SiteConfig> | null): SiteConfig {
  return {
    ...defaultSiteConfig,
    ...(data ?? {}),
  };
}

export const getPublicSiteConfig = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("site_config").select("*").limit(1).maybeSingle();
  return normalizeSiteConfig((data as Partial<SiteConfig> | null) ?? null);
});

export function getInstitutionalContent(config: Pick<SiteConfig, "about_text">) {
  return mergeInstitutionalContent(
    defaultInstitutionalContent,
    parseInstitutionalContent(config.about_text)
  );
}

export function resolveSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;

  if (!raw) {
    return undefined;
  }

  try {
    return new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return undefined;
  }
}

export function buildPageMetadata(
  config: Pick<
    SiteConfig,
    | "project_name"
    | "project_subtitle"
    | "hero_subtitle"
    | "about_text"
    | "instagram_url"
    | "facebook_url"
    | "youtube_url"
  >,
  {
    title,
    description,
    path,
    keywords,
  }: {
    title?: string;
    description?: string;
    path?: string;
    keywords?: string[];
  } = {}
): Metadata {
  const institutionalContent = getInstitutionalContent({
    about_text: config.about_text,
  });
  const finalTitle = title
    ? `${title} | ${config.project_name}`
    : `${config.project_name} | ${config.project_subtitle}`;
  const finalDescription =
    description ||
    institutionalContent.seoSummary ||
    config.hero_subtitle ||
    config.project_subtitle;
  const canonicalPath = path?.trim() || undefined;

  return {
    title: finalTitle,
    description: finalDescription,
    keywords,
    alternates: canonicalPath
      ? {
          canonical: canonicalPath,
        }
      : undefined,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      type: "website",
      locale: "pt_BR",
      siteName: config.project_name,
      url: canonicalPath,
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildOrganizationSchema(
  config: Pick<
    SiteConfig,
    | "project_name"
    | "project_subtitle"
    | "contact_email"
    | "contact_phone"
    | "instagram_url"
    | "facebook_url"
    | "youtube_url"
    | "about_text"
  >
) {
  const institutionalContent = getInstitutionalContent({
    about_text: config.about_text,
  });
  const sameAs = [
    config.instagram_url,
    config.facebook_url,
    config.youtube_url,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: config.project_name,
    alternateName: config.project_subtitle,
    description:
      institutionalContent.seoSummary ||
      institutionalContent.impactLabel ||
      config.project_subtitle,
    email: config.contact_email || undefined,
    telephone: config.contact_phone || undefined,
    address: institutionalContent.address || undefined,
    areaServed: institutionalContent.territory || undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

export function sanitizePhoneForWhatsApp(value?: string | null) {
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export function splitLabelDescription(value: string) {
  const [label, ...rest] = value.split(":");

  return {
    label: label.trim(),
    description: rest.join(":").trim(),
  };
}
