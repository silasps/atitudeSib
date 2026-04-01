export type SectionType =
  | "hero"
  | "who"
  | "mission"
  | "audience"
  | "projects"
  | "offer"
  | "process"
  | "team"
  | "structure"
  | "contact"
  | "cta"
  | "map";

export type CTAItem = {
  label: string;
  href: string;
};

export type SectionMedia = {
  url?: string;
  alt?: string;
  position?: "left" | "right" | "full";
};

export type SectionData = {
  id: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  description?: string;
  list?: string[];
  projects?: { title: string; description: string; media?: SectionMedia }[];
  media?: SectionMedia;
  cta?: CTAItem;
  ctaSecondary?: CTAItem;
  isVisible?: boolean;
  iframe?: string;
  stats?: { label: string; value: string }[];
  layoutVariant?: string;
};

export type ProjectTheme = {
  name: string;
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  heroMedia?: SectionMedia;
  sections: SectionData[];
};
