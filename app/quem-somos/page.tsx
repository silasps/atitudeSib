import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  HeartHandshake,
  Landmark,
  MapPin,
  Sparkles,
  Users2,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  buildOrganizationSchema,
  buildPageMetadata,
  getInstitutionalContent,
  getPublicSiteConfig,
  splitLabelDescription,
} from "@/lib/public-site";

type GalleryItem = {
  id: number;
  image_url: string;
  legenda: string | null;
};

export async function generateMetadata() {
  const config = await getPublicSiteConfig();
  const institutionalContent = getInstitutionalContent(config);

  return buildPageMetadata(config, {
    title: config.about_title || "Quem somos",
    path: "/quem-somos",
    description: institutionalContent.seoSummary,
    keywords: [
      "quem somos",
      "organização social",
      "Lamenha Grande",
      "impacto comunitário",
      "projeto escola social",
    ],
  });
}

function projectIcon(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("jiu") || normalized.includes("pilates")) {
    return Compass;
  }

  if (normalized.includes("comput")) {
    return Landmark;
  }

  return Sparkles;
}

export default async function QuemSomosPage() {
  const config = await getPublicSiteConfig();
  const institutionalContent = getInstitutionalContent(config);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("site_gallery")
    .select("id,image_url,legenda")
    .eq("ativo", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const gallery = (data ?? []) as GalleryItem[];
  const galleryLead = gallery[0];
  const organizationSchema = buildOrganizationSchema(config);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_38%,#fffdf8_100%)] text-zinc-950">
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

      <section className="px-6 py-14 md:py-18">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-800">
              Quem somos
            </div>
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">
                {config.about_title || "Projeto Escola Social"}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-600 md:text-lg">
                {institutionalContent.impactLabel}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium text-zinc-700">
                {institutionalContent.foundedLabel}
              </span>
              <span className="rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium text-zinc-700">
                {institutionalContent.territory}
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 font-medium text-amber-800">
                {institutionalContent.audience}
              </span>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm">
              <div className="space-y-4 text-sm leading-8 text-zinc-600">
                {institutionalContent.presentation.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
              <div className="relative min-h-[360px] bg-zinc-100">
                {galleryLead ? (
                  <>
                    <Image
                      src={galleryLead.image_url}
                      alt={galleryLead.legenda || `${config.project_name} em atividade`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-zinc-950/10 to-transparent" />
                    <div className="absolute inset-x-6 bottom-6 text-white">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                        Imagem do território
                      </p>
                      <p className="mt-3 text-lg font-semibold">
                        {galleryLead.legenda ||
                          "Presença, convívio e experiências reais no cotidiano do projeto."}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.3),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.24),_transparent_28%),linear-gradient(135deg,#0f172a,#111827)]" />
                )}
              </div>
            </article>

            <article className="rounded-[2rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <HeartHandshake size={18} />
                <p className="text-xs uppercase tracking-[0.35em] text-white/65">
                  Valor público
                </p>
              </div>
              <p className="mt-4 text-base leading-8 text-white/82">
                O Atitude existe para aproximar cuidado, educação, cultura,
                esporte e oportunidades concretas da vida cotidiana de quem mais
                precisa.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-zinc-500" />
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Missão
              </p>
            </div>
            <p className="mt-4 text-sm leading-8 text-zinc-600">
              {institutionalContent.mission}
            </p>
          </article>
          <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Compass size={18} className="text-zinc-500" />
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Visão
              </p>
            </div>
            <p className="mt-4 text-sm leading-8 text-zinc-600">
              {institutionalContent.vision}
            </p>
          </article>
          <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Users2 size={18} className="text-zinc-500" />
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Público priorizado
              </p>
            </div>
            <p className="mt-4 text-sm leading-8 text-zinc-600">
              {institutionalContent.audience}
            </p>
          </article>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
              Programas
            </p>
            <h2 className="text-3xl font-semibold text-zinc-950 md:text-4xl">
              O que já acontece e o que vem a seguir
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-zinc-600">
              A proposta institucional combina continuidade das ações atuais com
              novas frentes que ampliam repertório, autonomia e oportunidade.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {institutionalContent.activeProjects.map((item) => {
              const { label, description } = splitLabelDescription(item);
              const Icon = projectIcon(label);

              return (
                <article
                  key={item}
                  className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
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
                        Próxima expansão
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

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-zinc-200 bg-zinc-950 p-8 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <MapPin size={18} />
              <p className="text-xs uppercase tracking-[0.35em] text-white/65">
                Base institucional
              </p>
            </div>
            <p className="mt-4 text-base leading-8 text-white/82">
              {institutionalContent.address}
            </p>
            <p className="mt-6 text-sm leading-7 text-white/70">
              Esta base territorial concentra a operação do projeto, o encontro com
              a comunidade e a coordenação das frentes públicas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contato"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950"
              >
                Falar com a equipe
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/seja-voluntario"
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white"
              >
                Ver oportunidades
              </Link>
            </div>
          </article>

          <article className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <Landmark size={18} className="text-zinc-500" />
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                  Direção e equipe técnica
                </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {institutionalContent.boardMembers.map((item) => {
                const { label, description } = splitLabelDescription(item);

                return (
                  <div
                    key={item}
                    className="rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-5"
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      {label}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-zinc-950">
                      {description}
                    </p>
                  </div>
                );
              })}
            </div>
          </article>
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
