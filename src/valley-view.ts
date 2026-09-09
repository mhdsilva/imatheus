import { assetPath } from "./assets";
import {
  ANIMAL_PRODUCTS,
  APPEARANCES,
  ACCESSORIES,
  CROPS,
  appearanceKeys,
  accessoryKeys,
  playerSprite,
  type FarmState,
} from "./model";
import {
  CHAPTERS,
  DECORATIONS,
  DISCOVERIES,
  FRIENDSHIP_SCENES,
  RESIDENTS,
  residentDialogue,
  dailyPostfair,
  type Resident,
  type Site,
} from "./valley-content";
import { chapterStatus, dailyDiscovery, dailyRequest } from "./valley";

const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const button = (page: string, text: string) =>
  `<button class="diary-tab" data-page="${page}">${text}</button>`;
const navigation = () =>
  `<nav class="diary-tabs" aria-label="Diário">${button("journal", "Cartas")}${button("request", "Pedido de hoje")}${button("collection", "Lembranças")}${button("decor", "Meu cantinho")}${button("appearance", "Meu personagem")}</nav>`;
const hearts = (points: number) =>
  "♥".repeat(Math.min(5, Math.ceil(points / 3))) +
  "♡".repeat(5 - Math.min(5, Math.ceil(points / 3)));
const title = (text: string, caption: string) =>
  `<div class="diary-heading"><span>${caption}</span><h2 id="modal-title">${text}</h2></div>`;
function requestDetails(farm: FarmState) {
  const order = dailyRequest(farm);
  if (order.kind === "crop")
    return {
      order,
      image: order.crop,
      name: CROPS[order.crop].plural,
      amount: farm.produce[order.crop],
      inventory: `${farm.produce[order.crop]} na mochila · ${farm.seeds[order.crop]} sementes`,
      preparation: "As sementes deste pedido já estão na mochila.",
    };
  const product = ANIMAL_PRODUCTS[order.product];
  return {
    order,
    image: product.image,
    name: product.plural,
    amount: farm.animalProducts[order.product],
    inventory: `${farm.animalProducts[order.product]} disponíveis na mochila`,
    preparation:
      product.animal === "cow"
        ? "Cuide da vaquinha e recolha o leite antes de entregar."
        : "Cuide das galinhas e recolha os ovos antes de entregar.",
  };
}
function goals(farm: FarmState, now: number) {
  return `<ul class="story-goals">${chapterStatus(farm, now)
    .tasks.map(
      (task) =>
        `<li class="${task.done ? "done" : ""}"><span>${task.done ? "✓" : ""}</span>${escape(task.label)}</li>`,
    )
    .join("")}</ul>`;
}
function history(farm: FarmState) {
  if (!farm.valley.chapter) return "";
  return `<div class="letter-history"><h3>Guardado com carinho</h3>${CHAPTERS.slice(
    0,
    farm.valley.chapter,
  )
    .map(
      (chapter, i) =>
        `<details><summary><span>0${i + 1}</span>${chapter.title}</summary><div>${chapter.letter.map((p) => `<p>${escape(p)}</p>`).join("")}<p class="history-outcome">${escape(chapter.outcome)}</p></div></details>`,
    )
    .join("")}</div>`;
}

export function renderValleyPage(
  page: string,
  farm: FarmState,
  context = "",
  now = Date.now(),
): string | null {
  const s = farm.valley;
  if (page === "journal") {
    const status = chapterStatus(farm, now),
      chapter = status.chapter;
    const previous = CHAPTERS[s.chapter - 1];
    let body: string;
    if (status.mode === "complete")
      body =
        title("A feira está de volta.", "CARTAS DO VALE · HISTÓRIA CONCLUÍDA") +
        `<div class="story-ending"><img src="${assetPath("letter")}" alt=""/><p>${escape(previous.outcome)}</p></div><p class="daily-note">Amanhã tem outro pedido e uma nova descoberta. O vale continua sendo seu lugar para cultivar, conversar e decorar.</p>`;
    else if (status.mode === "waiting")
      body =
        title(previous.title, `CAPÍTULO ${s.chapter} DE 7 · CONCLUÍDO`) +
        `<p class="story-outcome">${escape(previous.outcome)}</p><div class="tomorrow-note"><span>UM NOVO DIA, UM NOVO CAPÍTULO</span><p>A próxima carta chega em outro dia de visita.</p><small>${escape(previous.tomorrow)}</small></div>`;
    else
      body =
        title(
          chapter!.title,
          `CARTAS DO VALE · CAPÍTULO ${s.chapter + 1} DE 7`,
        ) +
        `<article class="journal-sheet"><img src="${assetPath("letter")}" alt="" class="letter-seal"/>${chapter!.letter.map((p) => `<p>${escape(p)}</p>`).join("")}<footer>Com carinho,<br/><em>${escape(chapter!.sender)}</em></footer></article>` +
        (s.letterRead
          ? `<section class="chapter-objectives"><h3>Um pequeno passo de cada vez</h3>${goals(farm, now)}<p class="delivery-hint">${status.ready ? "Tudo pronto!" : "Quando terminar,"} encontre ${chapter!.recipient} para entregar e continuar.</p><span class="story-reward">✧ 2 selos da feira · 25 moedas</span></section>`
          : `<button class="primary-button read-letter" data-valley="read">Guardar carta e pegar as sementes →</button><p class="daily-note">As sementes do envelope ajudam a preparar o pedido. A história segue no seu tempo.</p>`);
    return navigation() + body + history(farm);
  }
  if (page === "request") {
    const details = requestDetails(farm),
      order = details.order;
    return (
      navigation() +
      title("Uma gentileza por dia.", "ENCOMENDA DO DIA") +
      `<div class="request-note"><span>DE ${order.npc.toUpperCase()}</span><p>“${escape(order.text)}”</p></div><div class="request-product"><img src="${assetPath(details.image)}" alt=""/><div><strong>${order.count} ${details.name}</strong><small>${details.inventory}</small></div><b>${s.daily.delivered ? "✓" : "↗"}</b></div><p class="delivery-hint">${s.daily.delivered ? "Entregue, com carinho. Outro pedido chega em um novo dia." : `Leve ${details.name} até ${order.npc}. ${details.preparation}`}</p><div class="reward-line">✧ 1 selo da feira <span>● 30 moedas</span><span>♡ Amizade</span></div><div class="content-card"><h3>Um cantinho para descobrir</h3><p>${s.daily.discovered ? `Você encontrou ${dailyDiscovery(farm).name.toLowerCase()}. A lembrança ficou no diário.` : "Há um pequeno pacote perdido em algum lugar do gramado. Passeie pelo vale e clique nele para guardar a descoberta de hoje."}</p></div><p class="daily-note">Os pedidos mudam por data no seu fuso. Se perder um dia, a fazenda e sua história continuam esperando.</p>`
    );
  }
  if (page === "collection")
    return (
      navigation() +
      title(
        "Coisas pequenas, boas histórias.",
        `${s.keepsakes.length} DE ${DISCOVERIES.length} LEMBRANÇAS`,
      ) +
      `<div class="keepsake-grid">${DISCOVERIES.map((item) => `<article class="keepsake ${s.keepsakes.includes(item.id) ? "found" : ""}"><span>${s.keepsakes.includes(item.id) ? "✧" : "?"}</span><h3>${s.keepsakes.includes(item.id) ? item.name : "Uma história por encontrar"}</h3><p>${s.keepsakes.includes(item.id) ? item.text : "Uma das descobertas espalhadas pelos dias do vale."}</p></article>`).join("")}</div><section class="friendship-memories"><h3>Memórias dos moradores</h3><div class="memory-grid">${RESIDENTS.map(
        (npc) => {
          const scene = FRIENDSHIP_SCENES[npc],
            found = s.friendshipScenes.includes(npc);
          return `<article class="memory-card ${found ? "found" : ""}"><img src="${assetPath(scene.image)}" alt=""/><div><span>${found ? "GUARDADA NO DIÁRIO" : "DESBLOQUEADA COM AMIZADE"}</span><h4>${found ? scene.title : "Uma conversa especial"}</h4><p>${found ? scene.text : "Continue encontrando este morador depois da feira."}</p></div></article>`;
        },
      ).join(
        "",
      )}</div></section><div class="friendships"><h3>Gente que já espera por você</h3>${RESIDENTS.map((npc) => `<div><span>${npc}</span><span class="friendship-hearts">${hearts(s.friendship[npc])}</span><small>${s.friendship[npc]} de amizade</small></div>`).join("")}</div>`
    );
  if (page === "decor")
    return (
      navigation() +
      title("Um lugar com a sua cara.", `${s.tokens} SELOS DA FEIRA`) +
      `<p class="daily-note">Conquiste selos ajudando os moradores, avançando a história e encontrando lembranças. Suas escolhas aparecem no cenário.</p>` +
      DECORATIONS.map((d) => {
        const owned = s.decorations.includes(d.id),
          active = s.activeDecorations.includes(d.id);
        return `<article class="decoration-card"><img src="${assetPath(d.image)}" alt=""/><div><h3>${d.name}</h3><p>${d.description}</p><button class="secondary-button" data-valley="${owned ? "toggle" : "buy"}" data-decoration="${d.id}" ${!owned && s.tokens < d.price ? "disabled" : ""}>${owned ? (active ? "Guardar decoração" : "Colocar no cenário") : `Escolher · ${d.price} selos`}</button></div></article>`;
      }).join("")
    );
  if (page === "appearance")
    return (
      navigation() +
      title("Um toque de cor.", "MEU PERSONAGEM") +
      `<p class="daily-note">Escolha uma paleta para acompanhar seus passeios. A aparência muda só o visual e fica guardada neste navegador.</p>` +
      `<div class="appearance-grid">${appearanceKeys
        .map((key) => {
          const appearance = APPEARANCES[key],
            selected = farm.appearance === key;
          return `<article class="appearance-card ${selected ? "selected" : ""}"><span class="appearance-preview" style="background-image:url('${assetPath(appearance.sprite)}')"></span><div><span>${selected ? "EM USO" : "PALETA"}</span><h3>${appearance.name}</h3><p>${key === "meadow" ? "Cores claras para um dia entre canteiros." : key === "sunset" ? "Tons quentes para caminhar no fim da tarde." : "Um toque frutado para deixar o vale mais vivo."}</p><button class="secondary-button" data-appearance="${key}" ${selected ? "disabled" : ""}>${selected ? "✓ Escolhida" : "Usar esta aparência"}</button></div></article>`;
        })
        .join("")}</div>` +
      `<h3 class="appearance-section-title">Acessórios</h3><p class="daily-note">Pequenos detalhes para levar na caminhada. Lenço e bolsa estão disponíveis desde o começo; o Broche da feira chega depois de três atividades pós-feira.</p><div class="accessory-grid">${accessoryKeys
        .map((key) => {
          const accessory = ACCESSORIES[key],
            selected = farm.accessory === key,
            unlocked = farm.unlockedAccessories.includes(key),
            locked = !unlocked,
            remaining = Math.max(0, 3 - farm.valley.postfairActivities),
            description =
              key === "none"
                ? "Um visual limpo para cuidar da fazenda."
                : key === "scarf"
                  ? "Um lenço alegre para dias de vento."
                  : key === "satchel"
                    ? "Uma bolsa para ideias, sementes e ferramentas."
                    : `Uma lembrança dourada da feira. Faltam ${remaining} atividades pós-feira.`;
          return `<article class="appearance-card accessory-card ${selected ? "selected" : ""} ${locked ? "locked" : ""}"><span class="appearance-preview" style="background-image:url('${assetPath(playerSprite(farm.appearance, key))}')"></span><div><span>${selected ? "EM USO" : locked ? "BLOQUEADO" : "ACESSÓRIO"}</span><h3>${accessory.name}</h3><p>${description}</p><button class="secondary-button" data-accessory="${key}" ${selected || locked ? "disabled" : ""}>${selected ? "✓ Escolhido" : locked ? `Faltam ${remaining} atividades` : "Usar este acessório"}</button></div></article>`;
        })
        .join("")}</div>`
    );
  if (page === "work") {
    const sites: Record<
      Site,
      { name: string; description: string; image: string; action: string }
    > = {
      bench: {
        name: "Madeira e novas possibilidades.",
        description:
          "Uma bancada antiga, algumas ferramentas e bastante coisa que ainda pode ser construída.",
        image: "workbench",
        action: "Separar as peças",
      },
      well: {
        name: "O reflexo do vale.",
        description:
          "Folhas cobrem a borda do poço. A água, lá embaixo, ainda guarda a cor do céu.",
        image: "well",
        action: "Limpar a borda do poço",
      },
      mill: {
        name: "Quando o vento voltar.",
        description:
          "O moinho está em silêncio. Há um mecanismo preso e uma caixa guardada perto das ferramentas.",
        image: "mill",
        action: "Examinar o mecanismo",
      },
      fair: {
        name: "A mesa de todo mundo.",
        description:
          "Um lugar para dividir a colheita, trocar histórias e ficar mais um pouquinho.",
        image: "stall",
        action: "Preparar a banca",
      },
    };
    const site = sites[context as Site];
    if (!site) return null;
    const status = chapterStatus(farm, now),
      relevant =
        status.mode === "available" &&
        s.letterRead &&
        status.chapter?.tasks.some((t) => t.flag === `work:${context}`),
      done = s.flags.includes(`work:${context}`);
    return (
      title(site.name, "PEQUENOS REPAROS, GRANDES RECOMEÇOS") +
      `<img class="work-illustration" src="${assetPath(site.image)}" alt=""/><p class="dialogue-copy">${site.description}</p>` +
      (relevant
        ? `<button class="primary-button" data-valley="work" data-site="${context}" ${done ? "disabled" : ""}>${done ? "✓ Tudo preparado" : site.action}</button>`
        : `<p class="daily-note">Este lugar faz parte da história do vale. As cartas mostram o próximo passo.</p>`) +
      `<div class="modal-actions">${button("journal", "Consultar o diário →")}</div>`
    );
  }
  return null;
}

export function renderResidentStory(
  farm: FarmState,
  npc: Resident,
  now = Date.now(),
) {
  const status = chapterStatus(farm, now),
    s = farm.valley;
  const details = requestDetails(farm),
    order = details.order;
  const story = residentDialogue(farm, npc, now);
  let html = `<p class="dialogue-copy">${escape(story)}</p><div class="resident-friendship">♡ ${s.friendship[npc]} de amizade · ${s.daily.chatted.includes(npc) ? "bom te ver hoje" : "cada conversa aproxima"}</div>`;
  if (
    status.mode === "available" &&
    s.letterRead &&
    status.chapter?.recipient === npc
  )
    html += `<section class="resident-request"><h3>${status.chapter.title}</h3>${goals(farm, now)}<button class="primary-button" data-valley="chapter" data-resident="${npc}" ${status.ready ? "" : "disabled"}>Entregar e continuar a história →</button></section>`;
  if (order.npc === npc)
    html += `<section class="resident-request daily-resident"><span>PEDIDO DE HOJE</span><p>${escape(order.text)}</p><button class="secondary-button" data-valley="request" data-resident="${npc}" ${s.daily.delivered || details.amount < order.count ? "disabled" : ""}>${s.daily.delivered ? "✓ Encomenda recebida" : `Entregar ${order.count} ${details.name} · +1 selo`}</button></section>`;
  const postfair = dailyPostfair(farm);
  if (s.chapter >= 7 && postfair.npc === npc)
    html += `<section class="resident-request postfair-resident"><span>ATIVIDADE DE HOJE</span><h3>${escape(postfair.title)}</h3><p>${escape(postfair.text)}</p><button class="secondary-button" data-valley="postfair" data-resident="${npc}" ${s.daily.postfairDone ? "disabled" : ""}>${s.daily.postfairDone ? "✓ Atividade concluída" : `${escape(postfair.action)} · +1 selo`}</button></section>`;
  const scene = FRIENDSHIP_SCENES[npc];
  if (
    s.chapter >= 7 &&
    (s.friendship[npc] >= 3 || s.friendshipScenes.includes(npc))
  ) {
    const seen = s.friendshipScenes.includes(npc);
    html += `<section class="resident-request friendship-scene"><span>${seen ? "MEMÓRIA GUARDADA" : "MEMÓRIA ESPECIAL"}</span><img src="${assetPath(scene.image)}" alt=""/><h3>${escape(scene.title)}</h3><p>${seen ? escape(scene.text) : "Uma lembrança espera por uma conversa com calma."}</p>${seen ? "" : `<button class="secondary-button" data-valley="friendship-scene" data-resident="${npc}">Guardar no diário · +1 selo</button>`}</section>`;
  }
  return html;
}

export function updateDailyHud(farm: FarmState, now = Date.now()) {
  const s = farm.valley,
    status = chapterStatus(farm, now);
  const set = (id: string, text: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  set("day", String(s.visits));
  set("stamp-count", String(s.tokens));
  set(
    "quest-kicker",
    status.mode === "complete"
      ? "O VALE CONTINUA"
      : `CARTAS DO VALE · ${Math.min(s.chapter + 1, 7)}/7`,
  );
  set(
    "quest-title",
    status.mode === "waiting"
      ? "Hoje o vale já floresceu."
      : status.mode === "complete"
        ? "Que bom te ver de novo."
        : status.chapter!.title,
  );
  set(
    "quest-description",
    status.mode === "waiting"
      ? "Uma nova carta em outro dia. Enquanto isso, o vale é seu."
      : status.mode === "complete"
        ? "Um pedido, uma descoberta e tempo para ficar."
        : s.letterRead
          ? "Pequenos passos mudam este lugar."
          : "Chegou uma carta para você. Abra o diário para começar.",
  );
  const postfair = dailyPostfair(farm);
  const tasks =
    status.mode === "available" && s.letterRead
      ? status.tasks
      : [
          {
            done: s.daily.postfairDone,
            label: `Ajudar ${postfair.npc} com a atividade do dia`,
          },
          {
            done: s.daily.animalCollected.length > 0,
            label: "Cuidar de um animal e recolher sua produção",
          },
          {
            done: s.daily.delivered,
            label: `Ajudar ${dailyRequest(farm).npc} com a encomenda`,
          },
          { done: s.daily.discovered, label: "Encontrar a descoberta de hoje" },
        ];
  const list = document.getElementById("quest-list");
  if (list)
    list.innerHTML = tasks
      .map(
        (t) =>
          `<li class="${t.done ? "done" : ""}"><span>${t.done ? "✓" : ""}</span>${escape(t.label)}</li>`,
      )
      .join("");
  const progress = document.getElementById("quest-progress");
  if (progress) progress.style.width = `${(s.chapter / 7) * 100}%`;
  document
    .getElementById("journal-button")
    ?.classList.toggle(
      "has-letter",
      status.mode === "available" && !s.letterRead,
    );
}
