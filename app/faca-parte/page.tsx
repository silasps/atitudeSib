import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

const callToActions = [
  {
    title: "Voluntariado",
    description:
      "Participe nas aulas de artesanato, pilates, balé e jiu-jitsu levando conhecimento e atenção às pessoas atendidas.",
    action: { label: "Ver oportunidades", href: "/seja-voluntario" },
  },
  {
    title: "Apoio institucional",
    description:
      "Doações de materiais, alimentos e equipamentos ajudam a manter a estrutura de atendimentos e fortalecer novos projetos.",
    action: { label: "Contribua com o O Atitude", href: "/contato" },
  },
];

export default function FacaPartePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <PublicHeader projectName="O Atitude" projectSubtitle="Projeto Escola Social" />

      <main className="space-y-10 px-6 py-12 md:px-10">
        <section className="mx-auto max-w-4xl space-y-4 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Faça parte</p>
          <h1 className="text-3xl font-bold text-zinc-900">Conecte-se com a transformação social</h1>
          <p className="text-sm text-zinc-600">
            O Atitude depende de voluntários, parceiros e apoiadores para continuar oferecendo educação, esporte,
            música e assistência social. Sua presença é essencial para gerar impacto nas pessoas atendidas.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {callToActions.map((card) => (
            <article
              key={card.title}
              className="flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{card.title}</p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-900">{card.title}</h2>
                <p className="mt-3 text-sm text-zinc-600">{card.description}</p>
              </div>
              <a
                href={card.action.href}
                className="mt-4 inline-flex rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-900"
              >
                {card.action.label}
              </a>
            </article>
          ))}
        </div>
      </main>

      <PublicFooter
        projectName="O Atitude"
        projectSubtitle="Projeto Escola Social"
        contactEmail=""
        contactPhone="+55 41 99288-1025"
        contactWhatsapp="+55 41 99288-1025"
      />
    </div>
  );
}
