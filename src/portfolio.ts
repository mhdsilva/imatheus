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
      name: "Vale do Matheus",
      category: "Portfólio jogável",
      description:
        "Uma fazenda em pixel art com navegação por clique, moradores com rotinas próprias, cultivo e comércio. Os sprites são desenhados e exportados por código.",
      technologies: ["TypeScript", "Phaser", "Vite", "Node.js"],
      url: "https://github.com/mhdsilva/imatheus",
    },
    {
      name: "Meta-Developer Portfolio",
      category: "Portfólio interativo",
      description:
        "Uma experiência que simula a construção de um site em uma IDE: conversa, código e preview acompanham uma história interativa, com escolha de temas.",
      technologies: ["React", "Vite", "Tailwind CSS", "Framer Motion"],
      url: "https://github.com/mhdsilva/meta-portifolio",
    },
  ],
} as const;
