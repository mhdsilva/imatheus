import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buySeed,
  findPath,
  newFarm,
  plotAction,
  restore,
  sellAll,
  stage,
  upgrade,
} from "../src/model";
import { newTour } from "../src/tour";

test("a visitor completes the harvest, sell, purchase, plant and grow loop", () => {
  const now = 2_000_000,
    state = newFarm(now);
  plotAction(state, 0, "hand", now);
  assert.equal(state.produce.carrot, 1);
  assert.equal(state.plots[0].crop, null);
  assert.equal(sellAll(state), 12);
  assert.equal(state.coins, 47);
  assert.equal(state.sold, 1);
  assert.equal(buySeed(state, "corn"), true);
  assert.equal(state.coins, 35);
  plotAction(state, 0, "corn", now);
  assert.equal(state.seeds.corn, 0);
  assert.equal(stage(state.plots[0], now + 999_999), 0);
  plotAction(state, 0, "water", now + 1000);
  assert.equal(stage(state.plots[0], now + 120_999), 1);
  assert.equal(stage(state.plots[0], now + 121_000), 2);
  plotAction(state, 0, "hand", now + 121_000);
  assert.equal(state.produce.corn, 1);
});
test("economy cannot buy without funds, duplicate sales, or purchase an expansion twice", () => {
  const state = newFarm();
  state.coins = 0;
  assert.equal(buySeed(state, "carrot"), false);
  assert.equal(state.seeds.carrot, 3);
  assert.equal(upgrade(state), false);
  assert.equal(sellAll(state), 0);
  state.coins = 300;
  assert.equal(upgrade(state), true);
  assert.equal(state.coins, 60);
  assert.equal(upgrade(state), false);
  state.produce.turnip = 2;
  assert.equal(sellAll(state), 38);
  assert.equal(sellAll(state), 0);
});
test("locked plots do not consume seeds until the upgrade is purchased", () => {
  const state = newFarm();
  plotAction(state, 18, "carrot");
  assert.equal(state.seeds.carrot, 3);
  assert.equal(state.plots[18].crop, null);
  state.coins = 240;
  upgrade(state);
  plotAction(state, 18, "carrot");
  assert.equal(state.seeds.carrot, 2);
  assert.equal(state.plots[18].crop, "carrot");
});
test("save restoration preserves progress and recovers safely from invalid data", () => {
  const state = newFarm();
  plotAction(state, 1, "hand");
  sellAll(state);
  assert.deepEqual(restore(JSON.stringify(state)), state);
  for (const value of [
    "bad json",
    "null",
    "{}",
    JSON.stringify({ ...state, coins: -1 }),
    JSON.stringify({ ...state, plots: [{}] }),
    JSON.stringify({ ...state, version: 999 }),
  ])
    assert.equal(restore(value).coins, 35);
});
test("v2 save without a tour keeps farm and valley progress", () => {
  const state = newFarm();
  state.coins = 77;
  state.plots[0].crop = null;
  const legacy = structuredClone(state) as { tour?: unknown };
  delete legacy.tour;
  const restored = restore(JSON.stringify(legacy));
  assert.equal(restored.coins, 77);
  assert.equal(restored.plots[0].crop, null);
  assert.deepEqual(restored.valley, state.valley);
  assert.deepEqual(restored.tour, newTour());
});
test("paths navigate around fences without crossing blocked cells", () => {
  const walls = new Set(["2,0", "2,1", "2,2", "2,3"]);
  const path = findPath({ x: 0, y: 1 }, { x: 4, y: 1 }, walls, 6, 6);
  assert.deepEqual(path.at(-1), { x: 4, y: 1 });
  assert.ok(path.some((p) => p.y === 4));
  let prev = { x: 0, y: 1 };
  for (const p of path) {
    assert.ok(!walls.has(`${p.x},${p.y}`));
    assert.equal(Math.abs(prev.x - p.x) + Math.abs(prev.y - p.y), 1);
    prev = p;
  }
  assert.deepEqual(findPath({ x: 0, y: 0 }, { x: 2, y: 0 }, walls, 6, 6), []);
  assert.deepEqual(findPath({ x: 0, y: 0 }, { x: -1, y: 0 }, walls, 6, 6), []);
});
