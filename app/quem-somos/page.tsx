import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { createSupabaseServerClient } from "@/lib/supabase-server";


export default async function QuemSomosPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("site_config")
    .select("*")
    .limit(1)
    .single();

  const config = data ?? {
    project_name: "Atitude",
    project_subtitle: "Projeto social e comunitário",
    about_title: "Quem somos",
    about_text: "Em breve.",
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

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <Link href="/" className="text-sm text-zinc-500">
            ← Voltar para início
          </Link>

          <h1 className="mt-4 text-4xl font-bold text-zinc-900">
            {config.about_title || "Quem somos"}
          </h1>

          <p className="mt-6 leading-8 text-zinc-700">
            {config.about_text || "Em breve."}
          </p>
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