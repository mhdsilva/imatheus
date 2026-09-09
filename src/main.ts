import "./style.css";
import "./fullscreen.css";
import "./portfolio.css";
import "./valley.css";
import "./intro.css";
import {
  beginDay,
  readLetter,
  talkTo,
  careFor,
  workAt,
  completeChapter,
  deliverRequest,
  discover,
  collectAnimalProduct,
  buyDecoration,
  toggleDecoration,
  completePostfair,
} from "./valley";
import { RESIDENTS, type Resident, type Site } from "./valley-content";
import {
  renderValleyPage,
  renderResidentStory,
  updateDailyHud,
} from "./valley-view";
import type { FarmScene } from "./game";
import { assetPath } from "./assets";
import { renderPortfolio } from "./portfolio-view";
import {
  buySeed,
  ANIMAL_PRODUCTS,
  animalProductKeys,
  CROPS,
  cropKeys,
  plotAction,
  restore,
  sellAll,
  upgrade,
  UPGRADE_PRICE,
  type Crop,
  type Animal,
} from "./model";
import {
  TOUR_STOPS,
  cancelTour,
  completeTourStop,
  resumeTour,
  startTour,
  type TourStop,
} from "./tour";

const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const storageKey = "vale-do-matheus:v1";
let storageAvailable = true,
  raw: string | null = null;
try {
  raw = localStorage.getItem(storageKey);
} catch {
  storageAvailable = false;
}
const state = restore(raw);
let selected = "hand",
  toastTimer: ReturnType<typeof setTimeout>,
  soundEnabled = false,
  audio: AudioContext | undefined;
let currentPage = "",
  currentNpc = "";
let scene: FarmScene | undefined;
let started = false;
const modal = $<HTMLDialogElement>("modal");
const content = $("modal-content");

function setOpening(visible: boolean) {
  document.body.classList.toggle("opening", visible);
  for (const child of Array.from($("game-stage").children)) {
    if (child instanceof HTMLElement && child.id !== "loading")
      child.inert = visible;
  }
}
setOpening(true);

const tourCopy: Record<
  TourStop,
  { title: string; description: string; button: string }
> = {
  about: {
    title: "1 de 3 · Comece pela casa",
    description:
      "Conheça Matheus, sua formação e a forma como ele une produto e engenharia.",
    button: "Abrir apresentação →",
  },
  projects: {
    title: "2 de 3 · Siga até a oficina",
    description:
      "Veja os projetos e as tecnologias que ajudam ideias a ganhar forma.",
    button: "Abrir projetos →",
  },
  career: {
    title: "3 de 3 · Encontre Rosa",
    description:
      "Conheça a trajetória profissional e escolha como entrar em contato.",
    button: "Abrir trajetória →",
  },
};

function currentTourStop(): TourStop | null {
  return state.tour.current < TOUR_STOPS.length
    ? TOUR_STOPS[state.tour.current]
    : null;
}
function focusTourStop(stop: TourStop | null) {
  if (stop) scene?.focusPortfolioStop(stop);
  else scene?.clearPortfolioStop();
}
function renderTour() {
  const panel = $("portfolio-tour");
  const title = $("tour-title");
  const description = $("tour-description");
  const actions = $("tour-actions");
  const stop = currentTourStop();
  if (state.tour.active && stop) {
    panel.hidden = false;
    $("tour-kicker").textContent = "PASSEIO PROFISSIONAL";
    title.textContent = tourCopy[stop].title;
    description.textContent = tourCopy[stop].description;
    actions.innerHTML = `<div class="tour-actions"><button data-tour="open-current">${tourCopy[stop].button}</button><button data-tour="cancel">Pausar</button></div>`;
    return;
  }
  if (state.tour.visited.length === TOUR_STOPS.length) {
    panel.hidden = false;
    $("tour-kicker").textContent = "PASSEIO CONCLUÍDO";
    title.textContent = "Agora você já conhece o caminho.";
    description.textContent =
      "A fazenda continua aberta para explorar; currículo, projetos e contato estão sempre à mão.";
    actions.innerHTML = `<div class="tour-actions"><a href="${import.meta.env.BASE_URL}curriculo/">Ver currículo ↗</a><button data-page="contact">Entrar em contato</button><button data-tour="start">Recomeçar</button></div>`;
    return;
  }
  if (state.tour.dismissed && stop) {
    panel.hidden = false;
    $("tour-kicker").textContent = "PASSEIO PAUSADO";
    title.textContent = "Quer retomar de onde parou?";
    description.textContent = "Seu próximo lugar continua marcado na fazenda.";
    actions.innerHTML = '<div class="tour-actions"><button data-tour="resume">Retomar passeio</button></div>';
    return;
  }
  panel.hidden = true;
}

function tone() {
  if (!soundEnabled) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const osc = audio.createOscillator(),
      gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, audio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      783.99,
      audio.currentTime + 0.09,
    );
    gain.gain.setValueAtTime(0.045, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.22);
  } catch {
    /* Sound is optional. */
  }
}
function notify(message: string) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 4200);
  tone();
}
function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  $("save-status").innerHTML = storageAvailable
    ? '<span class="live-dot"></span> Progresso salvo neste navegador'
    : "Salvamento indisponível · sessão temporária";
}
function updateUI() {
  beginDay(state);
  $("money").textContent = String(state.coins);
  for (const k of cropKeys) $(`seed-${k}`).textContent = String(state.seeds[k]);
  updateDailyHud(state);
  scene?.refreshValley();
  renderTour();
  save();
}
function hero(image: string, title: string, subtitle: string) {
  return `<div class="modal-hero"><img src="${assetPath(image)}" alt=""/><div><h2 id="modal-title">${title}</h2><p>${subtitle}</p></div></div>`;
}
function open(page: string, npc = "") {
  beginDay(state);
  const nextTourStop = state.tour.active
    ? completeTourStop(state.tour, page)
    : undefined;
  if (page === "dialogue" && RESIDENTS.includes(npc as Resident))
    talkTo(state, npc as Resident);
  updateUI();
  currentPage = page;
  currentNpc = npc;
  if (!state.visited.includes(page)) {
    state.visited.push(page);
    save();
  }
  $("modal-kicker").textContent =
    page === "shop"
      ? "PRODUTOS LOCAIS · BOAS TROCAS"
      : page === "dialogue"
        ? "PESSOAS E CAMINHOS DE MATHEUS"
        : page === "bag"
          ? "TUDO O QUE VOCÊ LEVA"
          : "UM POUCO SOBRE QUEM CULTIVA ESTE LUGAR";
  const valleyPage = renderValleyPage(page, state, npc);
  const professionalPage = renderPortfolio(page);
  if (valleyPage) {
    $("modal-kicker").textContent = "SEU DIÁRIO · CARTAS DO VALE";
    content.innerHTML = valleyPage;
  } else if (professionalPage) {
    content.innerHTML = professionalPage;
  } else if (page === "shop") {
    const total = cropKeys.reduce(
      (v, k) => v + state.produce[k] * CROPS[k].price,
      0,
    ) + animalProductKeys.reduce(
      (v, k) => v + state.animalProducts[k] * ANIMAL_PRODUCTS[k].price,
      0,
    );
    content.innerHTML =
      hero(
        "market",
        "Mercado da Rosa",
        "Sementes de hoje, colheitas de amanhã.",
      ) +
      `<div class="shop-balance"><span>Seu bolso</span><strong>● ${state.coins} moedas</strong></div>` +
      cropKeys
        .map(
          (k) =>
            `<div class="shop-row"><img src="${assetPath(k)}" alt=""/><div><h3>Sementes de ${CROPS[k].name.toLowerCase()}</h3><p>Cresce em ${CROPS[k].duration / 1000}s após regar · venda por ${CROPS[k].price} moedas</p></div><button data-buy="${k}" ${state.coins < CROPS[k].seed ? "disabled" : ""}>${CROPS[k].seed} ● <span>Comprar</span></button></div>`,
        )
        .join("") +
      animalProductKeys
        .map(
          (k) =>
            `<div class="shop-row animal-product-row"><img src="${assetPath(ANIMAL_PRODUCTS[k].image)}" alt=""/><div><h3>${ANIMAL_PRODUCTS[k].name}</h3><p>${state.animalProducts[k]} na mochila · venda por ${ANIMAL_PRODUCTS[k].price} moedas</p></div><strong>${state.animalProducts[k]} ×</strong></div>`,
        )
        .join("") +
      `<div class="modal-actions"><button class="primary-button" id="sell" ${total === 0 ? "disabled" : ""}>Vender colheita e produtos · +${total} moedas</button></div><div class="upgrade-card"><h3>${state.upgraded ? "✓ Sua horta ganhou espaço!" : "Um espaço para crescer"}</h3><p>${state.upgraded ? "Seis novos canteiros estão prontos para receber suas sementes. Obrigado por ajudar o vale a florescer!" : "Desbloqueie seis canteiros e dê o próximo passo na sua fazenda."}</p>${state.upgraded ? "" : `<button class="secondary-button" id="upgrade" ${state.coins < UPGRADE_PRICE ? "disabled" : ""}>Ampliar a horta · ${UPGRADE_PRICE} moedas</button>`}</div>`;
  } else if (page === "bag") {
    content.innerHTML =
      hero(
        "bag",
        "Sua mochila",
        "Pequenas conquistas, guardadas com carinho.",
      ) +
      cropKeys
        .map(
          (k) =>
            `<div class="shop-row"><img src="${assetPath(k)}" alt=""/><div><h3>${CROPS[k].name}</h3><p>${state.seeds[k]} sementes · ${state.produce[k]} colhidos</p></div><strong>${state.produce[k] * CROPS[k].price} ●</strong></div>`,
        )
        .join("") +
      animalProductKeys
        .map(
          (k) =>
            `<div class="shop-row animal-product-row"><img src="${assetPath(ANIMAL_PRODUCTS[k].image)}" alt=""/><div><h3>${ANIMAL_PRODUCTS[k].name}</h3><p>${state.animalProducts[k]} guardados para a próxima ida ao mercado</p></div><strong>${state.animalProducts[k]} ×</strong></div>`,
        )
        .join("") +
      '<p class="help-text">Para vender ou comprar, visite o mercado da Rosa, à esquerda da praça.</p>';
  } else if (page === "dialogue") {
    const copy: Record<string, string> = {
      Lia: "Meu lugar favorito? Entre esses canteiros. Clique numa planta madura para colher. Depois, selecione uma semente, clique na terra vazia e clique outra vez para regar. Enquanto ela cresce, aproveite para conhecer o Matheus!",
      Bento:
        "Sempre tem uma ideia nova nessa oficina! O trator ainda está em manutenção, mas você já pode visitar o espaço dos projetos e das tecnologias. Eu vou dar mais uma olhada no motor…",
      Rosa: "Tudo o que vem da terra tem seu valor. Traga sua colheita que eu compro! Também tenho sementes e uma expansão para sua horta. Vamos fazer uma boa troca?",
    };
    const portfolioTrail: Record<string, string> = {
      Lia: "A casa revela a apresentação, a formação e uma visão geral sobre Matheus.",
      Bento:
        "A oficina aponta para os projetos e as tecnologias que Matheus usa para transformar ideias em produto.",
      Rosa: "O mercado abre a trajetória profissional e os caminhos para entrar em contato com Matheus.",
    };
    content.innerHTML =
      hero(
        npc === "Lia"
          ? "farmer-portrait"
          : npc === "Bento"
            ? "tractor"
            : "basket",
        npc,
        npc === "Lia"
          ? "Sua vizinha e guardiã da horta"
          : npc === "Bento"
            ? "Mecânico e curioso de plantão"
            : "Quem faz a colheita circular",
      ) +
      (RESIDENTS.includes(npc as Resident)
        ? renderResidentStory(state, npc as Resident)
        : `<p>${copy.Lia}</p>`) +
      `<p class="portfolio-thread">${portfolioTrail[npc] ?? portfolioTrail.Lia}</p><div class="modal-actions">${npc === "Rosa" ? '<button class="primary-button" data-page="career">Ver trajetória profissional →</button><button class="secondary-button" data-page="contact">Entrar em contato</button>' : npc === "Bento" ? '<button class="primary-button" data-page="projects">Projetos de Matheus →</button><button class="secondary-button" data-page="skills">Tecnologias</button>' : '<button class="primary-button" data-page="about">Sobre Matheus →</button>'}<button class="secondary-button" data-page="journal">Meu diário</button></div>`;
  } else if (page === "barn" || page === "coop") {
    const animal: Animal = page === "barn" ? "cow" : "chicken";
    const product = animal === "cow" ? "milk" : "egg";
    const cared = state.valley.daily.cared.includes(animal);
    const collected = state.valley.daily.animalCollected.includes(animal);
    const animalName = animal === "cow" ? "vaquinha" : "galinhas";
    const productName = ANIMAL_PRODUCTS[product].name.toLowerCase();
    content.innerHTML =
      hero(
        page === "barn" ? "cow" : "chicken",
        page === "barn"
          ? "Um dia bom no pasto."
          : "Pequenas vizinhas agitadas.",
        page === "barn"
          ? "Grama fresca, sombra e nenhuma pressa."
          : "Ciscar, passear e recomeçar.",
      ) +
      `<p>${page === "barn" ? "As vacas passam o dia passeando e descansando no pasto. Clique nelas para fazer um carinho." : "As galinhas têm uma agenda cheia: procurar sementes e explorar cada cantinho do cercado. Clique nelas para cumprimentar."}</p><div class="animal-product-card"><img src="${assetPath(ANIMAL_PRODUCTS[product].image)}" alt=""/><div><span>PRODUÇÃO DE HOJE</span><h3>${ANIMAL_PRODUCTS[product].name}</h3><p>${collected ? `Você já guardou o ${productName} de hoje.` : cared ? `Tudo pronto: recolha o ${productName} fresco de ${animalName}.` : `Faça carinho n${animal === "cow" ? "a" : "as"} ${animalName} no pasto antes de recolher.`}</p></div><button class="secondary-button" data-valley="collect-animal" data-animal="${animal}" ${!cared || collected ? "disabled" : ""}>${collected ? "✓ Recolhido" : `Recolher ${productName}`}</button></div><p class="daily-note">Cada grupo produz uma vez por data. Se ficar alguns dias fora, nada se perde; o próximo cuidado começa quando você voltar.</p>`;
  } else {
    const tourAction =
      state.tour.current > 0 && state.tour.current < TOUR_STOPS.length
        ? "resume"
        : "start";
    const tourLabel = tourAction === "resume" ? "Retomar passeio" : "Começar passeio";
    content.innerHTML =
      hero(
        "sunflower",
        "Explore o portfólio de Matheus",
        "A fazenda é uma forma de passear pela trajetória profissional. Você também pode abrir qualquer assunto direto daqui, sem completar missões.",
      ) +
      `<div class="modal-actions"><button class="primary-button" data-tour="${tourAction}">${tourLabel} →</button></div><div class="directory-grid"><button data-page="about">Sobre Matheus<span>Apresentação e formação ↗</span></button><button data-page="projects">Projetos<span>O que nasce na oficina ↗</span></button><button data-page="career">Trajetória profissional<span>Experiências e aprendizados ↗</span></button><button data-page="skills">Tecnologias<span>Ferramentas do caminho ↗</span></button><button data-page="contact">Contato<span>Vamos conversar ↗</span></button></div>`;
  }
  if (!modal.open) modal.showModal();
  if (nextTourStop !== undefined) focusTourStop(nextTourStop);
}
document.addEventListener("click", (event) => {
  const el = (event.target as HTMLElement).closest<HTMLElement>("button,a");
  if (!el) return;
  if (el.dataset.tour) {
    event.preventDefault();
    const action = el.dataset.tour;
    if (action === "start") {
      const stop = startTour(state.tour);
      save();
      renderTour();
      focusTourStop(stop);
      modal.close();
      notify("Passeio iniciado. A casa está destacada no mapa.");
    } else if (action === "resume") {
      const stop = resumeTour(state.tour);
      save();
      renderTour();
      focusTourStop(stop);
      modal.close();
      if (stop) notify("Passeio retomado. O próximo lugar está destacado.");
    } else if (action === "cancel") {
      cancelTour(state.tour);
      save();
      renderTour();
      focusTourStop(null);
      notify("Passeio pausado. Você pode retomar quando quiser.");
    } else if (action === "open-current") {
      const stop = currentTourStop();
      if (stop) open(stop);
    }
    return;
  }
  if (el.dataset.valley) {
    const npc = el.dataset.resident as Resident;
    const action = el.dataset.valley;
    const result =
      action === "read"
        ? readLetter(state)
        : action === "chapter"
          ? completeChapter(state, npc)
          : action === "request"
            ? deliverRequest(state, npc)
            : action === "work"
              ? workAt(state, el.dataset.site as Site)
              : action === "buy"
                ? buyDecoration(state, el.dataset.decoration!)
              : action === "toggle"
                  ? toggleDecoration(state, el.dataset.decoration!)
                  : action === "collect-animal"
                    ? collectAnimalProduct(state, el.dataset.animal as Animal)
                  : action === "postfair"
                    ? completePostfair(state, npc)
                  : null;
    if (result) {
      updateUI();
      open(
        action === "chapter" && result.ok ? "journal" : currentPage,
        currentNpc,
      );
      notify(result.message);
    }
    return;
  }
  if (el.dataset.page) {
    event.preventDefault();
    open(el.dataset.page);
  }
  if (el.dataset.tool) {
    selected = el.dataset.tool;
    document.querySelectorAll<HTMLButtonElement>("[data-tool]").forEach((b) => {
      b.classList.toggle("selected", b.dataset.tool === selected);
      b.setAttribute("aria-pressed", String(b.dataset.tool === selected));
    });
    if (cropKeys.includes(selected as Crop))
      notify(
        `Semente de ${CROPS[selected as Crop].name.toLowerCase()} selecionada. Clique num canteiro vazio.`,
      );
    else if (selected === "water")
      notify("Clique numa plantação seca para regar.");
  }
  if (el.dataset.buy) {
    const k = el.dataset.buy as Crop;
    if (buySeed(state, k)) {
      updateUI();
      open("shop");
      notify(`+1 semente de ${CROPS[k].name.toLowerCase()}.`);
    } else notify("Faltam moedas para essa semente.");
  }
  if (el.id === "sell") {
    const earned = sellAll(state);
    updateUI();
    open("shop");
    notify(
      earned
        ? `Colheitas e produtos vendidos! +${earned} moedas.`
        : "Sua mochila ainda não tem colheitas ou produtos.",
    );
  }
  if (el.id === "upgrade" && upgrade(state)) {
    updateUI();
    scene?.refreshGarden();
    open("shop");
    notify(
      "Sua fazenda cresceu! Seis novos canteiros e muitas possibilidades.",
    );
  }
  if (el.hasAttribute("data-close")) modal.close();
});
$("modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    const r = modal.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      modal.close();
  }
});
$("bag-button").addEventListener("click", () => open("bag"));
$("welcome-close").addEventListener("click", () => {
  $("welcome").hidden = true;
  $("welcome").style.display = "none";
});
$("enter-game").addEventListener("click", () => {
  started = true;
  $("loading").classList.add("leaving");
  setTimeout(() => {
    $("loading").style.display = "none";
    setOpening(false);
    $("game").focus();
  }, 450);
});
$("help-button").addEventListener("click", () => {
  started = false;
  setOpening(true);
  $("loading").style.display = "flex";
  $("loading").classList.remove("leaving");
  $("enter-game").textContent = "Voltar para a fazenda →";
  $("enter-game").focus();
});
$("quest-toggle").addEventListener("click", () => {
  const body = $("quest-body");
  body.hidden = !body.hidden;
  $("quest-toggle").textContent = body.hidden ? "+" : "−";
  $("quest-toggle").setAttribute("aria-expanded", String(!body.hidden));
});
$("sound").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  $("sound").innerHTML =
    `♫ <span>som ${soundEnabled ? "ligado" : "desligado"}</span>`;
  $("sound").setAttribute("aria-pressed", String(soundEnabled));
  $("sound").setAttribute(
    "aria-label",
    soundEnabled ? "Desativar sons" : "Ativar sons",
  );
  $("sound").title = soundEnabled ? "Desativar sons" : "Ativar sons";
  tone();
});
window.addEventListener("pagehide", save);
updateUI();
if (raw) {
  $("welcome").style.display = "none";
}
void import("./game")
  .then(({ createGame }) => {
    const world = createGame({
      state,
      selected: () => selected,
      blocked: () => modal.open || !started,
      interactPlot: (index) => {
        notify(plotAction(state, index, selected));
        updateUI();
      },
      open,
      notify,
      care: (animal) => {
        notify(careFor(state, animal).message);
        updateUI();
      },
      discover: () => {
        notify(discover(state).message);
        updateUI();
      },
      ready: () => {
        $("load-progress").style.width = "100%";
        $("load-status").textContent =
          "Tudo pronto. Seu cantinho está esperando.";
        $<HTMLButtonElement>("enter-game").disabled = false;
        $("enter-game").textContent = raw
          ? "Continuar minha visita →"
          : "Explorar a fazenda →";
        $("enter-game").focus();
      },
    });
    scene = world.scene;
    // Development-only diagnostics; never included in a production build.
    if (import.meta.env.DEV)
      Object.defineProperty(window, "__farm", {
        value: {
          get state() {
            return structuredClone(state);
          },
          get scene() {
            return scene;
          },
          get game() {
            return world.game;
          },
        },
      });
  })
  .catch(() => {
    $("load-status").textContent =
      "A fazenda não carregou. Você pode abrir o currículo agora ou recarregar a página para tentar novamente.";
  });
setInterval(() => {
  const previousDay = state.valley.day;
  updateUI();
  if (modal.open && (currentPage === "bag" || previousDay !== state.valley.day))
    open(currentPage, currentNpc);
}, 15_000);
