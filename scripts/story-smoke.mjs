import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { newFarm } from "../src/model.ts";
import { newValley } from "../src/valley.ts";
import { CHAPTERS } from "../src/valley-content.ts";

const now = Date.parse("2026-09-07T15:00:00Z");
const fixture = newFarm(now);
fixture.valley = newValley(now, "America/Sao_Paulo");
fixture.valley.daily.requestId = "lia-carrots";
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-software-rasterizer"],
});
let page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  timezoneId: "America/Sao_Paulo",
});
page.setDefaultTimeout(15000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.clock.setFixedTime(new Date(now));
await page.addInitScript((farm) => {
  if (!localStorage.getItem("vale-do-matheus:v1"))
    localStorage.setItem("vale-do-matheus:v1", JSON.stringify(farm));
}, fixture);
async function clickTarget(id) {
  const point = await page.evaluate((id) => {
    const scene = window.__farm.scene;
    const target = scene.targets.find((t) => t.id === id);
    if (!target) throw new Error(`Missing target ${id}`);
    const x = target.sprite?.x ?? target.x,
      y = target.sprite
        ? target.sprite.y - target.sprite.displayHeight / 2
        : target.y - 5;
    const camera = scene.cameras.main;
    const point = camera.matrix.transformPoint(
      x - camera.scrollX,
      y - camera.scrollY,
    );
    const rect = scene.game.canvas.getBoundingClientRect();
    return { x: rect.left + point.x, y: rect.top + point.y };
  }, id);
  await page.mouse.click(point.x, point.y);
}
async function openTarget(id) {
  await page.evaluate((targetId) => {
    const target = window.__farm.scene.targets.find((t) => t.id === targetId);
    if (!target) throw new Error(`Missing target ${targetId}`);
    target.action();
  }, id);
}
async function enter() {
  await page.locator("#enter-game:enabled").click();
  await page.waitForFunction(
    () => document.getElementById("loading").style.display === "none",
  );
}
try {
  await page.goto(process.argv[2] ?? "http://localhost:5175", {
    waitUntil: "networkidle",
  });
  await enter();
  await page.locator("#journal-button").click();
  await page
    .locator("#modal-content")
    .getByRole("heading", { name: "A carta sem assinatura", exact: true })
    .waitFor();
  await page.locator('[data-valley="read"]').click();
  const seeds = await page.evaluate(() => window.__farm.state.seeds);
  await page.keyboard.press("Escape");
  await page.locator("#journal-button").click();
  assert.deepEqual(await page.evaluate(() => window.__farm.state.seeds), seeds);
  await page.keyboard.press("Escape");
  for (let index = 0; index < 4; index++) {
    await clickTarget(`plot-${index}`);
    await page.waitForFunction(
      (count) => window.__farm.state.harvested === count,
      index + 1,
    );
  }
  await clickTarget("Lia");
  await page
    .locator('[data-valley="chapter"]')
    .waitFor({ state: "visible", timeout: 25000 });
  await page.locator('[data-valley="chapter"]').click();
  await page.waitForFunction(() => window.__farm.state.valley.chapter === 1);
  await page.keyboard.press("Escape");
  await clickTarget("Lia");
  await page.locator('[data-valley="request"]').click({ timeout: 25000 });
  await page.waitForFunction(() => window.__farm.state.valley.daily.delivered);
  await page.keyboard.press("Escape");
  await clickTarget("daily-discovery");
  await page.waitForFunction(
    () => window.__farm.state.valley.daily.discovered,
    {},
    { timeout: 25000 },
  );
  await page.locator("#journal-button").click();
  await page
    .getByText("A próxima carta chega em outro dia de visita.", {
      exact: false,
    })
    .waitFor();
  await page.locator('#modal-content [data-page="decor"]').click();
  await page
    .locator('[data-decoration="flowerbed"][data-valley="buy"]')
    .click();
  await page.waitForFunction(() =>
    window.__farm.state.valley.activeDecorations.includes("flowerbed"),
  );
  await page.keyboard.press("Escape");
  console.log(
    "Letter, physical harvesting, resident delivery, daily order, discovery and decoration verified.",
  );
  await page.clock.setFixedTime(new Date(now + 86400000));
  await page.reload({ waitUntil: "networkidle" });
  await enter();
  await page.locator("#journal-button").click();
  await page
    .locator("#modal-content")
    .getByRole("heading", { name: "Madeira que ainda serve", exact: true })
    .waitFor();
  assert.equal(await page.evaluate(() => window.__farm.state.valley.visits), 2);
  assert.equal(
    await page.evaluate(() => window.__farm.state.valley.daily.delivered),
    false,
  );
  await page.keyboard.press("Escape");
  // Continue the actual UI arc across six dates. Only crop inventories are
  // fixtures here; cultivation was exercised above and in browser-smoke.mjs.
  let progress = await page.evaluate(() => window.__farm.state);
  for (let chapterIndex = 1; chapterIndex < CHAPTERS.length; chapterIndex++) {
    const chapter = CHAPTERS[chapterIndex];
    Object.assign(progress.produce, chapter.crops);
    await page.close();
    page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      timezoneId: "America/Sao_Paulo",
    });
    page.setDefaultTimeout(25000);
    page.on("pageerror", (error) => errors.push(error.message));
    await page.clock.setFixedTime(new Date(now + chapterIndex * 86400000));
    await page.addInitScript(
      (farm) =>
        localStorage.setItem("vale-do-matheus:v1", JSON.stringify(farm)),
      progress,
    );
    await page.goto(process.argv[2] ?? "http://localhost:5173", {
      waitUntil: "networkidle",
    });
    await enter();
    await page.locator("#journal-button").click();
    await page.locator('[data-valley="read"]').click();
    await page.keyboard.press("Escape");
    for (const task of chapter.tasks) {
      const [kind, name] = task.flag.split(":");
      if (kind === "talk") {
        await clickTarget(name);
        await page.locator("#modal[open]").waitFor();
        await page.keyboard.press("Escape");
      } else if (kind === "work") {
        await clickTarget(`work-${name}`);
        await page.locator('[data-valley="work"]').click();
        await page.keyboard.press("Escape");
      } else if (kind === "care") {
        const id = await page.evaluate(
          (name) =>
            window.__farm.scene.targets.find((t) => t.id.startsWith(`${name}-`))
              .id,
          name,
        );
        await clickTarget(id);
      }
      await page.waitForFunction(
        (flag) => window.__farm.state.valley.flags.includes(flag),
        task.flag,
      );
    }
    await clickTarget(chapter.recipient);
    await page.locator('[data-valley="chapter"]').click();
    await page.waitForFunction(
      (index) => window.__farm.state.valley.chapter === index + 1,
      chapterIndex,
    );
    await page.keyboard.press("Escape");
    progress = await page.evaluate(() => window.__farm.state);
    console.log(`UI chapter ${chapterIndex + 1}: ${chapter.title}`);
  }
  assert.equal(progress.valley.chapter, 7);
  if (await page.locator("#modal[open]").count())
    await page.locator("#modal").evaluate((dialog) => dialog.close());
  const postfairNpc = await page.evaluate(() => {
    const residentByEvent = {
      "lia-garden": "Lia",
      "bento-workshop": "Bento",
      "rosa-table": "Rosa",
    };
    return residentByEvent[window.__farm.state.valley.daily.postfairId];
  });
  assert.ok(postfairNpc, "the daily post-fair event should have a resident");
  await openTarget(postfairNpc);
  await page.locator("#modal[open]").waitFor();
  const action = page.locator('[data-valley="postfair"]');
  await action.waitFor({ state: "visible" });
  await action.click();
  await page.waitForFunction(
    () => window.__farm.state.valley.daily.postfairDone,
  );
  await page.keyboard.press("Escape");
  const sceneNpc = await page.evaluate(() =>
    ["Lia", "Bento", "Rosa"].find(
      (npc) =>
        window.__farm.state.valley.friendship[npc] >= 3 &&
        !window.__farm.state.valley.friendshipScenes.includes(npc),
    ),
  );
  assert.ok(sceneNpc, "at least one friendship scene should be available");
  await openTarget(sceneNpc);
  await page.locator("#modal[open]").waitFor();
  await page.locator('[data-valley="friendship-scene"]').click();
  await page.waitForFunction(
    (npc) => window.__farm.state.valley.friendshipScenes.includes(npc),
    sceneNpc,
  );
  await page.keyboard.press("Escape");
  await page.locator("#journal-button").click();
  await page.locator('#modal-content [data-page="collection"]').click();
  await page.getByText("Memórias dos moradores", { exact: true }).waitFor();
  const textures = await page.evaluate(() =>
    window.__farm.scene.children
      .getChildren()
      .filter((c) => c.visible && c.texture)
      .map((c) => c.texture.key),
  );
  for (const texture of [
    "mill",
    "mill-sails",
    "well",
    "stall",
    "workbench",
    "lantern",
    "flowerbed",
  ])
    assert.ok(
      textures.includes(texture),
      `Restored scenery missing ${texture}`,
    );
  await page.evaluate(() => window.__farm.game.loop.sleep());
  await page.screenshot({
    path: "/tmp/vale-story-complete.png",
    animations: "disabled",
  });
  await page.evaluate(() => window.__farm.game.loop.wake());
  await page.keyboard.press("Escape");
  await page.locator(".portfolio-button").click();
  await page.locator('#modal-content [data-page="about"]').click();
  await page.getByRole("heading", { name: "Prazer, Matheus." }).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "Seven calendar chapters via UI, repairs, animal care, restored scenery and unrestricted portfolio verified.",
  );
} catch (error) {
  console.log(
    await page.evaluate(() => ({
      state: window.__farm?.state,
      player: window.__farm?.scene.player && {
        x: window.__farm.scene.player.x,
        y: window.__farm.scene.player.y,
      },
      modal: document.getElementById("modal-content")?.textContent,
      toast: document.getElementById("toast")?.textContent,
    })),
  );
  await page.evaluate(() => window.__farm?.game.loop.sleep());
  await page.screenshot({
    path: "/tmp/vale-story-failure.png",
    animations: "disabled",
  });
  throw error;
} finally {
  await browser.close();
}
