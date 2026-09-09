import {
  CHAPTERS,
  REQUESTS,
  DISCOVERIES,
  DECORATIONS,
  POSTFAIR_EVENTS,
  FRIENDSHIP_SCENES,
  dailyPostfair,
  RESIDENTS,
  type Resident,
  type Decoration,
  type Site,
} from "./valley-content";
import {
  ANIMAL_PRODUCTS,
  type Animal,
  type FarmState,
  type Crop,
} from "./model";

export type ValleyState = {
  timezone: string;
  day: string;
  visits: number;
  chapter: number;
  lastChapterDay: string | null;
  letterRead: boolean;
  flags: string[];
  tokens: number;
  friendship: Record<Resident, number>;
  keepsakes: string[];
  decorations: Decoration[];
  activeDecorations: Decoration[];
  friendshipScenes: Resident[];
  daily: {
    requestId: string;
    seeded: boolean;
    delivered: boolean;
    discovered: boolean;
    postfairId: string;
    postfairDone: boolean;
    animalCollected: Animal[];
    chatted: Resident[];
    cared: string[];
  };
};
export function dayKey(now: number, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (name: string) => parts.find((p) => p.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function dayNumber(day: string): number {
  return Math.floor(Date.parse(`${day}T12:00:00Z`) / 86400000);
}
function newDaily(day: string): ValleyState["daily"] {
  return {
    requestId:
      REQUESTS[
        ((dayNumber(day) % REQUESTS.length) + REQUESTS.length) % REQUESTS.length
      ].id,
    seeded: false,
    delivered: false,
    discovered: false,
    postfairId:
      POSTFAIR_EVENTS[
        ((dayNumber(day) % POSTFAIR_EVENTS.length) + POSTFAIR_EVENTS.length) %
          POSTFAIR_EVENTS.length
      ].id,
    postfairDone: false,
    animalCollected: [],
    chatted: [],
    cared: [],
  };
}
export function newValley(
  now = Date.now(),
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
): ValleyState {
  const day = dayKey(now, timezone);
  return {
    timezone,
    day,
    visits: 1,
    chapter: 0,
    lastChapterDay: null,
    letterRead: false,
    flags: [],
    tokens: 0,
    friendship: { Lia: 0, Bento: 0, Rosa: 0 },
    keepsakes: [],
    decorations: [],
    activeDecorations: [],
    friendshipScenes: [],
    daily: newDaily(day),
  };
}
export function restoreValley(raw: unknown, now = Date.now()): ValleyState {
  if (!raw || typeof raw !== "object") return newValley(now);
  const s = raw as ValleyState;
  const number = (v: unknown) =>
    Number.isSafeInteger(v) && Number(v) >= 0 && Number(v) < 1e9;
  const strings = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((x) => typeof x === "string");
  const date = (v: unknown) =>
    typeof v === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    Number.isFinite(Date.parse(`${v}T12:00:00Z`));
  try {
    dayKey(now, s.timezone);
    if (
      typeof s.timezone !== "string" ||
      !date(s.day) ||
      !number(s.visits) ||
      s.visits < 1 ||
      !number(s.chapter) ||
      s.chapter > 7 ||
      (s.chapter === 0 && s.lastChapterDay !== null) ||
      (s.lastChapterDay !== null && !date(s.lastChapterDay)) ||
      typeof s.letterRead !== "boolean" ||
      !strings(s.flags) ||
      !number(s.tokens) ||
      !s.friendship ||
      !["Lia", "Bento", "Rosa"].every((n) =>
        number(s.friendship[n as Resident]),
      ) ||
      !strings(s.keepsakes) ||
      !strings(s.decorations) ||
      !strings(s.activeDecorations) ||
      !s.daily ||
      !REQUESTS.some((r) => r.id === s.daily.requestId) ||
      typeof s.daily.seeded !== "boolean" ||
      typeof s.daily.delivered !== "boolean" ||
      typeof s.daily.discovered !== "boolean" ||
      !strings(s.daily.chatted) ||
      !strings(s.daily.cared)
    )
      return newValley(now);
    const event = POSTFAIR_EVENTS.find((item) => item.id === s.daily.postfairId);
    return {
      ...s,
      friendshipScenes: Array.isArray(s.friendshipScenes)
        ? s.friendshipScenes.filter(
            (npc): npc is Resident => RESIDENTS.includes(npc),
          )
        : [],
      daily: {
        ...s.daily,
        postfairId: event?.id ?? newDaily(s.day).postfairId,
        postfairDone:
          typeof s.daily.postfairDone === "boolean" ? s.daily.postfairDone : false,
        animalCollected: Array.isArray(s.daily.animalCollected)
          ? s.daily.animalCollected.filter(
              (animal): animal is Animal => animal === "cow" || animal === "chicken",
            )
          : [],
      },
    };
  } catch {
    return newValley(now);
  }
}

export type ActionResult = { ok: boolean; message: string };
const result = (ok: boolean, message: string): ActionResult => ({
  ok,
  message,
});
const addFlag = (farm: FarmState, flag: string) => {
  if (farm.valley.letterRead && !farm.valley.flags.includes(flag))
    farm.valley.flags.push(flag);
};
export function dailyRequest(farm: FarmState) {
  return REQUESTS.find((r) => r.id === farm.valley.daily.requestId)!;
}
export function dailyDiscovery(farm: FarmState) {
  const index =
    ((dayNumber(farm.valley.day) % DISCOVERIES.length) + DISCOVERIES.length) %
    DISCOVERIES.length;
  return { ...DISCOVERIES[index], index };
}
export function beginDay(farm: FarmState, now = Date.now()): boolean {
  const s = farm.valley,
    today = dayKey(now, s.timezone);
  const changed = today > s.day;
  if (changed) {
    s.day = today;
    s.visits++;
    s.daily = newDaily(today);
  }
  if (!s.daily.seeded) {
    const order = dailyRequest(farm);
    farm.seeds[order.crop] += order.count;
    s.daily.seeded = true;
  }
  return changed;
}
export function chapterStatus(farm: FarmState, now = Date.now()) {
  const s = farm.valley,
    chapter = CHAPTERS[s.chapter];
  const today =
    dayKey(now, s.timezone) > s.day ? dayKey(now, s.timezone) : s.day;
  if (!chapter)
    return {
      mode: "complete" as const,
      chapter: null,
      tasks: [],
      ready: false,
    };
  const waiting = s.lastChapterDay !== null && s.lastChapterDay >= today;
  const tasks = [
    ...chapter.tasks.map((task) => ({
      ...task,
      done: s.flags.includes(task.flag),
    })),
    ...Object.entries(chapter.crops).map(([crop, count]) => ({
      flag: `crop:${crop}`,
      label: `${farm.produce[crop as Crop]}/${count} ${crop === "carrot" ? "cenouras" : crop === "corn" ? "milhos" : "nabos"} para entregar`,
      done: farm.produce[crop as Crop] >= count,
    })),
  ];
  return {
    mode: waiting ? ("waiting" as const) : ("available" as const),
    chapter,
    tasks,
    ready: !waiting && s.letterRead && tasks.every((t) => t.done),
  };
}
export function readLetter(farm: FarmState, now = Date.now()): ActionResult {
  beginDay(farm, now);
  const s = farm.valley,
    status = chapterStatus(farm, now);
  if (status.mode !== "available" || !status.chapter)
    return result(
      false,
      "A próxima carta chega em outro dia de visita. O vale fica esperando por você.",
    );
  if (s.letterRead)
    return result(false, "Esta carta já está guardada no seu diário.");
  s.letterRead = true;
  for (const [crop, count] of Object.entries(status.chapter.gift))
    farm.seeds[crop as Crop] += count;
  return result(
    true,
    "Carta guardada. As sementes do envelope já estão na mochila.",
  );
}
export function talkTo(
  farm: FarmState,
  npc: Resident,
  now = Date.now(),
): ActionResult {
  beginDay(farm, now);
  if (!RESIDENTS.includes(npc))
    return result(false, "Esse morador ainda não está no vale.");
  addFlag(farm, `talk:${npc}`);
  if (farm.valley.daily.chatted.includes(npc))
    return result(false, "Sempre cabe mais uma conversa.");
  farm.valley.daily.chatted.push(npc);
  farm.valley.friendship[npc]++;
  return result(true, `Um pouco mais de amizade com ${npc}.`);
}
export function careFor(
  farm: FarmState,
  animal: Animal,
  now = Date.now(),
): ActionResult {
  beginDay(farm, now);
  addFlag(farm, `care:${animal}`);
  if (farm.valley.daily.cared.includes(animal))
    return result(
      false,
      animal === "cow"
        ? "Muuu! Ela já recebeu seus cuidados hoje."
        : "Có-có! A turma já está bem cuidada hoje.",
    );
  farm.valley.daily.cared.push(animal);
  return result(
    true,
    animal === "cow"
      ? "Carinho e capim fresco. Um bom dia para a vaquinha."
      : "Água fresca e um carinho. As galinhas agradecem!",
  );
}
export function collectAnimalProduct(
  farm: FarmState,
  animal: Animal,
  now = Date.now(),
): ActionResult {
  beginDay(farm, now);
  const product = animal === "cow" ? "milk" : "egg";
  if (!farm.valley.daily.cared.includes(animal))
    return result(
      false,
      animal === "cow"
        ? "Faça carinho na vaquinha antes de recolher o leite."
        : "Cumprimente as galinhas antes de recolher os ovos.",
    );
  if (farm.valley.daily.animalCollected.includes(animal))
    return result(
      false,
      animal === "cow"
        ? "O leite de hoje já foi recolhido."
        : "Os ovos de hoje já foram recolhidos.",
    );
  farm.valley.daily.animalCollected.push(animal);
  farm.animalProducts[product]++;
  return result(
    true,
    animal === "cow"
      ? `+1 ${ANIMAL_PRODUCTS.milk.name.toLowerCase()} na mochila.`
      : `+1 ${ANIMAL_PRODUCTS.egg.name.toLowerCase()} na mochila.`,
  );
}
export function workAt(
  farm: FarmState,
  site: Site,
  now = Date.now(),
): ActionResult {
  beginDay(farm, now);
  const status = chapterStatus(farm, now),
    flag = `work:${site}`;
  if (
    status.mode !== "available" ||
    !farm.valley.letterRead ||
    !status.chapter?.tasks.some((t) => t.flag === flag)
  )
    return result(
      false,
      "Este lugar faz parte das cartas do vale. Veja o capítulo atual no diário.",
    );
  if (farm.valley.flags.includes(flag))
    return result(
      false,
      "Tudo pronto por aqui. Encontre o morador para continuar.",
    );
  addFlag(farm, flag);
  return result(
    true,
    site === "bench"
      ? "Peças separadas. Bento vai gostar dessa organização."
      : site === "well"
        ? "As folhas saíram e a água está limpa outra vez."
        : site === "mill"
          ? "Você soltou a peça presa e encontrou uma caixa de cartas."
          : "Mesa preparada. Só falta reunir todo mundo e a colheita.",
  );
}
export function completeChapter(
  farm: FarmState,
  npc: Resident,
  now = Date.now(),
): ActionResult {
  beginDay(farm, now);
  const status = chapterStatus(farm, now);
  if (!status.ready || !status.chapter || status.chapter.recipient !== npc)
    return result(
      false,
      "Ainda falta um pedacinho do pedido. Confira os objetivos da carta.",
    );
  for (const [crop, count] of Object.entries(status.chapter.crops))
    farm.produce[crop as Crop] -= count;
  const s = farm.valley;
  s.chapter++;
  s.lastChapterDay = s.day;
  s.letterRead = false;
  s.flags = [];
  s.tokens += 2;
  s.friendship[npc] += 2;
  farm.coins += 25;
  return result(
    true,
    "O vale mudou um pouquinho. +2 selos da feira e +25 moedas. A lembrança está no diário.",
  );
}
export function deliverRequest(
  farm: FarmState,
  npc: Resident,
  now = Date.now(),
): ActionResult {
  beginDay(farm, now);
  const order = dailyRequest(farm),
    s = farm.valley;
  if (
    s.daily.delivered ||
    order.npc !== npc ||
    farm.produce[order.crop] < order.count
  )
    return result(
      false,
      "Confira os produtos e entregue ao morador que fez o pedido.",
    );
  farm.produce[order.crop] -= order.count;
  farm.coins += 30;
  s.tokens++;
  s.friendship[npc]++;
  s.daily.delivered = true;
  return result(
    true,
    "Encomenda entregue! +30 moedas, +1 selo e um sorriso de agradecimento.",
  );
}
export function completePostfair(
  farm: FarmState,
  npc: Resident,
  now = Date.now(),
): ActionResult {
  beginDay(farm, now);
  if (farm.valley.chapter < 7)
    return result(false, "A feira ainda está sendo preparada.");
  const event = dailyPostfair(farm);
  if (farm.valley.daily.postfairDone)
    return result(false, "A atividade de hoje já foi concluída.");
  if (event.npc !== npc)
    return result(false, `Hoje, ${event.npc} precisa de uma pequena ajuda.`);
  farm.valley.daily.postfairDone = true;
  farm.valley.tokens++;
  farm.valley.friendship[npc]++;
  farm.coins += 15;
  return result(true, `${event.title} concluído. +1 selo e +15 moedas.`);
}
export function completeFriendshipScene(
  farm: FarmState,
  npc: Resident,
  now = Date.now(),
): ActionResult {
  beginDay(farm, now);
  if (!RESIDENTS.includes(npc))
    return result(false, "Essa lembrança ainda não encontrou seu morador.");
  if (farm.valley.chapter < 7)
    return result(false, "Essa lembrança fica para depois da feira.");
  if (farm.valley.friendship[npc] < 3)
    return result(false, `${npc} ainda quer mais algumas conversas antes dessa lembrança.`);
  if (farm.valley.friendshipScenes.includes(npc))
    return result(false, "Essa lembrança já está guardada no diário.");
  farm.valley.friendshipScenes.push(npc);
  farm.valley.tokens++;
  return result(
    true,
    `${FRIENDSHIP_SCENES[npc].title} guardada no diário. +1 selo da feira.`,
  );
}
export function discover(farm: FarmState, now = Date.now()): ActionResult {
  beginDay(farm, now);
  if (farm.valley.daily.discovered)
    return result(false, "A descoberta de hoje já está guardada no diário.");
  const item = dailyDiscovery(farm);
  farm.valley.daily.discovered = true;
  farm.valley.tokens++;
  if (!farm.valley.keepsakes.includes(item.id)) {
    farm.valley.keepsakes.push(item.id);
    return result(true, `${item.name}! Uma nova lembrança e +1 selo da feira.`);
  }
  farm.coins += 10;
  return result(
    true,
    `${item.name}: uma lembrança conhecida. +1 selo e +10 moedas para o seu cantinho.`,
  );
}
export function buyDecoration(farm: FarmState, id: string): ActionResult {
  const decoration = DECORATIONS.find((d) => d.id === id);
  if (
    !decoration ||
    farm.valley.decorations.includes(decoration.id) ||
    farm.valley.tokens < decoration.price
  )
    return result(
      false,
      "Você precisa de mais selos ou já tem essa decoração.",
    );
  farm.valley.tokens -= decoration.price;
  farm.valley.decorations.push(decoration.id);
  farm.valley.activeDecorations.push(decoration.id);
  return result(
    true,
    `${decoration.name} já está no cenário. Seu cantinho está crescendo!`,
  );
}
export function toggleDecoration(farm: FarmState, id: string): ActionResult {
  const decoration = DECORATIONS.find((d) => d.id === id);
  if (!decoration || !farm.valley.decorations.includes(decoration.id))
    return result(false, "Essa decoração ainda não está na sua coleção.");
  const active = farm.valley.activeDecorations;
  if (active.includes(decoration.id))
    farm.valley.activeDecorations = active.filter((d) => d !== decoration.id);
  else active.push(decoration.id);
  return result(true, "Decoração atualizada.");
}
