import WorkPostCard from "@/components/public/work-post-card";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  parseSiteWorkContent,
  workSummaryForPublicText,
} from "@/lib/site-content";

type SiteConfig = {
  project_name: string;
  project_subtitle: string;
  work_title: string;
  work_text: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
};

const defaultConfig: SiteConfig = {
  project_name: "O Atitude",
  project_subtitle: "Projeto Escola Social",
  work_title: "O que estamos fazendo",
  work_text:
    "Acompanhe as acoes, encontros e resultados que estao acontecendo no projeto.",
  contact_email: "",
  contact_phone: "(41) 9 99288-1025",
  contact_whatsapp: "(41) 9 99288-1025",
};

export default async function OQueEstamosFazendoPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("site_config")
    .select(
      "project_name,project_subtitle,work_title,work_text,contact_email,contact_phone,contact_whatsapp"
    )
    .limit(1)
    .maybeSingle();

  const config = data
    ? {
        project_name: data.project_name ?? defaultConfig.project_name,
        project_subtitle: data.project_subtitle ?? defaultConfig.project_subtitle,
        work_title: data.work_title ?? defaultConfig.work_title,
        work_text: data.work_text ?? defaultConfig.work_text,
        contact_email: data.contact_email ?? defaultConfig.contact_email,
        contact_phone: data.contact_phone ?? defaultConfig.contact_phone,
        contact_whatsapp: data.contact_whatsapp ?? defaultConfig.contact_whatsapp,
      }
    : defaultConfig;

  const workContent = parseSiteWorkContent(config.work_text);
  const summary = workSummaryForPublicText(workContent, defaultConfig.work_text);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <PublicHeader
        projectName={config.project_name}
        projectSubtitle={config.project_subtitle}
      />

      <main className="space-y-10 px-6 py-12 md:px-10">
        <section className="mx-auto max-w-6xl rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
            Pagina viva do projeto
          </p>
          <h1 className="mt-3 text-3xl font-bold text-zinc-900 md:text-4xl">
            {config.work_title || defaultConfig.work_title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-600">
            {summary}
          </p>
        </section>

        {workContent.posts.length > 0 ? (
          <section className="mx-auto max-w-6xl space-y-6">
            {workContent.posts.map((post) => (
              <WorkPostCard key={post.id} post={post} />
            ))}
          </section>
        ) : (
          <section className="mx-auto max-w-4xl rounded-[2rem] border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">
              Nenhuma publicacao foi cadastrada ainda.
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Assim que a equipe adicionar novas postagens no painel administrativo, elas aparecerao aqui.
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
      />
    </div>
  );
}
