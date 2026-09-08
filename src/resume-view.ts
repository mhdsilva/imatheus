import { portfolio as p } from "./portfolio";

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const external = (url: string, label: string) =>
  `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} <span aria-hidden="true">↗</span></a>`;

/** Rendered by Vite for both development and static output, from the shared profile. */
export function renderResume(base = "/") {
  const home = base.endsWith("/") ? base : `${base}/`;
  return `<a class="skip-link" href="#curriculo">Ir para o currículo</a>
    <div class="resume-toolbar"><a class="resume-home" href="${escape(home)}">MH<span>Portfólio de Matheus</span></a><div><a href="${escape(home)}">Explorar a fazenda <span aria-hidden="true">↗</span></a><button id="print-resume" hidden>Imprimir / salvar PDF</button></div></div>
    <main id="curriculo" class="resume-paper">
      <header class="resume-header"><p class="resume-eyebrow">CURRÍCULO · ENGENHARIA DE SOFTWARE</p><h1>${escape(p.name)}</h1><p class="resume-headline">${escape(p.headline)}</p><p class="resume-summary">${escape(p.summary)}</p>
      <address class="resume-contact"><a href="mailto:${escape(p.contact.email)}">${escape(p.contact.email)}</a><a href="tel:${p.contact.phone}">${escape(p.contact.phoneLabel)}</a>${external(p.contact.linkedin, "LinkedIn")}${external(p.contact.github, "GitHub")}</address></header>
      <div class="resume-columns"><div class="resume-primary">
        <section id="resume-experience" aria-labelledby="experience-title"><h2 id="experience-title">Experiência profissional</h2>${p.experience.map((e) => `<article class="resume-job"><div><h3>${escape(e.company)}</h3><span class="resume-period">${escape(e.period)}</span></div><p class="resume-role">${escape(e.role)}</p><p>${escape(e.description)}</p></article>`).join("")}</section>
        <section aria-labelledby="projects-title"><h2 id="projects-title">Projetos</h2>${p.projects.map((project) => `<article class="resume-project"><h3>${external(project.url, project.name)}</h3><p>${escape(project.description)}</p><p class="resume-stack">${project.technologies.map(escape).join(" · ")}</p></article>`).join("")}</section>
      </div><aside class="resume-secondary">
        <section aria-labelledby="skills-title"><h2 id="skills-title">Tecnologias e competências</h2>${p.skills.map((s) => `<div class="resume-skill"><h3>${escape(s.category)}</h3><p>${s.items.map(escape).join(" · ")}</p></div>`).join("")}</section>
        <section aria-labelledby="education-title"><h2 id="education-title">Formação</h2>${p.education.map((e) => `<div class="resume-education"><h3>${escape(e.institution)}</h3><p>${escape(e.course)}</p></div>`).join("")}</section>
        <section aria-labelledby="languages-title"><h2 id="languages-title">Idiomas</h2><ul>${p.languages.map((l) => `<li>${escape(l)}</li>`).join("")}</ul></section>
        <section aria-labelledby="distinction-title"><h2 id="distinction-title">Reconhecimento</h2><p>${escape(p.distinction)}.</p></section>
      </aside></div>
    </main><footer class="resume-footer">${escape(p.name)}<span>Prefere conhecer meu trabalho de outro jeito? <a href="${escape(home)}">Entre na fazenda →</a></span></footer>`;
}
