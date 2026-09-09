import { test } from "node:test";
import assert from "node:assert/strict";
import { newFarm, restore } from "../src/model";
import * as valley from "../src/valley";
import {
  dailyPostfair,
  FRIENDSHIP_SCENES,
  residentActivity,
  residentDialogue,
  residentWorkAsset,
} from "../src/valley-content";

const morning = new Date("2026-09-07T15:00:00Z").getTime();

test("an inconsistent story save recovers without erasing the farm", () => {
  const farm = newFarm(morning);
  farm.coins = 173;
  farm.valley.lastChapterDay = farm.valley.day;
  const loaded = restore(JSON.stringify(farm), morning);
  assert.equal(loaded.coins, 173);
  assert.equal(loaded.valley.chapter, 0);
  assert.equal(loaded.valley.lastChapterDay, null);
});

test("the saved timezone is retained when the environment default differs", () => {
  const farm = newFarm(morning);
  farm.valley = valley.newValley(morning, "Pacific/Kiritimati");
  const loaded = restore(JSON.stringify(farm), morning);
  assert.equal(loaded.valley.timezone, "Pacific/Kiritimati");
  valley.beginDay(loaded, Date.parse("2026-09-08T09:59:00Z"));
  assert.equal(loaded.valley.day, "2026-09-08");
  valley.beginDay(loaded, Date.parse("2026-09-08T10:01:00Z"));
  assert.equal(loaded.valley.day, "2026-09-09");
});

test("a mixed-crop chapter never consumes a partial delivery", () => {
  const farm = newFarm(morning);
  farm.valley.chapter = 6;
  valley.readLetter(farm, morning);
  for (const npc of ["Lia", "Bento", "Rosa"] as const)
    valley.talkTo(farm, npc, morning);
  valley.workAt(farm, "fair", morning);
  farm.produce = { carrot: 2, turnip: 1, corn: 0 };
  const before = structuredClone(farm);
  assert.equal(valley.completeChapter(farm, "Rosa", morning).ok, false);
  assert.deepEqual(farm, before);
});

test("new farms include daily progress without counting time spent as visits", () => {
  const farm = newFarm(morning);
  assert.equal(farm.version, 2);
  assert.ok("valley" in farm);
});

test("a v1 save retains its farm and inventory when story progress is introduced", () => {
  const legacy = {
    ...newFarm(morning),
    version: 1,
    coins: 173,
    harvested: 8,
    upgraded: true,
  };
  Reflect.deleteProperty(legacy, "valley");
  legacy.seeds.corn = 7;
  legacy.produce.turnip = 4;
  const migrated = restore(JSON.stringify(legacy), morning);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.coins, 173);
  assert.equal(migrated.seeds.corn, 7);
  assert.equal(migrated.produce.turnip, 4);
  assert.equal(migrated.upgraded, true);
  assert.deepEqual(migrated.plots, legacy.plots);
});

function farmAt(now = morning) {
  const farm = newFarm(now);
  farm.valley = valley.newValley(now, "America/Sao_Paulo");
  return farm;
}
function finishFirst(farm = farmAt(), now = morning) {
  valley.readLetter(farm, now);
  valley.talkTo(farm, "Lia", now);
  farm.produce.carrot = 2;
  assert.equal(valley.completeChapter(farm, "Lia", now).ok, true);
  return farm;
}

test("the chapter delivery is atomic and cannot be repeated on the same day", () => {
  const farm = farmAt();
  valley.readLetter(farm, morning);
  valley.talkTo(farm, "Lia", morning);
  farm.produce.carrot = 1;
  const coins = farm.coins;
  assert.equal(valley.completeChapter(farm, "Lia", morning).ok, false);
  assert.equal(farm.produce.carrot, 1);
  assert.equal(farm.coins, coins);
  farm.produce.carrot = 2;
  assert.equal(valley.completeChapter(farm, "Rosa", morning).ok, false);
  assert.equal(valley.completeChapter(farm, "Lia", morning).ok, true);
  assert.equal(farm.produce.carrot, 0);
  const rewarded = farm.valley.tokens;
  assert.equal(valley.completeChapter(farm, "Lia", morning).ok, false);
  assert.equal(farm.valley.tokens, rewarded);
  assert.equal(valley.chapterStatus(farm, morning).mode, "waiting");
});

test("the next local date unlocks a chapter without imposing a 24-hour wait", () => {
  const late = Date.parse("2026-09-07T02:50:00Z");
  const early = Date.parse("2026-09-07T03:01:00Z");
  const farm = finishFirst(farmAt(late), late);
  valley.beginDay(farm, early);
  assert.equal(farm.valley.day, "2026-09-07");
  assert.equal(farm.valley.visits, 2);
  assert.equal(valley.chapterStatus(farm, early).mode, "available");
  valley.beginDay(farm, early + 600_000);
  assert.equal(farm.valley.visits, 2);
});

test("absence preserves incomplete tasks and clock rollback never renews rewards", () => {
  const farm = farmAt();
  valley.readLetter(farm, morning);
  valley.talkTo(farm, "Lia", morning);
  valley.discover(farm, morning);
  const tokens = farm.valley.tokens;
  valley.beginDay(farm, morning - 86400000);
  assert.equal(valley.discover(farm, morning - 86400000).ok, false);
  assert.equal(farm.valley.tokens, tokens);
  valley.beginDay(farm, morning + 10 * 86400000);
  assert.equal(farm.valley.chapter, 0);
  assert.equal(farm.valley.letterRead, true);
  assert.ok(farm.valley.flags.includes("talk:Lia"));
  assert.equal(farm.valley.visits, 2);
  assert.equal(valley.discover(farm, morning + 10 * 86400000).ok, true);
});

test("reading a letter and opening the daily request cannot duplicate seed gifts", () => {
  const farm = farmAt();
  valley.readLetter(farm, morning);
  const seeds = { ...farm.seeds };
  valley.readLetter(farm, morning);
  valley.beginDay(farm, morning);
  assert.deepEqual(farm.seeds, seeds);
});

test("daily orders require the right resident and pay once per date", () => {
  const farm = farmAt();
  farm.valley.daily.requestId = "lia-carrots";
  valley.beginDay(farm, morning);
  const order = valley.dailyRequest(farm);
  if (order.kind !== "crop") throw new Error("expected crop request");
  farm.produce[order.crop] = 1;
  assert.equal(valley.deliverRequest(farm, order.npc, morning).ok, false);
  assert.equal(farm.produce[order.crop], 1);
  farm.produce[order.crop] = 2;
  assert.equal(
    valley.deliverRequest(farm, order.npc === "Lia" ? "Bento" : "Lia", morning)
      .ok,
    false,
  );
  assert.equal(valley.deliverRequest(farm, order.npc, morning).ok, true);
  assert.equal(farm.produce[order.crop], 0);
  const paid = farm.coins;
  assert.equal(valley.deliverRequest(farm, order.npc, morning).ok, false);
  assert.equal(farm.coins, paid);
});

test("talking and caring repeatedly cannot farm friendship", () => {
  const farm = farmAt();
  valley.talkTo(farm, "Lia", morning);
  const friendship = farm.valley.friendship.Lia;
  valley.talkTo(farm, "Lia", morning);
  assert.equal(farm.valley.friendship.Lia, friendship);
  valley.careFor(farm, "cow", morning);
  assert.equal(valley.careFor(farm, "cow", morning).ok, false);
  valley.talkTo(farm, "Lia", morning + 86400000);
  assert.ok(farm.valley.friendship.Lia > friendship);
});

test("resident routines and dialogue reflect their work and story progress", () => {
  assert.equal(residentActivity("Lia", 0), "rega a horta");
  assert.equal(residentActivity("Bento", 1), "ajusta o trator");
  assert.equal(residentActivity("Rosa", 2), "organiza a banca");
  assert.deepEqual((["Lia", "Bento", "Rosa"] as const).map(residentWorkAsset), [
    "can",
    "wrench",
    "basket",
  ]);
  const farm = farmAt();
  const first = residentDialogue(farm, "Lia", morning);
  valley.talkTo(farm, "Lia", morning);
  const repeated = residentDialogue(farm, "Lia", morning);
  assert.notEqual(first, repeated);
  farm.valley.chapter = 7;
  assert.match(residentDialogue(farm, "Rosa", morning), /feira/i);
});

test("post-fair activity rewards one short visit and resets on a new date", () => {
  const farm = farmAt();
  farm.valley.chapter = 7;
  const event = dailyPostfair(farm);
  const coins = farm.coins;
  const tokens = farm.valley.tokens;
  assert.equal(
    valley.completePostfair(farm, "Lia", morning).ok,
    event.npc === "Lia",
  );
  if (event.npc !== "Lia") {
    assert.equal(valley.completePostfair(farm, event.npc, morning).ok, true);
  }
  assert.equal(farm.valley.daily.postfairDone, true);
  assert.equal(farm.coins, coins + 15);
  assert.equal(farm.valley.tokens, tokens + 1);
  assert.equal(valley.completePostfair(farm, event.npc, morning).ok, false);
  valley.beginDay(farm, morning + 86400000);
  assert.equal(farm.valley.daily.postfairDone, false);
});

test("three post-fair activities unlock the fair badge", () => {
  const farm = farmAt();
  farm.valley.chapter = 7;
  farm.valley.postfairActivities = 2;
  farm.valley.daily.postfairId = dailyPostfair(farm).id;
  const event = dailyPostfair(farm);
  const result = valley.completePostfair(farm, event.npc, morning);
  assert.equal(result.ok, true);
  assert.equal(farm.valley.postfairActivities, 3);
  assert.ok(farm.unlockedAccessories.includes("badge"));
  assert.match(result.message, /Broche da feira/);
});

test("animal production requires daily care and is collected only once", () => {
  const farm = farmAt();
  assert.equal(valley.collectAnimalProduct(farm, "cow", morning).ok, false);
  assert.equal(valley.careFor(farm, "cow", morning).ok, true);
  assert.equal(valley.collectAnimalProduct(farm, "cow", morning).ok, true);
  assert.deepEqual(farm.animalProducts, { milk: 1, egg: 0 });
  assert.equal(valley.collectAnimalProduct(farm, "cow", morning).ok, false);
  valley.beginDay(farm, morning + 86_400_000);
  assert.equal(valley.careFor(farm, "cow", morning + 86_400_000).ok, true);
  assert.equal(
    valley.collectAnimalProduct(farm, "cow", morning + 86_400_000).ok,
    true,
  );
  assert.equal(farm.animalProducts.milk, 2);
});

test("friendship scenes unlock after the fair and remain one-time memories", () => {
  const farm = farmAt();
  assert.equal(valley.completeFriendshipScene(farm, "Lia", morning).ok, false);
  farm.valley.chapter = 7;
  farm.valley.friendship.Lia = 2;
  assert.equal(valley.completeFriendshipScene(farm, "Lia", morning).ok, false);
  farm.valley.friendship.Lia = 3;
  const tokens = farm.valley.tokens;
  assert.equal(valley.completeFriendshipScene(farm, "Lia", morning).ok, true);
  assert.deepEqual(farm.valley.friendshipScenes, ["Lia"]);
  assert.equal(farm.valley.tokens, tokens + 1);
  assert.equal(valley.completeFriendshipScene(farm, "Lia", morning).ok, false);
  assert.equal(FRIENDSHIP_SCENES.Lia.image, "flowerbed");
});

test("animal daily orders require collected products and pay once", () => {
  const farm = farmAt();
  farm.valley.daily.requestId = "lia-milk";
  const order = valley.dailyRequest(farm);
  assert.equal(order.kind, "animal");
  const seeds = structuredClone(farm.seeds);
  valley.beginDay(farm, morning);
  assert.deepEqual(farm.seeds, seeds);
  assert.equal(valley.deliverRequest(farm, "Lia", morning).ok, false);
  farm.animalProducts.milk = 1;
  const coins = farm.coins;
  assert.equal(valley.deliverRequest(farm, "Bento", morning).ok, false);
  assert.equal(valley.deliverRequest(farm, "Lia", morning).ok, true);
  assert.equal(farm.animalProducts.milk, 0);
  assert.equal(farm.coins, coins + 30);
  assert.equal(valley.deliverRequest(farm, "Lia", morning).ok, false);
});

test("decorations use earned stamps and can be toggled without being purchased twice", () => {
  const farm = farmAt();
  assert.equal(valley.buyDecoration(farm, "flowerbed").ok, false);
  farm.valley.tokens = 10;
  assert.equal(valley.buyDecoration(farm, "flowerbed").ok, true);
  const balance = farm.valley.tokens;
  assert.equal(valley.buyDecoration(farm, "flowerbed").ok, false);
  assert.equal(farm.valley.tokens, balance);
  assert.ok(farm.valley.activeDecorations.includes("flowerbed"));
  valley.toggleDecoration(farm, "flowerbed");
  assert.ok(!farm.valley.activeDecorations.includes("flowerbed"));
  valley.toggleDecoration(farm, "flowerbed");
  assert.equal(farm.valley.tokens, balance);
  assert.equal(valley.toggleDecoration(farm, "picnic").ok, false);
});

test("all seven chapters can be finished across visits and daily activities remain after the ending", () => {
  const farm = farmAt();
  const recipients = [
    "Lia",
    "Bento",
    "Rosa",
    "Lia",
    "Rosa",
    "Bento",
    "Rosa",
  ] as const;
  for (let chapter = 0; chapter < 7; chapter++) {
    const now = morning + chapter * 86400000;
    valley.readLetter(farm, now);
    for (const npc of ["Lia", "Bento", "Rosa"] as const)
      valley.talkTo(farm, npc, now);
    valley.careFor(farm, "cow", now);
    valley.careFor(farm, "chicken", now);
    for (const site of ["bench", "well", "mill", "fair"] as const)
      valley.workAt(farm, site, now);
    farm.produce = { carrot: 3, turnip: 2, corn: 2 };
    assert.equal(
      valley.completeChapter(farm, recipients[chapter], now).ok,
      true,
      `chapter ${chapter + 1}`,
    );
    assert.equal(farm.valley.chapter, chapter + 1);
  }
  assert.equal(
    valley.chapterStatus(farm, morning + 7 * 86400000).mode,
    "complete",
  );
  assert.equal(valley.discover(farm, morning + 7 * 86400000).ok, true);
  const saved = restore(JSON.stringify(farm), morning + 7 * 86400000);
  assert.deepEqual(saved.valley, farm.valley);
});
