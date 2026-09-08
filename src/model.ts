import { newValley, restoreValley, type ValleyState } from "./valley";
import { newTour, restoreTour, type TourState } from "./tour";

export const CROPS = {
  carrot: {
    name: "Cenoura",
    plural: "cenouras",
    seed: 5,
    price: 12,
    duration: 60_000,
  },
  turnip: {
    name: "Nabo",
    plural: "nabos",
    seed: 8,
    price: 19,
    duration: 90_000,
  },
  corn: {
    name: "Milho",
    plural: "milhos",
    seed: 12,
    price: 28,
    duration: 120_000,
  },
} as const;
export type Crop = keyof typeof CROPS;
export const cropKeys = Object.keys(CROPS) as Crop[];
export type Plot = { crop: Crop | null; plantedAt: number; watered: boolean };
export type FarmState = {
  version: 2;
  coins: number;
  seeds: Record<Crop, number>;
  produce: Record<Crop, number>;
  plots: Plot[];
  upgraded: boolean;
  harvested: number;
  sold: number;
  planted: number;
  startedAt: number;
  visited: string[];
  tour: TourState;
  valley: ValleyState;
};
export const emptyPlot = (): Plot => ({
  crop: null,
  plantedAt: 0,
  watered: false,
});
export function newFarm(now = Date.now()): FarmState {
  return {
    version: 2,
    valley: newValley(now),
    coins: 35,
    seeds: { carrot: 3, turnip: 1, corn: 0 },
    produce: { carrot: 0, turnip: 0, corn: 0 },
    plots: Array.from({ length: 24 }, (_, i) =>
      i < 6
        ? { crop: "carrot", plantedAt: now - 70_000, watered: true }
        : i < 8
          ? { crop: "turnip", plantedAt: now - 95_000, watered: true }
          : emptyPlot(),
    ),
    upgraded: false,
    harvested: 0,
    sold: 0,
    planted: 0,
    startedAt: now,
    visited: [],
    tour: newTour(),
  };
}
export function stage(plot: Plot, now = Date.now()): number {
  if (!plot.crop) return -1;
  if (!plot.watered) return 0;
  return now - plot.plantedAt >= CROPS[plot.crop].duration ? 2 : 1;
}
export function plotAction(
  state: FarmState,
  index: number,
  selected: string,
  now = Date.now(),
): string {
  const plot = state.plots[index];
  if (!plot || (index >= 18 && !state.upgraded))
    return "Este canteiro faz parte da expansão. Passe no mercado!";
  if (plot.crop && stage(plot, now) === 2) {
    const crop = plot.crop;
    state.produce[crop]++;
    state.harvested++;
    state.plots[index] = emptyPlot();
    return `+1 ${CROPS[crop].name.toLowerCase()} na mochila. Passe no mercado para vender!`;
  }
  if (plot.crop && !plot.watered) {
    plot.watered = true;
    plot.plantedAt = now;
    return "Terra regada! A plantação começou a crescer.";
  }
  if (plot.crop)
    return `Crescendo com carinho. Pronto em ${Math.max(1, Math.ceil((CROPS[plot.crop].duration - (now - plot.plantedAt)) / 1000))}s.`;
  if (!cropKeys.includes(selected as Crop))
    return "Escolha uma semente na barra abaixo para plantar aqui.";
  const crop = selected as Crop;
  if (state.seeds[crop] < 1)
    return "Você ficou sem essa semente. A Rosa tem mais no mercado.";
  state.seeds[crop]--;
  state.plots[index] = { crop, watered: false, plantedAt: now };
  state.planted++;
  return `${CROPS[crop].name} plantada! Clique novamente no canteiro para regar.`;
}
export function buySeed(state: FarmState, crop: Crop): boolean {
  if (state.coins < CROPS[crop].seed) return false;
  state.coins -= CROPS[crop].seed;
  state.seeds[crop]++;
  return true;
}
export function sellAll(state: FarmState): number {
  let total = 0;
  for (const crop of cropKeys) {
    total += state.produce[crop] * CROPS[crop].price;
    state.sold += state.produce[crop];
    state.produce[crop] = 0;
  }
  state.coins += total;
  return total;
}
export const UPGRADE_PRICE = 240;
export function upgrade(state: FarmState): boolean {
  if (state.upgraded || state.coins < UPGRADE_PRICE) return false;
  state.coins -= UPGRADE_PRICE;
  state.upgraded = true;
  return true;
}
function count(value: unknown): value is number {
  return (
    Number.isSafeInteger(value) &&
    (value as number) >= 0 &&
    (value as number) < 1e12
  );
}
export function restore(raw: string | null, now = Date.now()): FarmState {
  if (!raw) return newFarm(now);
  try {
    const s = JSON.parse(raw);
    if (
      !s ||
      (s.version !== 1 && s.version !== 2) ||
      !count(s.coins) ||
      !count(s.harvested) ||
      !count(s.sold) ||
      !count(s.planted) ||
      !Number.isFinite(s.startedAt) ||
      s.startedAt <= 0 ||
      typeof s.upgraded !== "boolean"
    )
      return newFarm(now);
    if (
      !s.seeds ||
      !s.produce ||
      !cropKeys.every((k) => count(s.seeds[k]) && count(s.produce[k]))
    )
      return newFarm(now);
    if (
      !Array.isArray(s.plots) ||
      s.plots.length !== 24 ||
      !s.plots.every(
        (p: Plot) =>
          p &&
          (p.crop === null || cropKeys.includes(p.crop)) &&
          Number.isFinite(p.plantedAt) &&
          p.plantedAt >= 0 &&
          typeof p.watered === "boolean",
      )
    )
      return newFarm(now);
    if (
      !Array.isArray(s.visited) ||
      !s.visited.every((v: unknown) => typeof v === "string")
    )
      return newFarm(now);
    return {
      ...s,
      version: 2,
      tour: restoreTour(s.tour),
      valley: s.version === 1 ? newValley(now) : restoreValley(s.valley, now),
    };
  } catch {
    return newFarm(now);
  }
}
export type Point = { x: number; y: number };
export function findPath(
  start: Point,
  goal: Point,
  blocked: Set<string>,
  width: number,
  height: number,
): Point[] {
  const key = (p: Point) => `${p.x},${p.y}`;
  if (
    blocked.has(key(goal)) ||
    goal.x < 0 ||
    goal.y < 0 ||
    goal.x >= width ||
    goal.y >= height
  )
    return [];
  if (key(start) === key(goal)) return [];
  const queue = [start],
    previous = new Map<string, Point | null>([[key(start), null]]);
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    if (key(p) === key(goal)) {
      const path: Point[] = [];
      let cur: Point | null = p;
      while (cur && key(cur) !== key(start)) {
        path.push(cur);
        cur = previous.get(key(cur)) ?? null;
      }
      return path.reverse();
    }
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const q = { x: p.x + dx, y: p.y + dy };
      const k = key(q);
      if (
        q.x < 0 ||
        q.y < 0 ||
        q.x >= width ||
        q.y >= height ||
        blocked.has(k) ||
        previous.has(k)
      )
        continue;
      previous.set(k, p);
      queue.push(q);
    }
  }
  return [];
}
