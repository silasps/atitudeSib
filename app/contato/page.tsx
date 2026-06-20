import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from "lucide-react";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import {
  buildPageMetadata,
  getInstitutionalContent,
  getPublicSiteConfig,
  sanitizePhoneForWhatsApp,
  splitLabelDescription,
} from "@/lib/public-site";

export async function generateMetadata() {
  const config = await getPublicSiteConfig();
  const institutionalContent = getInstitutionalContent(config);

  return buildPageMetadata(config, {
    title: "Contato",
    path: "/contato",
    description:
      institutionalContent.address ||
      "Entre em contato com o Atitude para conversar sobre voluntariado, parcerias e apoio institucional.",
    keywords: [
      "contato",
      "parceria institucional",
      "voluntariado",
      "Almirante Tamandaré",
      "projeto atitude",
    ],
  });
}

export default async function ContatoPage() {
  const config = await getPublicSiteConfig();
  const institutionalContent = getInstitutionalContent(config);

  const whatsappLink =
    sanitizePhoneForWhatsApp(config.contact_whatsapp) ??
    sanitizePhoneForWhatsApp(config.contact_phone);
  const contactPhoneLink = sanitizePhoneForWhatsApp(config.contact_phone);
  const emailHref = config.contact_email
    ? `mailto:${config.contact_email}`
    : undefined;

  const socialCards = [
    {
      href: config.instagram_url,
      label: "Instagram",
      icon: Instagram,
    },
    {
      href: config.facebook_url,
      label: "Facebook",
      icon: Facebook,
    },
    {
      href: config.youtube_url,
      label: "YouTube",
      icon: Youtube,
    },
  ].filter((item) => item.href);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-zinc-950">
      <PublicHeader
        projectName={config.project_name}
        projectSubtitle={config.project_subtitle}
      />

      <main className="space-y-12 px-6 py-12 md:px-10 md:py-16">
        <section className="mx-auto max-w-6xl rounded-[2.5rem] border border-zinc-200 bg-white p-8 shadow-sm lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">
                Contato direto
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl">
                Converse com a equipe e aproxime-se das frentes do projeto
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-600">
                Use o canal mais confortável para você. A página pública agora
                concentra informações institucionais, canais reais e caminhos para
                parceria, voluntariado e apoio ao território.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {emailHref ? (
                  <a
                    href={emailHref}
                    className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
                  >
                    <Mail size={16} />
                    {config.contact_email}
                  </a>
                ) : null}
                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900"
                  >
                    <MessageCircle size={16} />
                    {config.contact_whatsapp || config.contact_phone}
                  </a>
                ) : null}
              </div>
            </div>

            <article className="rounded-[2rem] bg-zinc-950 p-6 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <MapPin size={18} />
                <p className="text-xs uppercase tracking-[0.35em] text-white/65">
                  Base territorial
                </p>
              </div>
              <p className="mt-4 text-base leading-8 text-white/82">
                {institutionalContent.address}
              </p>
              {contactPhoneLink ? (
                <a
                  href={contactPhoneLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white"
                >
                  <Phone size={16} />
                  Iniciar conversa
                </a>
              ) : null}
            </article>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-zinc-500" />
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                E-mail
              </p>
            </div>
            <p className="mt-4 text-lg font-semibold text-zinc-950">
              {config.contact_email || "Não informado"}
            </p>
          </article>
          <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-zinc-500" />
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Telefone
              </p>
            </div>
            <p className="mt-4 text-lg font-semibold text-zinc-950">
              {config.contact_phone || "Não informado"}
            </p>
          </article>
          <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <MessageCircle size={18} className="text-zinc-500" />
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                WhatsApp
              </p>
            </div>
            <p className="mt-4 text-lg font-semibold text-zinc-950">
              {config.contact_whatsapp || "Não informado"}
            </p>
          </article>
        </section>

        {socialCards.length > 0 ? (
          <section className="mx-auto max-w-6xl rounded-[2rem] border border-zinc-200 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_55%,#fefce8_100%)] p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
              Redes e presença digital
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              {socialCards.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm"
                  >
                    <Icon size={18} />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
              Equipe e diretoria
            </p>
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

          <article className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
              Recursos e infraestrutura
            </p>
            <div className="mt-6 space-y-4">
              {institutionalContent.resourceHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-5"
                >
                  <p className="text-sm leading-7 text-zinc-600">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
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
