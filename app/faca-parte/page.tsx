import Link from "next/link";
import {
  ArrowRight,
  HandCoins,
  HeartHandshake,
  Package,
  Users2,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  buildPageMetadata,
  getInstitutionalContent,
  getPublicSiteConfig,
} from "@/lib/public-site";

export async function generateMetadata() {
  const config = await getPublicSiteConfig();

  return buildPageMetadata(config, {
    title: "Faça parte",
    path: "/faca-parte",
    description:
      "Descubra formas de apoiar o Atitude com voluntariado, parcerias institucionais e recursos para as atividades do projeto.",
    keywords: [
      "faça parte",
      "apoio institucional",
      "parceria social",
      "doação",
      "voluntariado",
    ],
  });
}

export default async function FacaPartePage() {
  const config = await getPublicSiteConfig();
  const institutionalContent = getInstitutionalContent(config);
  const supabase = await createSupabaseServerClient();
  const [{ count: openNeedsCount }, { count: activeFunctionsCount }] =
    await Promise.all([
      supabase
        .from("necessidades_voluntariado")
        .select("id", { count: "exact", head: true })
        .eq("status", "aberta")
        .eq("exibir_publicamente", true),
      supabase
        .from("funcoes_voluntariado")
        .select("id", { count: "exact", head: true })
        .eq("ativo", true),
    ]);

  const participationWays = [
    {
      title: "Voluntariado direto",
      description:
        "Entre nas oportunidades abertas e descubra onde sua presença pode fortalecer o atendimento, a escuta e a rotina das atividades.",
      actionLabel: config.hero_button_primary_text || "Ver oportunidades",
      href: config.hero_button_primary_link || "/seja-voluntario",
      icon: HeartHandshake,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      title: "Parcerias institucionais",
      description:
        "Converse com a equipe sobre articulações, apoio continuado, patrocínio de frentes e conexões com empresas e redes locais.",
      actionLabel: config.hero_button_secondary_text || "Falar com a equipe",
      href: config.hero_button_secondary_link || "/contato",
      icon: HandCoins,
      accent: "from-zinc-950 to-zinc-700",
    },
    {
      title: "Recursos para o território",
      description:
        "Itens de infraestrutura, materiais didáticos, alimentação e recursos específicos ajudam o projeto a operar com qualidade e constância.",
      actionLabel: "Entender necessidades",
      href: "/contato",
      icon: Package,
      accent: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_40%,#f8fafc_100%)] text-zinc-950">
      <PublicHeader
        projectName={config.project_name}
        projectSubtitle={config.project_subtitle}
      />

      <main className="space-y-12 px-6 py-12 md:px-10 md:py-16">
        <section className="mx-auto max-w-6xl rounded-[2.5rem] border border-zinc-200 bg-white p-8 shadow-sm lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">
                Faça parte
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl">
                Conecte sua energia a um projeto que transforma o cotidiano da comunidade
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-600">
                O Atitude cresce quando voluntários, parceiros e apoiadores entram
                em movimento junto com a equipe. Aqui você encontra caminhos
                claros para participar com sentido, impacto e continuidade.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-medium text-emerald-800">
                  {openNeedsCount ?? 0} oportunidades abertas
                </span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 font-medium text-zinc-700">
                  {activeFunctionsCount ?? 0} frentes com necessidade de apoio
                </span>
              </div>
            </div>

            <article className="rounded-[2rem] bg-zinc-950 p-6 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <Users2 size={18} />
                <p className="text-xs uppercase tracking-[0.35em] text-white/65">
                  O que sua participação sustenta
                </p>
              </div>
              <p className="mt-4 text-sm leading-8 text-white/82">
                Projetos regulares, acolhimento, equipe de referência, materiais
                pedagógicos, estrutura de atendimento e novas expansões para o
                bairro Lamenha Grande.
              </p>
            </article>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
          {participationWays.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm"
              >
                <div className={`bg-gradient-to-r ${card.accent} p-6 text-white`}>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    <Icon size={20} />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold">{card.title}</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-7 text-zinc-600">{card.description}</p>
                  <Link
                    href={card.href}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:border-zinc-400"
                  >
                    {card.actionLabel}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-zinc-200 bg-zinc-950 p-8 text-white shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              Apoio que vira estrutura
            </p>
            <h2 className="mt-4 text-3xl font-semibold">
              Recursos que mantêm a qualidade das atividades
            </h2>
            <p className="mt-4 text-sm leading-8 text-white/78">
              Os projetos dependem de continuidade operacional. Quando o apoio
              chega, ele se transforma em materiais, manutenção, equipe,
              alimentação e capacidade de acolher melhor cada turma.
            </p>
          </article>

          <div className="grid gap-4 md:grid-cols-2">
            {institutionalContent.resourceHighlights.map((item) => (
              <article
                key={item}
                className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                    <Package size={18} />
                  </span>
                  <p className="text-sm leading-7 text-zinc-600">{item}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl rounded-[2rem] border border-zinc-200 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_55%,#fefce8_100%)] p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
            Frentes atuais
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-zinc-950">
            Áreas que sua colaboração ajuda a fortalecer
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {institutionalContent.activeProjects.map((item) => (
              <span
                key={item}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
              >
                {item.split(":")[0]}
              </span>
            ))}
          </div>
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
