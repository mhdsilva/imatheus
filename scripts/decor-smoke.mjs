import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { newFarm } from "../src/model.ts";

// Isolated ending fixture to verify paid overlays without skipping story tests.
const fixture = newFarm();
fixture.valley.chapter = 7;
fixture.valley.lastChapterDay = fixture.valley.day;
fixture.valley.tokens = 20;
const browser = await chromium.launch({
  channel: "chrome",
  args: ["--no-sandbox", "--disable-gpu", "--disable-software-rasterizer"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.addInitScript((farm) => {
  if (!localStorage.getItem("vale-do-matheus:v1"))
    localStorage.setItem("vale-do-matheus:v1", JSON.stringify(farm));
}, fixture);
try {
  await page.goto(process.argv[2] ?? "http://localhost:5173", {
    waitUntil: "networkidle",
  });
  await page.locator("#enter-game:enabled").click();
  await page.waitForFunction(
    () => document.getElementById("loading").style.display === "none",
  );
  await page.locator("#journal-button").click();
  await page.locator('#modal-content [data-page="decor"]').click();
  for (const id of ["flowerbed", "picnic", "bunting"])
    await page.locator(`[data-decoration="${id}"][data-valley="buy"]`).click();
  await page.keyboard.press("Escape");
  const depths = await page.evaluate(() => {
    const children = window.__farm.scene.children.getChildren();
    return {
      bunting: children.find((c) => c.texture?.key === "bunting").depth,
      house: children.find((c) => c.texture?.key === "house").depth,
    };
  });
  assert.ok(
    depths.bunting > depths.house,
    `Bunting (${depths.bunting}) must overlay roof (${depths.house})`,
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#enter-game:enabled").click();
  await page.waitForFunction(
    () => document.getElementById("loading").style.display === "none",
  );
  assert.equal(await page.evaluate(() => window.__farm.state.valley.tokens), 8);
  await page.evaluate(() => window.__farm.game.loop.sleep());
  await page.screenshot({
    path: "/tmp/vale-decor-complete.png",
    animations: "disabled",
  });
  await page.evaluate(() => window.__farm.game.loop.wake());
  await page.locator("#journal-button").click();
  await page.locator('#modal-content [data-page="decor"]').click();
  await page
    .locator('[data-decoration="bunting"][data-valley="toggle"]')
    .click();
  assert.equal(
    await page.evaluate(
      () =>
        window.__farm.scene.children
          .getChildren()
          .find((c) => c.texture?.key === "bunting").visible,
    ),
    false,
  );
  assert.equal(await page.evaluate(() => window.__farm.state.valley.tokens), 8);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Paid decorations, roof overlay, persistence, free toggle and mobile diary verified.",
  );
} finally {
  await browser.close();
}
