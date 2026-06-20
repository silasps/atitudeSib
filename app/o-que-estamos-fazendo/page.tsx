import Link from "next/link";
import { ArrowRight, Newspaper, Sparkles, Users2 } from "lucide-react";
import WorkPostCard from "@/components/public/work-post-card";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  buildPageMetadata,
  getInstitutionalContent,
  getPublicSiteConfig,
} from "@/lib/public-site";
import {
  parseSiteWorkContent,
  workSummaryForPublicText,
} from "@/lib/site-content";

export async function generateMetadata() {
  const config = await getPublicSiteConfig();

  return buildPageMetadata(config, {
    title: config.work_title || "O que estamos fazendo",
    path: "/o-que-estamos-fazendo",
    description:
      workSummaryForPublicText(parseSiteWorkContent(config.work_text), config.hero_subtitle),
    keywords: [
      "ações do projeto",
      "publicações",
      "impacto social",
      "galeria de atividades",
      "projeto atitude",
    ],
  });
}

export default async function OQueEstamosFazendoPage() {
  const config = await getPublicSiteConfig();
  const institutionalContent = getInstitutionalContent(config);
  const workContent = parseSiteWorkContent(config.work_text);
  const summary = workSummaryForPublicText(workContent, config.hero_subtitle);
  const supabase = await createSupabaseServerClient();
  const [{ count: openNeedsCount }, { count: galleryCount }] = await Promise.all([
    supabase
      .from("necessidades_voluntariado")
      .select("id", { count: "exact", head: true })
      .eq("status", "aberta"),
    supabase
      .from("site_gallery")
      .select("id", { count: "exact", head: true })
      .eq("ativo", true),
  ]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-zinc-950">
      <PublicHeader
        projectName={config.project_name}
        projectSubtitle={config.project_subtitle}
      />

      <main className="space-y-12 px-6 py-12 md:px-10 md:py-16">
        <section className="mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] border border-zinc-200 bg-white shadow-sm">
          <div className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">
                Página viva do projeto
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl">
                {config.work_title || "O que estamos fazendo"}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-600">
                {summary}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/seja-voluntario"
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Participar do projeto
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/quem-somos"
                  className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900"
                >
                  Entender a missão
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-[2rem] bg-zinc-950 p-6 text-white">
                <div className="flex items-center gap-3">
                  <Newspaper size={18} />
                  <p className="text-xs uppercase tracking-[0.35em] text-white/65">
                    Atualizações
                  </p>
                </div>
                <p className="mt-4 text-5xl font-semibold">
                  {workContent.posts.length}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/78">
                  Publicações organizadas pela equipe para mostrar rotina,
                  resultados, encontros e avanços do território.
                </p>
              </article>

              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-5">
                  <div className="flex items-center gap-3">
                    <Sparkles size={18} className="text-zinc-500" />
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Programas ativos
                    </p>
                  </div>
                  <p className="mt-4 text-4xl font-semibold text-zinc-950">
                    {institutionalContent.activeProjects.length}
                  </p>
                </article>

                <article className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-5">
                  <div className="flex items-center gap-3">
                    <Users2 size={18} className="text-zinc-500" />
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Oportunidades abertas
                    </p>
                  </div>
                  <p className="mt-4 text-4xl font-semibold text-zinc-950">
                    {openNeedsCount ?? 0}
                  </p>
                  <p className="mt-3 text-sm text-zinc-600">
                    {galleryCount ?? 0} imagens ativas compondo a memória visual do projeto.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        {workContent.posts.length > 0 ? (
          <section className="mx-auto max-w-6xl space-y-6">
            {workContent.posts.map((post) => (
              <WorkPostCard key={post.id} post={post} />
            ))}
          </section>
        ) : (
          <section className="mx-auto max-w-4xl rounded-[2rem] border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">
              Conteúdo em construção
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-zinc-950">
              Nenhuma publicação foi cadastrada ainda
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              Assim que a equipe adicionar novas postagens no painel administrativo,
              elas aparecerão aqui com o mesmo tratamento visual das histórias e
              atualizações do projeto.
            </p>
          </section>
        )}
      </main>

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
    </div>
  );
}
