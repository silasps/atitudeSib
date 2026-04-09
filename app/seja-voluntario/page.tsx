import Link from "next/link";
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
  if (!dateString) return "Inscrições sem data limite definida";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

export default async function SejaVoluntarioPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: configData }, { data, error }] = await Promise.all([
    supabase.from("site_config").select("*").limit(1).maybeSingle(),
    supabase
      .from("necessidades_voluntariado")
      .select(
        "id, titulo_publico, descricao, quantidade_total, quantidade_aprovada, data_limite_inscricao_em, status, exibir_publicamente"
      )
      .eq("status", "aberta")
      .eq("exibir_publicamente", true)
      .order("created_at", { ascending: false }),
  ]);

  const config = ((configData as Partial<SiteConfig> | null) ?? {});
  const siteConfig = { ...defaultConfig, ...config };

  if (error) {
    console.error("Erro ao buscar necessidades públicas:", error);
  }

  const necessidades = ((data ?? []) as NecessidadePublicaRecord[])
    .filter((item) => isNecessidadePublicamenteDisponivel(item))
    .map(toNecessidadePublicaView);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <PublicHeader
        projectName={siteConfig.project_name}
        projectSubtitle={siteConfig.project_subtitle}
      />

      <main className="pb-16">
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.14),_transparent_35%)]" />
          <div className="relative mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-18">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.45em] text-teal-700">
                  Faça parte
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl">
                  Oportunidades de voluntariado com propósito real e impacto direto
                </h1>
                <p className="max-w-2xl text-base leading-8 text-zinc-600">
                  Veja as vagas abertas, entenda o contexto de cada atuação e
                  escolha onde a sua presença pode gerar transformação concreta.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-zinc-600">
                  <span className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-teal-700">
                    {necessidades.length} oportunidades abertas agora
                  </span>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-amber-700">
                    Inscrição pública e rápida
                  </span>
                </div>
              </div>

              <div className="rounded-[2rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-xl">
                <p className="text-xs uppercase tracking-[0.35em] text-white/65">
                  Como funciona
                </p>
                <div className="mt-5 space-y-4 text-sm leading-7 text-white/84">
                  <p>
                    1. Explore as vagas e abra a página completa para entender a
                    necessidade da instituição.
                  </p>
                  <p>
                    2. Veja rotina, local, perfil esperado e principais atividades
                    antes de se candidatar.
                  </p>
                  <p>
                    3. Preencha seu cadastro somente na oportunidade que faz mais
                    sentido para você.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
          {necessidades.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-semibold text-zinc-900">
                Não há oportunidades abertas no momento
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Novas vagas podem ser publicadas em breve. Você também pode entrar
                em contato com a equipe para acompanhar futuras oportunidades.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {necessidades.map((item, index) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="grid h-full md:grid-cols-[0.95fr_1.05fr]">
                    <div className="relative min-h-[260px] overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-500 to-amber-400">
                      {item.content.imagemUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.content.imagemUrl}
                            alt={item.content.imagemAlt || item.titulo_publico}
                            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </>
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-900/30 to-transparent" />
                      <div className="absolute left-5 top-5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white backdrop-blur">
                        vaga {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="absolute inset-x-5 bottom-5 text-white">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                          {item.content.formatoAtuacao || "Atuação voluntária"}
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold leading-tight">
                          {item.titulo_publico}
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-col p-6">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">
                          {item.vagasRestantes} vagas restantes
                        </span>
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700">
                          {item.content.localAtuacao || "Local a combinar"}
                        </span>
                      </div>

                      <p className="mt-5 text-sm leading-7 text-zinc-600">
                        {item.content.resumoCurto ||
                          "Clique para ver a página completa desta vaga e entender melhor o perfil procurado."}
                      </p>

                      <div className="mt-5 space-y-2 rounded-3xl bg-zinc-50 p-4 text-sm text-zinc-600">
                        <p>
                          <span className="font-medium text-zinc-900">Carga horária:</span>{" "}
                          {item.content.cargaHoraria || "A combinar"}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-900">Período:</span>{" "}
                          {item.content.periodo || "Definido com a coordenação"}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-900">Inscrições até:</span>{" "}
                          {formatDateTime(item.data_limite_inscricao_em)}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href={`/seja-voluntario/${item.id}`}
                          className="inline-flex rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900"
                        >
                          Saiba mais
                        </Link>
                        <Link
                          href={`/seja-voluntario/cadastro?necessidade=${item.id}`}
                          className="inline-flex rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                        >
                          Clique aqui para se inscrever
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
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
