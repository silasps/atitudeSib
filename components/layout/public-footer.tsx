import Link from "next/link";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from "lucide-react";
import { sanitizePhoneForWhatsApp } from "@/lib/public-site";

type PublicFooterProps = {
  projectName: string;
  projectSubtitle?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  addressLine?: string | null;
};

export function PublicFooter({
  projectName,
  projectSubtitle,
  contactEmail,
  contactPhone,
  contactWhatsapp,
  instagramUrl,
  facebookUrl,
  youtubeUrl,
  addressLine,
}: PublicFooterProps) {
  const whatsappLink =
    sanitizePhoneForWhatsApp(contactWhatsapp) ??
    sanitizePhoneForWhatsApp(contactPhone);
  const phoneLink = sanitizePhoneForWhatsApp(contactPhone);
  const socialLinks = [
    {
      href: instagramUrl,
      label: "Instagram",
      icon: Instagram,
    },
    {
      href: facebookUrl,
      label: "Facebook",
      icon: Facebook,
    },
    {
      href: youtubeUrl,
      label: "YouTube",
      icon: Youtube,
    },
  ].filter((item) => item.href);

  return (
    <footer className="border-t border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr]">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
              Presença comunitária
            </div>
            <div>
              <h4 className="text-2xl font-bold text-zinc-950">{projectName}</h4>
              <p className="mt-2 max-w-md text-sm leading-7 text-zinc-600">
                {projectSubtitle ||
                  "Projeto social com educação, cuidado e oportunidades reais para a comunidade."}
              </p>
            </div>

            {socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950"
                    >
                      <Icon size={16} />
                      {item.label}
                    </a>
                  );
                })}
              </div>
            ) : null}
        </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Contato
            </h4>
            <div className="mt-4 space-y-3 text-sm text-zinc-600">
              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 text-zinc-400" />
                {contactEmail ? (
                  <a href={`mailto:${contactEmail}`} className="hover:text-zinc-950">
                    {contactEmail}
                  </a>
                ) : (
                  <p>E-mail não informado</p>
                )}
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 text-zinc-400" />
                {contactPhone ? (
                  <a
                    href={phoneLink ?? undefined}
                    target={phoneLink ? "_blank" : undefined}
                    rel={phoneLink ? "noreferrer" : undefined}
                    className="hover:text-zinc-950"
                  >
                    {contactPhone}
                  </a>
                ) : (
                  <p>Telefone não informado</p>
                )}
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle size={16} className="mt-0.5 text-zinc-400" />
                {contactWhatsapp ? (
                  <a
                    href={whatsappLink ?? undefined}
                    target={whatsappLink ? "_blank" : undefined}
                    rel={whatsappLink ? "noreferrer" : undefined}
                    className="hover:text-zinc-950"
                  >
                    {contactWhatsapp}
                  </a>
                ) : (
                  <p>WhatsApp não informado</p>
                )}
              </div>
              {addressLine ? (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 text-zinc-400" />
                  <p>{addressLine}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Navegação
            </h4>
            <div className="mt-4 space-y-3 text-sm text-zinc-600">
              <p>
                <Link href="/" className="transition hover:text-zinc-950">
                  Início
                </Link>
              </p>
              <p>
                <Link href="/quem-somos" className="transition hover:text-zinc-950">
                  Quem somos
                </Link>
              </p>
              <p>
                <Link
                  href="/o-que-estamos-fazendo"
                  className="transition hover:text-zinc-950"
                >
                  O que fazemos
                </Link>
              </p>
              <p>
                <Link href="/faca-parte" className="transition hover:text-zinc-950">
                  Faça parte
                </Link>
              </p>
              <p>
                <Link
                  href="/seja-voluntario"
                  className="transition hover:text-zinc-950"
                >
                  Seja voluntário
                </Link>
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Conversa aberta
            </p>
            <h4 className="mt-3 text-xl font-semibold text-zinc-950">
              Vamos construir proximidade e confiança
            </h4>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              Use os canais acima para falar com a equipe, conhecer as frentes do
              projeto ou entender como apoiar as atividades em andamento.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-zinc-200 pt-6 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p>
            {projectName} {new Date().getFullYear()}.
          </p>
          <p>Conteúdo institucional, oportunidades e canais atualizados pelo painel.</p>
        </div>
      </div>
    </footer>
  );
}
