import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  isNecessidadePublicamenteDisponivel,
  toNecessidadePublicaView,
  type NecessidadePublicaRecord,
} from "@/lib/voluntariado-necessidades-publicas";

type SiteConfig = {
  project_name: string;
  project_subtitle: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
};

const defaultConfig: SiteConfig = {
  project_name: "Atitude",
  project_subtitle: "Projeto Escola Social",
  contact_email: "",
  contact_phone: "+55 41 99288-1025",
  contact_whatsapp: "+55 41 99288-1025",
};

function formatDateTime(dateString: string | null) {
  if (!dateString) return "Sem data limite definida";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

export default async function VagaVoluntariadoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const necessidadeId = Number(id);

  if (!Number.isInteger(necessidadeId) || necessidadeId <= 0) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();

  const [{ data: configData }, { data, error }, { data: relatedData }] =
    await Promise.all([
      supabase.from("site_config").select("*").limit(1).maybeSingle(),
      supabase
        .from("necessidades_voluntariado")
        .select(
          "id, titulo_publico, descricao, quantidade_total, quantidade_aprovada, data_limite_inscricao_em, status, exibir_publicamente"
        )
        .eq("id", necessidadeId)
        .maybeSingle(),
      supabase
        .from("necessidades_voluntariado")
        .select(
          "id, titulo_publico, descricao, quantidade_total, quantidade_aprovada, data_limite_inscricao_em, status, exibir_publicamente"
        )
        .neq("id", necessidadeId)
        .eq("status", "aberta")
        .eq("exibir_publicamente", true)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  if (error || !data) {
    notFound();
  }

  const record = data as NecessidadePublicaRecord;

  if (!isNecessidadePublicamenteDisponivel(record)) {
    notFound();
  }

  const necessidade = toNecessidadePublicaView(record);
  const related = ((relatedData ?? []) as NecessidadePublicaRecord[])
    .filter((item) => isNecessidadePublicamenteDisponivel(item))
    .map(toNecessidadePublicaView)
    .slice(0, 2);

  const config = ((configData as Partial<SiteConfig> | null) ?? {});
  const siteConfig = { ...defaultConfig, ...config };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <PublicHeader
        projectName={siteConfig.project_name}
        projectSubtitle={siteConfig.project_subtitle}
      />

      <main className="pb-16">
        <section className="relative overflow-hidden bg-zinc-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.25),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.22),_transparent_30%)]" />
          {necessidade.content.imagemUrl ? (
            <div className="absolute inset-0 opacity-30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={necessidade.content.imagemUrl}
                alt={necessidade.content.imagemAlt || necessidade.titulo_publico}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/50" />

          <div className="relative mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-18">
            <Link
              href="/seja-voluntario"
              className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur"
            >
              ← Voltar para oportunidades
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-teal-200">
                  Oportunidade aberta
                </p>
                <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">
                  {necessidade.titulo_publico}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/82">
                  {necessidade.content.resumoCurto ||
                    "Uma oportunidade para quem quer somar habilidades, presença e cuidado com a comunidade."}
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white">
                    {necessidade.vagasRestantes} vagas restantes
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white">
                    {necessidade.content.formatoAtuacao || "Formato a combinar"}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white">
                    {necessidade.content.localAtuacao || "Local informado após contato"}
                  </span>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.35em] text-white/65">
                  Inscrição
                </p>
                <div className="mt-5 space-y-3 text-sm text-white/82">
                  <p>
                    <span className="font-medium text-white">Prazo:</span>{" "}
                    {formatDateTime(necessidade.data_limite_inscricao_em)}
                  </p>
                  <p>
                    <span className="font-medium text-white">Carga horária:</span>{" "}
                    {necessidade.content.cargaHoraria || "Definida com a coordenação"}
                  </p>
                  <p>
                    <span className="font-medium text-white">Período:</span>{" "}
                    {necessidade.content.periodo || "Alinhado conforme disponibilidade"}
                  </p>
                </div>

                <Link
                  href={`/seja-voluntario/cadastro?necessidade=${necessidade.id}`}
                  className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
                >
                  Quero me candidatar a esta vaga
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1fr_0.38fr]">
          <div className="space-y-6">
            <article className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                Sobre a atuação
              </p>
              <div className="mt-5 space-y-4 text-sm leading-8 text-zinc-700">
                {necessidade.content.descricaoCompleta ? (
                  necessidade.content.descricaoCompleta
                    .split(/\n{2,}/)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean)
                    .map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                ) : (
                  <p>
                    A coordenação compartilha mais detalhes desta oportunidade
                    durante o processo de candidatura.
                  </p>
                )}
              </div>
            </article>

            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                  O que você vai fazer
                </p>
                {necessidade.content.atividades.length > 0 ? (
                  <ul className="mt-5 space-y-3 text-sm leading-7 text-zinc-700">
                    {necessidade.content.atividades.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-teal-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 text-sm leading-7 text-zinc-600">
                    As atividades são alinhadas conforme a rotina da instituição e
                    a disponibilidade do voluntário.
                  </p>
                )}
              </article>

              <article className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                  Perfil desejado
                </p>
                {necessidade.content.perfilDesejado.length > 0 ? (
                  <ul className="mt-5 space-y-3 text-sm leading-7 text-zinc-700">
                    {necessidade.content.perfilDesejado.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-amber-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 text-sm leading-7 text-zinc-600">
                    Procuramos pessoas comprometidas, disponíveis para aprender e
                    prontas para atuar com responsabilidade e respeito.
                  </p>
                )}
              </article>
            </div>

            {necessidade.content.diferenciais.length > 0 ? (
              <article className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                  Diferenciais desta vaga
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {necessidade.content.diferenciais.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                Informações rápidas
              </p>
              <div className="mt-5 space-y-4 text-sm text-zinc-700">
                <p>
                  <span className="font-medium text-zinc-900">Local:</span>{" "}
                  {necessidade.content.localAtuacao || "Informado após o primeiro contato"}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">Formato:</span>{" "}
                  {necessidade.content.formatoAtuacao || "A combinar"}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">Carga horária:</span>{" "}
                  {necessidade.content.cargaHoraria || "Definida com a coordenação"}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">Período:</span>{" "}
                  {necessidade.content.periodo || "Conforme disponibilidade"}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">Prazo:</span>{" "}
                  {formatDateTime(necessidade.data_limite_inscricao_em)}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-gradient-to-br from-teal-600 via-emerald-500 to-cyan-600 p-6 text-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                Próximo passo
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Curtiu a vaga?
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/88">
                Faça sua inscrição e siga para o termo de voluntariado. A equipe
                analisa sua candidatura e entra em contato.
              </p>
              <Link
                href={`/seja-voluntario/cadastro?necessidade=${necessidade.id}`}
                className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950"
              >
                Ir para inscrição
              </Link>
            </div>
          </aside>
        </section>

        {related.length > 0 ? (
          <section className="mx-auto max-w-6xl px-6 pb-4 md:px-10">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                    Outras oportunidades
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
                    Você também pode gostar destas vagas
                  </h2>
                </div>
                <Link
                  href="/seja-voluntario"
                  className="text-sm font-semibold text-zinc-900"
                >
                  Ver todas →
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/seja-voluntario/${item.id}`}
                    className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 transition hover:border-zinc-300"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      {item.content.formatoAtuacao || "Oportunidade aberta"}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-zinc-900">
                      {item.titulo_publico}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-600">
                      {item.content.resumoCurto}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <PublicFooter
        projectName={siteConfig.project_name}
        projectSubtitle={siteConfig.project_subtitle}
        contactEmail={siteConfig.contact_email}
        contactPhone={siteConfig.contact_phone}
        contactWhatsapp={siteConfig.contact_whatsapp}
      />
    </div>
  );
}
