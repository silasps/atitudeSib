import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("site_config")
    .select("*")
    .limit(1)
    .single();

  const config = data ?? {
    project_name: "Atitude",
    project_subtitle: "Projeto social e comunitário",
    hero_title: "Transformando vidas por meio do cuidado e da educação.",
    hero_subtitle: "Conheça o projeto e faça parte da nossa missão.",
    hero_button_primary_text: "Seja voluntário",
    hero_button_primary_link: "/seja-voluntario",
    hero_button_secondary_text: "Quem somos",
    hero_button_secondary_link: "/quem-somos",
    hero_image_url: "",
    primary_color: "#18181b",
    secondary_color: "#f4f4f5",
    accent_color: "#0f766e",
    about_title: "Quem somos",
    about_text: "",
    work_title: "O que estamos fazendo",
    work_text: "",
    contact_email: "",
    contact_phone: "",
    contact_whatsapp: "",
  };

  return (
    <main className="min-h-screen bg-white" style={{ color: config.primary_color }}>
      <PublicHeader
        projectName={config.project_name}
        projectSubtitle={config.project_subtitle}
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {config.hero_image_url ? (
            <img
              src={config.hero_image_url}
              alt="Imagem principal do projeto"
              className="h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-36">
          <div className="max-w-3xl text-white">
            <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-90">
              {config.project_subtitle}
            </p>

            <h2 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
              {config.hero_title}
            </h2>

            <p className="mt-6 max-w-2xl text-lg text-white/90">
              {config.hero_subtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={config.hero_button_primary_link || "/seja-voluntario"}
                className="rounded-xl px-5 py-3 text-sm font-medium text-white"
                style={{ backgroundColor: config.accent_color }}
              >
                {config.hero_button_primary_text || "Seja voluntário"}
              </Link>

              <Link
                href={config.hero_button_secondary_link || "/quem-somos"}
                className="rounded-xl border border-white/80 px-5 py-3 text-sm font-medium text-white"
              >
                {config.hero_button_secondary_text || "Conheça o projeto"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-2">
        <div className="rounded-3xl p-8" style={{ backgroundColor: config.secondary_color }}>
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Institucional
          </p>
          <h3 className="mt-3 text-3xl font-bold">{config.about_title}</h3>
          <p className="mt-4 leading-7 text-zinc-600">{config.about_text}</p>
          <Link
            href="/quem-somos"
            className="mt-6 inline-flex rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900"
          >
            Saiba mais
          </Link>
        </div>

        <div className="rounded-3xl border border-zinc-200 p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Atuação
          </p>
          <h3 className="mt-3 text-3xl font-bold">{config.work_title}</h3>
          <p className="mt-4 leading-7 text-zinc-600">{config.work_text}</p>
          <Link
            href="/o-que-estamos-fazendo"
            className="mt-6 inline-flex rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900"
          >
            Ver atuação
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl p-8 text-white" style={{ backgroundColor: config.primary_color }}>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">
                Faça parte
              </p>
              <h3 className="mt-3 text-3xl font-bold">
                Quer servir com a gente?
              </h3>
              <p className="mt-4 text-white/80">
                Veja as oportunidades abertas e envie sua candidatura como voluntário.
              </p>
            </div>

            <div className="flex items-center gap-3 md:justify-end">
              <Link
                href="/seja-voluntario"
                className="rounded-xl px-5 py-3 text-sm font-medium text-white"
                style={{ backgroundColor: config.accent_color }}
              >
                Ver oportunidades
              </Link>

              <Link
                href="/faca-parte"
                className="rounded-xl border border-white/60 px-5 py-3 text-sm font-medium text-white"
              >
                Saiba como participar
              </Link>
            </div>
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