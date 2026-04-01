import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

const projectsInProgress = [
  {
    title: "Artesanato",
    description:
      "Aulas semanais com crochê e bordado para cerca de 10 idosos, criando renda extra e interação social.",
  },
  {
    title: "Pilates",
    description:
      "Turmas aos sábados que fortalecem o corpo e reduzem dores, beneficiando quem busca qualidade de vida.",
  },
  {
    title: "Balé",
    description:
      "Três turmas para crianças de 3 a 12 anos que trabalham disciplina, físico e cidadania.",
  },
  {
    title: "Jiu-Jitsu",
    description:
      "Aulas para crianças e adolescentes em situação de risco, ensinando disciplina, respeito e autoconfiança.",
  },
];

const upcomingProjects = [
  {
    title: "Computação",
    description:
      "Aulas de informática básica para alfabetização tecnológica, criatividade e concentração.",
  },
  {
    title: "Violão e teoria musical",
    description:
      "O som como ferramenta de desenvolvimento cognitivo, emocional e social para crianças.",
  },
];

const resources = [
  "Educadores sociais com metodologia pedagógica atualizada",
  "Material didático e específico para cada projeto",
  "Lanches e apoio alimentar durante as atividades",
  "Materiais de limpeza e higiene para manter o espaço saudável",
];

const structureItems = [
  "Materiais pedagógicos e insumos impressos",
  "Equipamentos esportivos, musicais e de artesanato",
  "Ambiente de apoio, higiene e alimentação para participantes",
  "Voluntariado capacitado e equipe administrativa atuando 20h semanais",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <PublicHeader projectName="O Atitude" projectSubtitle="Projeto Escola Social" />

      <main className="space-y-16 px-6 py-10 md:px-8">
        <section className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-emerald-500 to-cyan-500 p-8 text-white shadow-xl">
            <p className="text-sm uppercase tracking-[0.4em] text-white/90">Projeto Escola Social</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              Transformando vidas por meio da educação, esporte e inclusão
            </h1>
            <p className="mt-4 text-lg text-white/90">
              A ATITUDE é uma Organização da Sociedade Civil fundada em setembro de 2021 em
              Almirante Tamandaré (PR). Atuamos com educação, esporte, música, voluntariado e assistência
              social para promover inclusão e cidadania.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900">
                Faça parte
              </button>
              <button className="rounded-full border border-white/70 px-6 py-3 text-sm text-white">
                Conheça nossos projetos
              </button>
            </div>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-zinc-900">Objetivo Geral</h2>
            <p className="mt-3 text-zinc-600">
              Promover o ser humano como cidadão, desenvolvendo suas potencialidades por meio de ações
              culturais, artísticas, esportivas, socioeducativas, assistência social, educação e voluntariado.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-zinc-900">Público atendido</h3>
            <p className="mt-3 text-zinc-600">
              Crianças de 3 a 12 anos, adolescentes até 18 anos e idosos a partir de 50 anos em
              vulnerabilidade no bairro Lamenha Grande, em Almirante Tamandaré/PR.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700">
              <li>• Inclusão social com orientação pedagógica</li>
              <li>• Desenvolvimento de cidadania e potencialidades</li>
              <li>• Apoio socioeconômico e convivência em grupo</li>
            </ul>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-zinc-900">Equipe e Recursos</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700">
              <li>• 02 educadores sociais</li>
              <li>• 01 serviço geral e 01 secretário</li>
              <li>• Todos atuam 20h semanais</li>
              {resources.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Projetos</p>
              <h2 className="text-3xl font-semibold">Em andamento</h2>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {projectsInProgress.map((project) => (
              <article
                key={project.title}
                className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-5 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-zinc-900">{project.title}</h3>
                <p className="mt-2 text-sm text-zinc-700">{project.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Em breve</p>
              <h2 className="text-3xl font-semibold">Projetos que serão implantados</h2>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {upcomingProjects.map((project) => (
              <article
                key={project.title}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-zinc-900">{project.title}</h3>
                <p className="mt-2 text-sm text-zinc-700">{project.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-900">O que cada projeto oferece</h2>
          <p className="mt-3 text-zinc-600">
            Cada aluno recebe educadores sociais, material didático, materiais específicos e lanches em
            um ambiente acolhedor.
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold">Como funciona</h2>
            <p className="text-sm text-zinc-500">
              Projetos semanais com turmas por idade. Aprendizado, desenvolvimento pessoal e integração social.
            </p>
          </div>
          <p className="text-sm text-zinc-700">
            As aulas são estruturadas para oferecer aprendizado contínuo, desenvolvimento das potencialidades e
            convívio saudável.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-zinc-900">Equipe</h3>
            <p className="mt-3 text-sm text-zinc-600">
              Profissionais comprometidos: educadores sociais, equipe administrativa e apoio operacional atuando
              diretamente nos projetos.
            </p>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-zinc-900">Estrutura</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700">
              {structureItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-zinc-900">Recursos diversos</h3>
            <p className="mt-3 text-sm text-zinc-600">
              Recursos mensais garantem alimentação saudável para os participantes e apoio logístico constante.
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-900">Ficha técnica</h2>
          <ul className="mt-3 space-y-1 text-sm text-zinc-700">
            <li>Diretor Presidente: Raimundo Alberto Gonçalves da Silva</li>
            <li>Primeira Secretária: Edilsem Cristina Mengarda Figueirôa</li>
            <li>Segunda Secretária: Jessica Domingues</li>
            <li>Primeiro Tesoureiro: Welliton da Silva Santo</li>
            <li>Segunda Tesoureira: Cristiane Ribeiro Martins</li>
            <li>Conselho Fiscal: Maria da Penha Silva dos Santos, Reinaldo Vicente Traczynski</li>
          </ul>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Contato</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-900">ASSOCIAÇÃO ATITUDE</h2>
            <p className="mt-3 text-sm text-zinc-600">
              CNPJ: 47.462.832/0001-93<br />
              R Vereador Wadislau Bugalski, 3827<br />
              Lamenha Grande, Almirante Tamandaré - PR<br />
              TEL: +55 41 99288-1025
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="https://wa.me/5541992881025"
                className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white"
              >
                Entrar em contato
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-zinc-900">Projetos + Estrutura</h3>
            <p className="mt-3 text-sm text-zinc-600">
              A compra de materiais é mensal, exceto itens específicos (uniformes, instrumentos) comprados sob demanda.
            </p>
            <p className="mt-3 text-sm text-zinc-600">
              Recursos para limpeza, higiene, material didático e alimentação garantem um ambiente completo para cada aluno.
            </p>
          </div>
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
