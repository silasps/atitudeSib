import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function FacaPartePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("site_config")
    .select("*")
    .limit(1)
    .single();

  const config = data ?? {
    project_name: "Atitude",
    project_subtitle: "Projeto social e comunitário",
    contact_email: "",
    contact_phone: "",
    contact_whatsapp: "",
  };

  return (
    <main className="min-h-screen bg-zinc-50">
      <PublicHeader
        projectName={config.project_name}
        projectSubtitle={config.project_subtitle}
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Voluntariado
            </p>
            <h1 className="mt-3 text-3xl font-bold text-zinc-900">
              Sirva como voluntário
            </h1>
            <p className="mt-4 leading-7 text-zinc-600">
              Veja as necessidades abertas e candidate-se para atuar nas áreas em que o projeto precisa de apoio.
            </p>
            <Link
              href="/seja-voluntario"
              className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white"
            >
              Ver oportunidades
            </Link>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Contato
            </p>
            <h2 className="mt-3 text-3xl font-bold text-zinc-900">
              Quer falar com a equipe?
            </h2>
            <p className="mt-4 leading-7 text-zinc-600">
              Entre em contato para tirar dúvidas, entender melhor o projeto ou conversar sobre formas de participação.
            </p>
            <Link
              href="/contato"
              className="mt-6 inline-flex rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900"
            >
              Ir para contato
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