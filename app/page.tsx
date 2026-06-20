import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  HandHeart,
  HeartHandshake,
  Landmark,
  MapPin,
  Music4,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import HeroSlider, { HeroSlide } from "@/components/public/hero-slider";
import StoryScroller from "@/components/public/story-scroller";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  buildOrganizationSchema,
  buildPageMetadata,
  defaultSiteConfig,
  getInstitutionalContent,
  getPublicSiteConfig,
  splitLabelDescription,
} from "@/lib/public-site";
import {
  parseHeroMediaConfig,
  parseSiteWorkContent,
  workSummaryForPublicText,
} from "@/lib/site-content";

type GalleryItem = {
  id: number;
  image_url: string;
  legenda: string | null;
};

export async function generateMetadata() {
  const config = await getPublicSiteConfig();

  return buildPageMetadata(config, {
    path: "/",
    description:
      getInstitutionalContent(config).seoSummary || defaultSiteConfig.hero_subtitle,
    keywords: [
      "projeto social",
      "voluntariado",
      "educação comunitária",
      "assistência social",
      "Almirante Tamandaré",
    ],
  });
}

function formatMetric(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function projectIcon(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("mus")) {
    return Music4;
  }

  if (normalized.includes("jiu") || normalized.includes("pilates")) {
    return ShieldCheck;
  }

  if (normalized.includes("comput")) {
    return Landmark;
  }

  return BookOpenText;
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
  const config = await getPublicSiteConfig();
  const institutionalContent = getInstitutionalContent(config);
  const supabase = await createSupabaseServerClient();

  const [
    recentGalleryResult,
    volunteerCountResult,
    activeStudentsResult,
    activeFunctionsResult,
    openNeedsResult,
  ] = await Promise.all([
    supabase
      .from("site_gallery")
      .select("id,image_url,legenda")
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

  const recentGallery = (recentGalleryResult.data ?? []) as GalleryItem[];
  const heroMediaConfig = parseHeroMediaConfig(
    config.hero_image_url,
    config.hero_gallery_image_ids
  );
  const workContent = parseSiteWorkContent(config.work_text);
  const publicWorkSummary = workSummaryForPublicText(
    workContent,
    defaultSiteConfig.work_text
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
      detail: "Pessoas que já atuam com a equipe",
      icon: HandHeart,
    },
    {
      label: "Pessoas acompanhadas",
      value: formatMetric(activeStudentsResult.count ?? 0),
      detail: "Alunos e famílias conectados às turmas",
      icon: Users2,
    },
    {
      label: "Frentes de trabalho",
      value: formatMetric(activeFunctionsResult.count ?? 0),
      detail: "Funções e atividades em operação",
      icon: Sparkles,
    },
    {
      label: "Vagas abertas",
      value: formatMetric(openNeedsResult.count ?? 0),
      detail: "Oportunidades públicas para novos voluntários",
      icon: HeartHandshake,
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

  const organizationSchema = buildOrganizationSchema(config);
  const galleryLead = recentGallery[0];

  return (
    <main className="bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_22%,#f8fafc_100%)] text-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <PublicHeader
        projectName={config.project_name}
        projectSubtitle={config.project_subtitle}
      />

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

      <section className="relative z-10 -mt-10 px-6 pb-10">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      {stat.detail}
                    </p>
                    <p className="mt-4 text-4xl font-semibold text-zinc-950">
                      {stat.value}
                    </p>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                    <Icon size={20} />
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-600">{stat.label}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
                Presença no território
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">
                {institutionalContent.impactLabel}
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-8 text-zinc-600">
                {institutionalContent.presentation.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-medium text-emerald-800">
                  {institutionalContent.foundedLabel}
                </span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 font-medium text-zinc-700">
                  {institutionalContent.territory}
                </span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 font-medium text-amber-800">
                  {institutionalContent.audience}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[2rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                  Missão
                </p>
                <p className="mt-4 text-base leading-8 text-white/88">
                  {institutionalContent.mission}
                </p>
              </article>
              <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                  Visão
                </p>
                <p className="mt-4 text-base leading-8 text-zinc-600">
                  {institutionalContent.vision}
                </p>
              </article>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
              <div className="relative min-h-[340px] bg-zinc-100">
                {galleryLead ? (
                  <>
                    <Image
                      src={galleryLead.image_url}
                      alt={galleryLead.legenda || `${config.project_name} em atividade`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-zinc-950/15 to-transparent" />
                    <div className="absolute inset-x-6 bottom-6 text-white">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                        Galeria viva
                      </p>
                      <p className="mt-3 max-w-xl text-lg font-semibold">
                        {galleryLead.legenda || "Imagens reais do cotidiano do projeto."}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.28),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.24),_transparent_30%),linear-gradient(135deg,#0f172a,#1f2937)]" />
                )}
              </div>
            </article>

            <article className="rounded-[2rem] border border-zinc-200 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_55%,#fefce8_100%)] p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-teal-700">
                    Rota de acompanhamento
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-zinc-950">
                    Transparência que mostra onde cada esforço chega
                  </h3>
                </div>
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: config.accent_color }}
                >
                  <ArrowRight size={20} />
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-zinc-600">
                {publicWorkSummary}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/o-que-estamos-fazendo"
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Ver publicações
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/quem-somos"
                  className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:border-zinc-400"
                >
                  Conhecer história
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
              Programas e expansões
            </p>
            <h2 className="text-3xl font-semibold text-zinc-950 md:text-4xl">
              Frentes ativas e próximos movimentos do projeto
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-zinc-600">
              O site agora apresenta o cotidiano atual e também o que está sendo
              preparado para ampliar o alcance do Atitude com mais previsibilidade.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {institutionalContent.activeProjects.map((item) => {
              const { label, description } = splitLabelDescription(item);
              const Icon = projectIcon(label);

              return (
                <article
                  key={item}
                  className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                      style={{ backgroundColor: config.accent_color }}
                    >
                      <Icon size={20} />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                        Em andamento
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-zinc-950">
                        {label}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-zinc-600">
                        {description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {institutionalContent.plannedProjects.map((item) => {
              const { label, description } = splitLabelDescription(item);
              const Icon = projectIcon(label);

              return (
                <article
                  key={item}
                  className="rounded-[2rem] border border-dashed border-zinc-300 bg-zinc-50 p-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-zinc-900 shadow-sm">
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                        Em breve
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-zinc-950">
                        {label}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-zinc-600">
                        {description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <StoryScroller
        title={`Vivências do ${config.project_name}`}
        subtitle="Uma leitura mais humana do impacto: imagens, relatos e presença cotidiana para quem quer acompanhar o projeto de perto."
        stories={storyCards}
      />

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[2rem] bg-zinc-950 p-8 text-white shadow-[0_30px_70px_rgba(15,23,42,0.22)]">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              Como o apoio chega
            </p>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
              Cada contribuição sustenta estrutura, cuidado e continuidade
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-white/78">
              O apoio institucional se transforma em equipe, recursos pedagógicos,
              alimentação, manutenção dos espaços e experiências de qualidade para
              quem participa das atividades.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {institutionalContent.resourceHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                      <Sparkles size={18} />
                    </span>
                    <p className="text-sm leading-7 text-white/82">{item}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/seja-voluntario"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950"
              >
                Ver oportunidades
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contato"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
              >
                Conversar com a equipe
              </Link>
            </div>
          </article>

          <div className="grid gap-4">
            <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Comunidade atendida
              </p>
              <p className="mt-4 text-base leading-8 text-zinc-600">
                {institutionalContent.audience}
              </p>
            </article>

            <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-zinc-950">
                <MapPin size={18} />
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  Base territorial
                </p>
              </div>
              <p className="mt-4 text-base leading-8 text-zinc-600">
                {institutionalContent.address}
              </p>
            </article>

            <article className="rounded-[2rem] border border-zinc-200 bg-[linear-gradient(135deg,#fefce8_0%,#ffffff_70%)] p-6 shadow-sm">
              <div className="flex items-center gap-3 text-zinc-950">
                <Users2 size={18} />
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  Proximidade e confiança
                </p>
              </div>
              <p className="mt-4 text-base leading-8 text-zinc-600">
                O painel administrativo alimenta essas páginas públicas com mais
                clareza, deixando o site sempre pronto para informar, acolher e
                converter novos apoios.
              </p>
            </article>
          </div>
        </div>
      </section>

      <PublicFooter
        projectName={config.project_name}
        projectSubtitle={config.project_subtitle}
        contactEmail={config.contact_email}
        contactPhone={config.contact_phone}
        contactWhatsapp={config.contact_whatsapp}
        instagramUrl={config.instagram_url}
        facebookUrl={config.facebook_url}
        youtubeUrl={config.youtube_url}
        addressLine={institutionalContent.address}
      />
    </main>
  );
}
