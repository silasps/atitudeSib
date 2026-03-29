import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function ContatoPage() {
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
    instagram_url: "",
    facebook_url: "",
    youtube_url: "",
  };

  return (
    <main className="min-h-screen bg-zinc-50">
      <PublicHeader
        projectName={config.project_name}
        projectSubtitle={config.project_subtitle}
      />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <Link href="/" className="text-sm text-zinc-500">
            ← Voltar para início
          </Link>

          <h1 className="mt-4 text-4xl font-bold text-zinc-900">Contato</h1>
          <p className="mt-4 text-zinc-600">
            Fale com a equipe do projeto pelos canais abaixo.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-zinc-50 p-6">
              <h2 className="text-lg font-semibold text-zinc-900">
                Canais principais
              </h2>

              <div className="mt-4 space-y-2 text-zinc-600">
                <p><span className="font-medium text-zinc-900">E-mail:</span> {config.contact_email || "Não informado"}</p>
                <p><span className="font-medium text-zinc-900">Telefone:</span> {config.contact_phone || "Não informado"}</p>
                <p><span className="font-medium text-zinc-900">WhatsApp:</span> {config.contact_whatsapp || "Não informado"}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-6">
              <h2 className="text-lg font-semibold text-zinc-900">Redes sociais</h2>

              <div className="mt-4 space-y-2 text-zinc-600">
                <p>{config.instagram_url || "Instagram não informado"}</p>
                <p>{config.facebook_url || "Facebook não informado"}</p>
                <p>{config.youtube_url || "YouTube não informado"}</p>
              </div>
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