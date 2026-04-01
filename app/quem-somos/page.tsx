import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

const quemSomosText = [
  "A ATITUDE é uma Organização da Sociedade Civil, criada em setembro de 2021 em Almirante Tamandaré, Paraná, sem fins lucrativos, que atua na assistência social através das áreas de educação, esporte, música, voluntariado e ações socioassistenciais.",
  "Nosso foco é garantir inclusão social e cidadania com projetos direcionados à comunidade do bairro Lamenha Grande.",
  "Atendemos crianças, adolescentes e idosos em situação de vulnerabilidade, articulando oportunidades reais de transformação.",
];

export default function QuemSomosPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <PublicHeader projectName="O Atitude" projectSubtitle="Projeto Escola Social" />

      <section className="mx-auto max-w-5xl space-y-8 px-6 py-16">
        <article className="space-y-4 rounded-3xl border border-zinc-200 bg-gradient-to-br from-emerald-500 to-teal-500 p-8 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.4em] text-white/80">Quem somos</p>
          <h1 className="text-3xl font-bold">Projeto Escola Social</h1>
          <p className="text-sm text-white/90">
            O Atitude promove o desenvolvimento humano por meio da educação, cultura, esporte,
            assistência social e voluntariado.
          </p>
        </article>

        <article className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-900">Apresentação</h2>
          <div className="space-y-3 text-sm text-zinc-700">
            {quemSomosText.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-zinc-900">Nossa missão</h3>
          <p className="mt-3 text-sm text-zinc-600">
            Promover o ser humano como cidadão, desenvolvendo potencialidades pela inclusão
            social e cidadania com ações culturais, artísticas, esportivas, socioeducativas,
            assistência social, educação e voluntariado.
          </p>
        </article>
      </section>

      <PublicFooter
        projectName="O Atitude"
        projectSubtitle="Projeto Escola Social"
        contactEmail=""
        contactPhone="+55 41 99288-1025"
        contactWhatsapp="+55 41 99288-1025"
      />
    </main>
  );
}
