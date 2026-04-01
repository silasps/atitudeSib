import type { ProjectTheme } from "@/types/public-section";

export const projectTheme: ProjectTheme = {
  name: "O Atitude",
  logo: "/logo-atitude.svg",
  colors: {
    primary: "#0f766e",
    secondary: "#f4f4f5",
    accent: "#f97316",
    background: "#ffffff",
  },
  heroMedia: {
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    alt: "Voluntários com crianças",
    position: "full",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      title: "Transformando vidas através da educação, esporte e inclusão",
      description:
        "A ATITUDE é uma organização social sem fins lucrativos que atua em Almirante Tamandaré (PR), promovendo o desenvolvimento humano por meio da educação, cultura, esporte e assistência social. Nosso foco é atender crianças, adolescentes e idosos em situação de vulnerabilidade, oferecendo oportunidades reais de crescimento, inclusão e cidadania. Aqui, acreditamos que cada pessoa tem potencial — e trabalhamos diariamente para desenvolver isso.",
      media: {
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=80",
        alt: "Infância brincando",
        position: "full",
      },
      cta: { label: "Faça parte", href: "/seja-voluntario" },
    },
    {
      id: "who",
      type: "who",
      title: "Quem somos",
      description:
        "A ATITUDE é uma Organização da Sociedade Civil fundada em setembro de 2021, com o propósito de promover transformação social por meio de ações práticas e acessíveis. Atuamos diretamente com a comunidade do bairro Lamenha Grande, desenvolvendo projetos que impactam vidas em diversas áreas como educação, esporte, cultura e assistência social. Nosso trabalho é voltado para pessoas em situação de vulnerabilidade social, buscando não apenas atender necessidades imediatas, mas também gerar oportunidades de desenvolvimento a longo prazo.",
      media: {
        url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
        alt: "Voluntários em roda",
      },
    },
    {
      id: "mission",
      type: "mission",
      title: "Nossa missão",
      description:
        "Promover o desenvolvimento do ser humano como cidadão, fortalecendo suas potencialidades por meio da inclusão social.",
      list: ["Educação", "Cultura", "Esporte", "Assistência social", "Voluntariado"],
    },
    {
      id: "audience",
      type: "audience",
      title: "Público atendido",
      description:
        "Atendemos crianças (a partir de 3 anos), adolescentes (até 18 anos) e idosos (a partir de 50 anos) em situação de vulnerabilidade social na região de Lamenha Grande, em Almirante Tamandaré/PR.",
      media: {
        url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
        alt: "Família sorrindo",
        position: "left",
      },
    },
    {
      id: "projects",
      type: "projects",
      title: "Projetos em andamento",
      description:
        "A ATITUDE desenvolve projetos contínuos e novos projetos em implantação, sempre com foco no desenvolvimento humano e social.",
      projects: [
        {
          title: "Artesanato",
          description:
            "Aulas para idosos com crochê e bordado que promovem integração social e geração de renda.",
          media: {
            url: "https://images.unsplash.com/photo-1582719478179-4a9ac33b4f53?auto=format&fit=crop&w=900&q=80",
          },
        },
        {
          title: "Pilates",
          description:
            "Atividades que melhoram a qualidade de vida dos idosos, reduzindo dores e fortalecendo habilidades motoras.",
        },
        {
          title: "Balé",
          description:
            "Turmas para crianças de 3 a 12 anos com foco no desenvolvimento físico, disciplina e socialização.",
        },
        {
          title: "Jiu-Jitsu",
          description:
            "Práticas para crianças e adolescentes que reforçam valores como disciplina, respeito e autoconfiança.",
        },
      ],
    },
    {
      id: "projects-future",
      type: "projects",
      title: "Projetos em implantação",
      description:
        "Novas frentes que ampliam o impacto, com habilidades digitais e linguagem artística.",
      projects: [
        {
          title: "Computação",
          description: "Ensino de informática básica para alfabetização digital e cognição.",
        },
        {
          title: "Música – Violão e teoria",
          description:
            "Aulas que desenvolvem a expressão emocional, social e motora por meio da música.",
        },
      ],
    },
    {
      id: "offer",
      type: "offer",
      title: "O que oferecemos",
      description:
        "Em cada projeto, os participantes recebem educadores capacitados, material didático, materiais específicos das atividades e lanches. Nosso objetivo é garantir um ambiente completo de aprendizado e cuidado.",
      stats: [
        { label: "Educadores capacitados", value: "Equipe multidisciplinar" },
        { label: "Materiais", value: "Didático, esportivo e artístico" },
        { label: "Lanches", value: "Apoio nutricional diário" },
      ],
    },
    {
      id: "process",
      type: "process",
      title: "Como funciona",
      description:
        "Os projetos acontecem semanalmente, com turmas organizadas por faixa etária e tipo de atividade. Cada aula promove aprendizado contínuo, desenvolvimento pessoal e integração social.",
    },
    {
      id: "team",
      type: "team",
      title: "Equipe",
      description:
        "Nossa equipe é formada por profissionais comprometidos com a transformação social, com educadores sociais, equipe administrativa e apoio operacional atuando diretamente nos projetos e no cuidado das pessoas.",
      media: {
        url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
      },
    },
    {
      id: "structure",
      type: "structure",
      title: "Estrutura",
      description:
        "Contamos com materiais pedagógicos, equipamentos esportivos e musicais, estrutura de apoio e higiene e alimentação para os participantes.",
      media: {
        url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      },
    },
    {
      id: "map",
      type: "map",
      title: "Localização",
      iframe:
        '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3605.8885344309797!2d-49.30531852292738!3d-25.341521129399922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dcde1c2ca6206b%3A0xbf54265a9f3ecaa5!2sSegunda%20Igreja%20Batista%20de%20Almirante%20Tamandar%C3%A9!5e0!3m2!1spt-BR!2sbr!4v1775052360142!5m2!1spt-BR!2sbr" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
      description: "Venha nos visitar em Lamenha Grande, Almirante Tamandaré / PR.",
    },
    {
      id: "contact",
      type: "contact",
      title: "Contato",
      description:
        "📍 Almirante Tamandaré – PR · Bairro Lamenha Grande · 📞 (41) 99288-1025 · Entre em contato para participar, apoiar ou saber mais.",
      cta: { label: "Agendar conversa", href: "/contato" },
    },
    {
      id: "cta",
      type: "cta",
      title: "Faça parte",
      description:
        "A cada semana, voluntários, parceiros e famílias constroem juntos a transformação. Contribua com o O Atitude com tempo, doações ou visibilidade.",
      cta: { label: "Seja voluntário", href: "/seja-voluntario" },
    },
  ],
};
