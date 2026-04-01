import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

const ongoingProjects = [
  {
    title: "Artesanato",
    details:
      "10 idosos participam aos sábados das 9h30 em atividades como crochê e bordado, promovendo renda e convivência.",
  },
  {
    title: "Pilates",
    details:
      "20 idosos treinam semanalmente, reduzindo dores musculares e fortalecendo autonomia nas atividades diárias.",
  },
  {
    title: "Balé",
    details:
      "Três turmas aos sábados atendem crianças de 3 a 12 anos, reforçando disciplina física e cidadania.",
  },
  {
    title: "Jiu-Jitsu",
    details:
      "Aulas às terças e quintas promovem inclusão de jovens em vulnerabilidade, com foco em respeito e convivência.",
  },
];

const upcomingProjects = [
  {
    title: "Computação",
    details:
      "Aulas de informática básica aos sábados, promovendo alfabetização digital e criatividade.",
  },
  {
    title: "Violão e teoria musical",
    details:
      "Desenvolve habilidades cognitivas, motoras e emocionais por meio da música pela manhã dos sábados.",
  },
];

const resourcesList = [
  "Material didático e materiais específicos das atividades",
  "Educadores sociais experientes",
  "Lanches para os participantes",
  "Equipe operacional e administrativa dedicada",
];

export default function OQueEstamosFazendoPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <PublicHeader projectName="O Atitude" projectSubtitle="Projeto Escola Social" />

      <main className="space-y-12 px-6 py-12 md:px-10">
        <section className="mx-auto max-w-5xl space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Projetos</p>
          <h1 className="text-3xl font-bold text-zinc-900">
            Atendendo crianças, adolescentes e idosos em vulnerabilidade
          </h1>
          <p className="text-sm text-zinc-600">
            A ATITUDE oferece projetos contínuos e novos programas para desenvolver potencialidades e criar oportunidades
            reais de cidadania.
          </p>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-zinc-900">Projetos em andamento</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {ongoingProjects.map((project) => (
              <article
                key={project.title}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-zinc-900">{project.title}</h3>
                <p className="mt-3 text-sm text-zinc-600">{project.details}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-zinc-900">Projetos em implantação</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingProjects.map((project) => (
              <article
                key={project.title}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-zinc-900">{project.title}</h3>
                <p className="mt-3 text-sm text-zinc-600">{project.details}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-900">Em cada projeto oferecemos</h2>
          <ul className="space-y-2 text-sm text-zinc-700">
            {resourcesList.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>
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
