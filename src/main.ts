import "./style.css";
import "./fullscreen.css";
import "./portfolio.css";
import type { FarmScene } from "./game";
import { assetPath } from "./assets";
import { renderPortfolio } from "./portfolio-view";
import {
  buySeed,
  CROPS,
  cropKeys,
  plotAction,
  restore,
  sellAll,
  upgrade,
  UPGRADE_PRICE,
  type Crop,
} from "./model";

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
  $("money").textContent = String(state.coins);
  for (const k of cropKeys) $(`seed-${k}`).textContent = String(state.seeds[k]);
  $("day").textContent = String(
    Math.floor(Math.max(0, Date.now() - state.startedAt) / 600_000) + 1,
  );
  const quests = [
    { text: "Colha seu primeiro alimento", done: state.harvested > 0 },
    { text: "Venda no mercado da Rosa", done: state.sold > 0 },
    { text: "Plante uma nova ideia", done: state.planted > 0 },
    { text: "Amplie a sua horta", done: state.upgraded },
  ];
  $("quest-list").innerHTML = quests
    .map(
      (q) =>
        `<li class="${q.done ? "done" : ""}"><span>${q.done ? "✓" : ""}</span>${q.text}</li>`,
    )
    .join("");
  $("quest-progress").style.width =
    `${quests.filter((q) => q.done).length * 25}%`;
  save();
}
function hero(image: string, title: string, subtitle: string) {
  return `<div class="modal-hero"><img src="${assetPath(image)}" alt=""/><div><h2 id="modal-title">${title}</h2><p>${subtitle}</p></div></div>`;
}
function open(page: string, npc = "") {
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
        ? "GENTE QUE FAZ O VALE"
        : page === "bag"
          ? "TUDO O QUE VOCÊ LEVA"
          : "UM POUCO SOBRE QUEM CULTIVA ESTE LUGAR";
  const professionalPage = renderPortfolio(page);
  if (professionalPage) {
    content.innerHTML = professionalPage;
  } else if (page === "shop") {
    const total = cropKeys.reduce(
      (v, k) => v + state.produce[k] * CROPS[k].price,
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
      `<div class="modal-actions"><button class="primary-button" id="sell" ${total === 0 ? "disabled" : ""}>Vender colheita · +${total} moedas</button></div><div class="upgrade-card"><h3>${state.upgraded ? "✓ Sua horta ganhou espaço!" : "Um espaço para crescer"}</h3><p>${state.upgraded ? "Seis novos canteiros estão prontos para receber suas sementes. Obrigado por ajudar o vale a florescer!" : "Desbloqueie seis canteiros e dê o próximo passo na sua fazenda."}</p>${state.upgraded ? "" : `<button class="secondary-button" id="upgrade" ${state.coins < UPGRADE_PRICE ? "disabled" : ""}>Ampliar a horta · ${UPGRADE_PRICE} moedas</button>`}</div>`;
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
      '<p class="help-text">Para vender ou comprar, visite o mercado da Rosa, à esquerda da praça.</p>';
  } else if (page === "dialogue") {
    const copy: Record<string, string> = {
      Lia: "Meu lugar favorito? Entre esses canteiros. Clique numa planta madura para colher. Depois, selecione uma semente, clique na terra vazia e clique outra vez para regar. Enquanto ela cresce, aproveite para conhecer o Matheus!",
      Bento:
        "Sempre tem uma ideia nova nessa oficina! O trator ainda está em manutenção, mas você já pode visitar o espaço dos projetos e das tecnologias. Eu vou dar mais uma olhada no motor…",
      Rosa: "Tudo o que vem da terra tem seu valor. Traga sua colheita que eu compro! Também tenho sementes e uma expansão para sua horta. Vamos fazer uma boa troca?",
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
      `<p class="dialogue-copy">${copy[npc] ?? copy.Lia}</p><div class="modal-actions">${npc === "Rosa" ? '<button class="primary-button" data-page="shop">Ver a loja →</button>' : npc === "Bento" ? '<button class="primary-button" data-page="projects">Conhecer os projetos →</button>' : '<button class="primary-button" data-close>Vou experimentar →</button>'}</div>`;
  } else if (page === "barn" || page === "coop") {
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
      `<p>${page === "barn" ? "As vacas passam o dia passeando e descansando no pasto. Clique nelas para fazer um carinho." : "As galinhas têm uma agenda cheia: procurar sementes e explorar cada cantinho do cercado. Clique nelas para cumprimentar."}</p><div class="content-card"><h3>O vale ainda vai crescer</h3><p>Produção de leite e ovos faz parte das próximas expansões. Por enquanto, o seu primeiro negócio começa na horta.</p></div>`;
  } else {
    content.innerHTML =
      hero(
        "sunflower",
        "Escolha seu caminho.",
        "O portfólio inteiro, sem precisar completar uma missão.",
      ) +
      '<div class="directory-grid"><button data-page="about">Sobre mim<span>Quem cuida deste lugar ↗</span></button><button data-page="projects">Projetos<span>O que nasce na oficina ↗</span></button><button data-page="career">Trajetória<span>Experiências e aprendizados ↗</span></button><button data-page="skills">Tecnologias<span>Ferramentas do caminho ↗</span></button><button data-page="contact">Contato<span>Uma boa conversa começa aqui ↗</span></button></div>';
  }
  if (!modal.open) modal.showModal();
}
document.addEventListener("click", (event) => {
  const el = (event.target as HTMLElement).closest<HTMLElement>("button,a");
  if (!el) return;
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
        ? `Colheita vendida! +${earned} moedas.`
        : "Sua mochila ainda não tem colheitas.",
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
    $("game").focus();
  }, 450);
});
$("help-button").addEventListener("click", () => {
  started = false;
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
      ready: () => {
        $("load-progress").style.width = "100%";
        $("load-status").textContent =
          "Tudo pronto. Seu cantinho está esperando.";
        $<HTMLButtonElement>("enter-game").disabled = false;
        $("enter-game").textContent = raw
          ? "Continuar minha visita →"
          : "Entrar na fazenda →";
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
    $("loading").textContent =
      "Não foi possível carregar a fazenda. Recarregue a página ou explore o portfólio pelo menu acima.";
  });
setInterval(() => {
  updateUI();
  if (modal.open && currentPage === "bag") open(currentPage, currentNpc);
}, 15_000);
