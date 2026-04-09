import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import HeroSlider, { HeroSlide } from "@/components/public/hero-slider";
import StoryScroller from "@/components/public/story-scroller";
import {
  parseHeroMediaConfig,
  parseSiteWorkContent,
  workSummaryForPublicText,
} from "@/lib/site-content";

type SiteConfig = {
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
  hero_gallery_image_ids?: string | null;
};

const defaultConfig: SiteConfig = {
  project_name: "Atitude",
  project_subtitle: "Projeto social e comunitário",
  hero_title: "Transformando vidas com cuidado, educação e acolhimento.",
  hero_subtitle:
    "Conte histórias reais, conecte voluntários e mostre impacto para quem quer contribuir e investir.",
  hero_button_primary_text: "Seja voluntário",
  hero_button_primary_link: "/seja-voluntario",
  hero_button_secondary_text: "Conheça o projeto",
  hero_button_secondary_link: "/quem-somos",
  hero_image_url: "",
  primary_color: "#111827",
  secondary_color: "#f4f4f5",
  accent_color: "#0f766e",
  about_title: "Nossa missão",
  about_text:
    "Cuidamos de crianças, famílias e cuidadores para gerar oportunidades reais de desenvolvimento por meio da educação e do acolhimento.",
  work_title: "Impacto no território",
  work_text:
    "As nossas frentes entregam acolhimento, apoio pedagógico e presença comunitária com voluntários dedicados e parceiros engajados.",
  contact_email: "",
  contact_phone: "",
  contact_whatsapp: "",
};

type GalleryItem = {
  id: number;
  image_url: string;
  legenda: string | null;
};

function formatMetric(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function portraitStory(item: GalleryItem, fallbackHeadline: string, fallbackDescription: string) {
  const rawText = item.legenda?.trim() ?? "";
  const sentences = rawText
    .split(".")
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const title = sentences[0] || fallbackHeadline;
  const description = sentences.slice(1).join(". ") || rawText || fallbackDescription;

  return {
    title,
    description,
  };
}

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const [
    configResult,
    recentGalleryResult,
    volunteerCountResult,
    activeStudentsResult,
    activeFunctionsResult,
    openNeedsResult,
  ] = await Promise.all([
    supabase.from("site_config").select("*").limit(1).maybeSingle(),
    supabase
      .from("site_gallery")
      .select("*")
      .eq("ativo", true)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("candidaturas_voluntariado")
      .select("id", { count: "exact", head: true })
      .eq("status", "aprovado"),
    supabase
      .from("alunos")
      .select("id", { count: "exact", head: true })
      .eq("status", "ativo"),
    supabase
      .from("funcoes_voluntariado")
      .select("id", { count: "exact", head: true })
      .eq("ativo", true),
    supabase
      .from("necessidades_voluntariado")
      .select("id", { count: "exact", head: true })
      .eq("status", "aberta"),
  ]);

  const config = (configResult.data as SiteConfig) ?? defaultConfig;
  const recentGallery = (recentGalleryResult.data ?? []) as GalleryItem[];
  const heroMediaConfig = parseHeroMediaConfig(
    config.hero_image_url,
    config.hero_gallery_image_ids
  );
  const workContent = parseSiteWorkContent(config.work_text);
  const publicWorkSummary = workSummaryForPublicText(
    workContent,
    defaultConfig.work_text
  );

  const heroGalleryIds = heroMediaConfig.galleryImageIds;
  const heroGalleryResult =
    heroGalleryIds.length > 0
      ? await supabase
          .from("site_gallery")
          .select("id,image_url,legenda")
          .eq("ativo", true)
          .in("id", heroGalleryIds)
      : { data: [] };

  const heroGalleryItems = (heroGalleryResult.data ?? []) as GalleryItem[];
  const selectedGallery = heroGalleryIds
    .map((id) => heroGalleryItems.find((item) => item.id === id))
    .filter((item): item is GalleryItem => Boolean(item));

  const heroSlides: HeroSlide[] =
    selectedGallery.length > 0
      ? selectedGallery.map((item) => ({
          imageUrl: item.image_url,
          caption: item.legenda ?? config.hero_subtitle,
        }))
      : recentGallery.slice(0, 3).map((item) => ({
          imageUrl: item.image_url,
          caption: item.legenda ?? config.hero_subtitle,
        }));

  if (!heroSlides.length && heroMediaConfig.legacyImageUrl) {
    heroSlides.push({
      imageUrl: heroMediaConfig.legacyImageUrl,
      caption: config.hero_subtitle,
    });
  }

  const stats = [
    {
      label: "Voluntários ativos",
      value: formatMetric(volunteerCountResult.count ?? 0),
      detail: "Candidaturas aprovadas que já atuam com a gente",
    },
    {
      label: "Pessoas atendidas",
      value: formatMetric(activeStudentsResult.count ?? 0),
      detail: "Alunos e famílias acompanhadas em turmas ativas",
    },
    {
      label: "Frentes de trabalho",
      value: formatMetric(activeFunctionsResult.count ?? 0),
      detail: "Funções de voluntariado em andamento",
    },
    {
      label: "Necessidades abertas",
      value: formatMetric(openNeedsResult.count ?? 0),
      detail: "Vagas em aberto para novos voluntários",
    },
  ];

  const storyCards = recentGallery.slice(0, 4).map((item) => {
    const segments = portraitStory(
      item,
      config.project_subtitle,
      publicWorkSummary
    );
    return {
      id: item.id,
      imageUrl: item.image_url,
      title: segments.title,
      description: segments.description,
    };
  });

  return (
    <main className="bg-white text-zinc-900">
      <PublicHeader projectName={config.project_name} projectSubtitle={config.project_subtitle} />

      <HeroSlider
        slides={heroSlides}
        title={config.hero_title}
        subtitle={config.hero_subtitle}
        accentColor={config.accent_color}
        primaryAction={{
          label: config.hero_button_primary_text || "Seja voluntário",
          href: config.hero_button_primary_link || "/seja-voluntario",
        }}
        secondaryAction={{
          label: config.hero_button_secondary_text || "Conheça o projeto",
          href: config.hero_button_secondary_link || "/quem-somos",
        }}
      />

      <section className="bg-zinc-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Números que comprovam</p>
            <h2 className="text-3xl font-bold text-zinc-900">Impacto em evidência</h2>
            <p className="max-w-3xl text-sm text-zinc-600">{publicWorkSummary}</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{stat.detail}</p>
                <p className="mt-4 text-4xl font-semibold text-zinc-900">{stat.value}</p>
                <p className="mt-2 text-sm text-zinc-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <article className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Missão da organização</p>
            <h3 className="mt-3 text-3xl font-semibold text-zinc-900">{config.about_title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              {config.about_text}
            </p>
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Histórias de impacto</p>
            <h3 className="mt-3 text-3xl font-semibold text-zinc-900">{config.work_title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              Compartilhamos a presença cotidiana dos nossos voluntários, famílias e estudantes para mostrar
              onde seu investimento chega.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/faca-parte"
                className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 cursor-pointer"
              >
                Conhecer programas
              </Link>
              <Link
                href="/contato"
                className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white cursor-pointer"
                style={{ backgroundColor: config.primary_color }}
              >
                Conversar com a equipe
              </Link>
            </div>
          </article>
        </div>
      </section>

      <StoryScroller
        title={`Vivências do ${config.project_name}`}
        subtitle="Galeria viva com fotos recentes e relatos curtos que aproximam você dos nossos voluntários e comunidades."
        stories={storyCards}
      />

      <section className="bg-zinc-900 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Investimento social</p>
          <h3 className="mt-4 text-3xl font-semibold">Sinta o pulso do Atitude</h3>
          <p className="mt-4 text-sm text-white/80">
            Transparência e propósito em cada número. Mantemos investidores, parceiros e voluntários próximos com
            relatórios humanizados, fotos atualizadas e painéis com as pessoas reais que são impactadas todos os dias.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/seja-voluntario"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 cursor-pointer"
            >
              Ver oportunidades
            </Link>
            <Link
              href="/contato"
              className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white cursor-pointer"
            >
              Agendar conversa
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter
        projectName={config.project_name}
        projectSubtitle={config.project_subtitle}
        contactEmail={config.contact_email}
        contactPhone={config.contact_phone}
        contactWhatsapp={config.contact_whatsapp}
      />
    </main>
  );
}
