/**
 * Professional facts transcribed from the sections rendered by meta-portifolio.
 * Source commit: 1ccbcde604a26c3e94c916052f39c585f2b09775 (2026-01-19).
 * Files: Hero.jsx, About.jsx, Experience.jsx, TechStack.jsx and Footer.jsx.
 * Demo code snippets and the unused ExperienceSkills.jsx are not profile data.
 */
export const portfolio = {
  name: "Matheus Henrique da Silva",
  headline: "Tech Lead @ Humanizadas · Arquitetura de Soluções & Inovação",
  summary:
    "Sou engenheiro de software e conecto gestão de produtos e código de alta performance. Atuo no ciclo completo de produtos, da concepção ao lançamento, alinhando estratégia de negócios e engenharia.",
  education: [
    { institution: "USP", course: "Sistemas de Informação" },
    { institution: "CEFET-MG", course: "Técnico em Eletrônica" },
  ],
  distinction: "Medalhista na Olimpíada Brasileira de Matemática",
  languages: ["Português nativo", "Inglês profissional"],
  experience: [
    {
      company: "Kairoo Tech",
      role: "Co-Founder",
      period: "Nov 2025 — presente",
      description:
        "Consultoria em automações e desenvolvimento web estratégico.",
    },
    {
      company: "Humanizadas",
      role: "Tech Lead",
      period: "Jun 2025 — presente",
      description:
        "Liderança técnica com foco em inteligência artificial e inovação.",
    },
    {
      company: "BeUni",
      role: "Software Engineer",
      period: "Fev 2024 — Jun 2025",
      description:
        "Engenharia de software para uma plataforma de brindes corporativos.",
    },
    {
      company: "Videomatik",
      role: "Software Engineer",
      period: "Nov 2023 — Fev 2024",
      description:
        "Engenharia de software, análise de requisitos e gestão de projetos.",
    },
    {
      company: "The Brooklyn Brothers",
      role: "Webmaster",
      period: "Ago 2022 — Out 2023",
      description: "Desenvolvimento e manutenção de websites.",
    },
  ],
  skills: [
    { category: "Frontend", items: ["ReactJS", "NextJS", "TypeScript"] },
    { category: "Backend", items: ["NestJS", "NodeJS", "Python"] },
    { category: "Banco de dados", items: ["PostgreSQL", "MongoDB", "SQL"] },
    { category: "DevOps e cloud", items: ["Docker", "AWS", "Oracle Cloud"] },
    {
      category: "Além do código",
      items: ["Liderança", "Comunicação", "Oratória"],
    },
  ],
  contact: {
    email: "matheushenrique2773@gmail.com",
    phone: "+5534998147021",
    phoneLabel: "(34) 99814-7021",
    linkedin: "https://linkedin.com/in/matheushenrique2773",
    github: "https://github.com/mhdsilva",
  },
  projects: [
    {
      id: "farm",
      name: "Portfólio em uma fazenda",
      category: "Portfólio jogável",
      description:
        "Uma fazenda em pixel art com navegação por clique, moradores com rotinas próprias, cultivo e comércio. Os sprites são desenhados e exportados por código.",
      technologies: ["TypeScript", "Phaser", "Vite", "Node.js"],
      url: "https://github.com/mhdsilva/imatheus",
      caseStudy: {
        title: "A fazenda como portfólio.",
        context:
          "A proposta foi transformar a apresentação profissional em uma experiência de exploração, sem esconder currículo, projetos ou contato atrás do jogo.",
        decisions: [
          {
            title: "Um mundo inteiro, com saída direta",
            text: "O navegador abre diretamente na fazenda fullscreen, mas o currículo existe em uma rota independente, renderizada sem carregar o jogo.",
          },
          {
            title: "Arte controlada por código",
            text: "Sprites PNG originais são desenhados por um gerador local com paleta e dimensões reproduzíveis, em vez de depender de imagens externas.",
          },
          {
            title: "Regras separadas da cena",
            text: "Cultivo, economia, calendário e persistência local ficam em módulos TypeScript testáveis; Phaser apresenta o mapa, caminho por clique e rotinas.",
          },
        ],
        evidence:
          "O repositório público reúne geração de 60 assets, testes de regras e verificações no navegador para cultivo, história, currículo e responsividade.",
      },
    },
    {
      id: "meta",
      name: "Meta-Developer Portfolio",
      category: "Portfólio interativo",
      description:
        "Uma experiência que simula a construção de um site em uma IDE: conversa, código e preview acompanham uma história interativa, com escolha de temas.",
      technologies: ["React", "Vite", "Tailwind CSS", "Framer Motion"],
      url: "https://github.com/mhdsilva/meta-portifolio",
      caseStudy: {
        title: "Um portfólio que se constrói.",
        context:
          "Uma experiência que encena pair programming: uma conversa pré-definida conduz a construção visual de um portfólio em uma interface inspirada em IDE.",
        decisions: [
          {
            title: "Seis atos, uma narrativa",
            text: "A linha do tempo parte de HTML sem estilo, passa por identidade e carreira, encena uma falha visual e termina com a correção do projeto.",
          },
          {
            title: "Estado explícito para o preview",
            text: "A narrativa vive em uma timeline de dados e o preview responde a ações por reducer, deixando a sequência visual separada do painel de conversa.",
          },
          {
            title: "Código como camada de descoberta",
            text: "Após o desfecho, o Code Lens revela trechos do componente sob o cursor, conectando a experiência visual à implementação.",
          },
        ],
        evidence:
          "O README público descreve a arquitetura com React 19, Vite 7, Tailwind CSS 4, Framer Motion 12, narrativa em seis atos e comportamento responsivo.",
      },
    },
  ],
} as const;
