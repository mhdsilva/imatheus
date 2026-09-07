import { assetPath } from "./assets";
import { portfolio as p } from "./portfolio";

const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
const external = (url: string, text: string, className = "secondary-button") =>
  `<a class="${className}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(text)} ↗</a>`;
const hero = (image: string, title: string, subtitle: string) =>
  `<div class="modal-hero"><img src="${assetPath(image)}" alt=""/><div><h2 id="modal-title">${escape(title)}</h2><p>${escape(subtitle)}</p></div></div>`;
const tags = (items: readonly string[]) =>
  `<div class="skill-tags">${items.map((item) => `<span>${escape(item)}</span>`).join("")}</div>`;

export function renderPortfolio(page: string): string | null {
  if (page === "about")
    return (
      hero("house", "Prazer, Matheus.", p.headline) +
      `<p>${escape(p.summary)}</p><div class="content-card"><h3>${escape(p.name)}</h3><p>Atuo como Tech Lead na Humanizadas e sou cofundador da Kairoo Tech, uma consultoria em automações e desenvolvimento web estratégico.</p></div><div class="content-card"><h3>Formação</h3>${p.education.map((e) => `<p><strong>${escape(e.institution)}</strong> · ${escape(e.course)}</p>`).join("")}</div><div class="content-card"><h3>Curiosidade que virou conquista</h3><p>${escape(p.distinction)}.</p><p>${p.languages.map(escape).join(" · ")}.</p></div><div class="modal-actions"><button class="primary-button" data-page="projects">Meus projetos →</button><button class="secondary-button" data-page="career">Minha trajetória</button><button class="secondary-button" data-page="contact">Vamos conversar</button></div>`
    );
  if (page === "career")
    return (
      hero(
        "bag",
        "Cada passo, uma história.",
        "Experiências que conectam produto, tecnologia e pessoas.",
      ) +
      `<div class="career-timeline">${p.experience.map((e) => `<article class="content-card"><span class="experience-period">${escape(e.period)}</span><h3>${escape(e.role)}</h3><h4>${escape(e.company)}</h4><p>${escape(e.description)}</p></article>`).join("")}</div><div class="modal-actions"><button class="secondary-button" data-page="skills">Ferramentas do caminho →</button></div>`
    );
  if (page === "skills")
    return (
      hero(
        "tractor",
        "Ferramentas do caminho.",
        "Da interface à infraestrutura, com visão de produto.",
      ) +
      p.skills
        .map(
          (s) =>
            `<section class="content-card"><h3>${escape(s.category)}</h3>${tags(s.items)}</section>`,
        )
        .join("") +
      `<div class="modal-actions"><button class="primary-button" data-page="projects">Ver projetos →</button></div>`
    );
  if (page === "projects")
    return (
      hero(
        "tractor",
        "A oficina de ideias.",
        "Projetos que transformam código em experiência.",
      ) +
      p.projects
        .map(
          (project) =>
            `<article class="content-card"><span class="experience-period">${escape(project.category)}</span><h3>${escape(project.name)}</h3><p>${escape(project.description)}</p>${tags(project.technologies)}<div class="modal-actions">${external(project.url, "Ver repositório")}</div></article>`,
        )
        .join("") +
      `<div class="modal-actions"><button class="primary-button" data-page="skills">Minhas tecnologias →</button>${external(p.contact.github, "Mais no GitHub")}</div>`
    );
  if (page === "contact")
    return (
      hero(
        "mailbox",
        "Vamos trocar uma ideia?",
        "Produtos, oportunidades e boas conversas.",
      ) +
      `<p>Quer conversar sobre um projeto ou uma oportunidade? Você pode me encontrar por aqui.</p><div class="contact-links"><a href="mailto:${escape(p.contact.email)}"><span>E-MAIL</span><strong>${escape(p.contact.email)}</strong><b>↗</b></a>${external(p.contact.linkedin, "LinkedIn", "contact-social")}${external(p.contact.github, "GitHub", "contact-social")}<a href="tel:${p.contact.phone}"><span>TELEFONE</span><strong>${p.contact.phoneLabel}</strong><b>↗</b></a></div>`
    );
  return null;
}
