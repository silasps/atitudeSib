import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type SiteConfig = {
  project_name: string;
  project_subtitle: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
};

const defaultContact: SiteConfig = {
  project_name: "O Atitude",
  project_subtitle: "Projeto Escola Social",
  contact_email: "contato@oatitude.org.br",
  contact_phone: "(41) 9 99288-1025",
  contact_whatsapp: "(41) 9 99288-1025",
};

function sanitizePhoneForWhatsApp(value?: string) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/+${withCountry}`;
}

export default async function ContatoPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("site_config")
    .select(
      "project_name,project_subtitle,contact_email,contact_phone,contact_whatsapp"
    )
    .limit(1)
    .maybeSingle();

  const config = data
    ? {
        project_name: data.project_name ?? defaultContact.project_name,
        project_subtitle: data.project_subtitle ?? defaultContact.project_subtitle,
        contact_email: data.contact_email ?? defaultContact.contact_email,
        contact_phone: data.contact_phone ?? defaultContact.contact_phone,
        contact_whatsapp: data.contact_whatsapp ?? defaultContact.contact_whatsapp,
      }
    : defaultContact;

  const whatsappLink =
    sanitizePhoneForWhatsApp(config.contact_whatsapp) ??
    sanitizePhoneForWhatsApp(config.contact_phone);
  const contactPhoneLink = sanitizePhoneForWhatsApp(config.contact_phone);
  const emailHref = config.contact_email
    ? `mailto:${config.contact_email}`
    : undefined;

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <PublicHeader
        projectName={config.project_name}
        projectSubtitle={config.project_subtitle}
      />

      <main className="space-y-10 px-6 py-12 md:px-10">
        <section className="mx-auto max-w-5xl space-y-6 rounded-3xl border border-zinc-200 bg-gradient-to-br from-emerald-600 to-cyan-500 p-8 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.4em] text-white/80">
            Contato direto
          </p>
          <h1 className="text-3xl font-bold">Converse com O Atitude</h1>
          <p className="text-sm text-white/90">
            Estamos em Almirante Tamandaré, no bairro Lamenha Grande. Para falar com a
            equipe administrativa ou acertar uma parceria, use o canal de sua preferência.
          </p>
          <div className="space-y-2 text-sm">
            {emailHref ? (
              <a
                href={emailHref}
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white transition hover:bg-white/35"
              >
                E-mail: {config.contact_email}
              </a>
            ) : (
              <p>E-mail: {config.contact_email}</p>
            )}
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white transition hover:bg-white/35"
              >
                WhatsApp: {config.contact_whatsapp || config.contact_phone}
              </a>
            ) : (
              <p>WhatsApp: {config.contact_whatsapp || config.contact_phone}</p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-4xl space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-900">Equipe e rotina</h2>
          <p className="text-sm text-zinc-700">
            Nossa equipe reúne educadores sociais, apoio administrativo e apoio operacional
            dedicados à transformação de crianças, adolescentes e idosos em situação de
            vulnerabilidade social.
          </p>
          <ul className="space-y-1 text-sm text-zinc-700">
            <li>Diretor Presidente: Raimundo Alberto Gonçalves da Silva</li>
            <li>Primeira Secretária: Edilsem Cristina Mengarda Figueirôa</li>
            <li>Segunda Secretária: Jessica Domingues</li>
            <li>Primeiro Tesoureiro: Welliton da Silva Santo</li>
            <li>Segunda Tesoureira: Cristiane Ribeiro Martins</li>
            <li>
              Conselho Fiscal: Maria da Penha Silva dos Santos · Reinaldo Vicente
              Traczynski
            </li>
          </ul>
        </section>

        <section className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-zinc-900">Recursos e infraestrutura</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700">
            <li>Recursos para higiene e limpeza distribuídos mensalmente.</li>
            <li>Material didático, equipamentos esportivos e musicais sempre em estoque.</li>
            <li>Materiais específicos (kimonos, violões, halteres, tatames) comprados sob demanda.</li>
            <li>Recursos para alimentação garantidos semanalmente.</li>
          </ul>
        </section>

        <section className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-zinc-900">Localização</h3>
          <p className="text-sm text-zinc-700">
            Rua Vereador Wadislau Bugalski, 3827 · Lamenha Grande · Almirante Tamandaré - PR
          </p>
          {contactPhoneLink && (
            <p className="text-sm text-zinc-700">
              Clique para iniciar conversa no WhatsApp:{' '}
              <a
                href={contactPhoneLink}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-emerald-600"
              >
                {config.contact_phone}
              </a>
            </p>
          )}
        </section>
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
