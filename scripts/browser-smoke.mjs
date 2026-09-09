import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-software-rasterizer"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const errors = [];
page.setDefaultTimeout(20000);
page.on("pageerror", (error) => errors.push(error.message));
async function snapshot(path) {
  await page.evaluate(() => window.__farm?.game.loop.sleep());
  try {
    await page.screenshot({
      path,
      fullPage: true,
      animations: "disabled",
      timeout: 20000,
    });
  } finally {
    await page.evaluate(() => window.__farm?.game.loop.wake());
  }
}
try {
  await page.goto(process.argv[2] ?? "http://localhost:5173", {
    waitUntil: "networkidle",
  });
  await page.locator("#enter-game:enabled").waitFor();
  await snapshot("/tmp/vale-loading.png");
  await page.locator("#enter-game").click();
  await page.waitForFunction(
    () => document.getElementById("loading").style.display === "none",
  );
  await snapshot("/tmp/vale-desktop.png");
  console.log("Fullscreen scene and loading screen verified.");
  const portfolioGuide = page.getByRole("note", {
    name: "Como explorar o portfólio",
  });
  await portfolioGuide
    .getByRole("button", { name: "Ver meu portfólio" })
    .click();
  await page
    .getByRole("heading", { name: "Explore o portfólio de Matheus" })
    .waitFor();
  await page.keyboard.press("Escape");
  await page.locator(".portfolio-button").click();
  await page.getByRole("button", { name: "Começar passeio" }).click();
  await page.waitForFunction(
    () => window.__farm.scene.portfolioStop?.id === "house",
  );
  assert.equal(
    await page.evaluate(() => window.__farm.scene.playerPath.length),
    0,
  );
  await page.locator('#portfolio-tour [data-tour="open-current"]').click();
  await page.getByRole("heading", { name: "Prazer, Matheus." }).waitFor();
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => window.__farm.state.tour.current === 1);
  await page.locator('#portfolio-tour [data-tour="cancel"]').click();
  await page.waitForFunction(() => window.__farm.state.tour.dismissed === true);
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#enter-game:enabled").click();
  await page.locator('#portfolio-tour [data-tour="resume"]').click();
  assert.equal(await page.evaluate(() => window.__farm.state.tour.current), 1);
  await page.locator('#portfolio-tour [data-tour="open-current"]').click();
  await page.getByRole("heading", { name: "A oficina de ideias." }).waitFor();
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => window.__farm.state.tour.current === 2);
  await page.locator('#portfolio-tour [data-tour="open-current"]').click();
  await page
    .getByRole("heading", { name: "Cada passo, uma história." })
    .waitFor();
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () =>
      window.__farm.state.tour.current === 3 &&
      window.__farm.state.tour.active === false,
  );
  await page.getByText("Agora você já conhece o caminho.").waitFor();
  assert.deepEqual(
    await page.evaluate(() => window.__farm.state.tour.visited),
    ["about", "projects", "career"],
  );
  console.log("Professional tour destination does not move the player.");
  if (await page.locator("#welcome-close").isVisible())
    await page.locator("#welcome-close").click();
  await page.locator("#journal-button").click();
  await page.locator('#modal-content [data-page="appearance"]').click();
  assert.equal(
    await page.locator('[data-accessory="badge"]').isDisabled(),
    true,
  );
  await page.getByText("Faltam 3 atividades", { exact: true }).waitFor();
  await page.locator('[data-appearance="sunset"]').click();
  await page.waitForFunction(
    () =>
      window.__farm.state.appearance === "sunset" &&
      window.__farm.scene.player.texture.key === "player-sunset",
  );
  await page.locator('[data-accessory="scarf"]').click();
  await page.waitForFunction(
    () =>
      window.__farm.state.accessory === "scarf" &&
      window.__farm.scene.player.texture.key === "player-sunset-scarf",
  );
  console.log(
    "Character appearance, accessory and live sprite swaps verified.",
  );
  await page.keyboard.press("Escape");
  const initial = await page.evaluate(() => ({
    x: window.__farm.scene.player.x,
    y: window.__farm.scene.player.y,
  }));
  async function clickWorld(x, y) {
    const position = await page.evaluate(
      ({ x, y }) => {
        const s = window.__farm.scene,
          c = s.cameras.main;
        const p = c.matrix.transformPoint(x - c.scrollX, y - c.scrollY);
        const r = s.game.canvas.getBoundingClientRect();
        return { x: r.left + p.x, y: r.top + p.y };
      },
      { x, y },
    );
    await page.mouse.click(position.x, position.y);
  }
  async function clickActor(name) {
    const position = await page.evaluate((actorName) => {
      const actor = window.__farm.scene.actors.find(
        (candidate) => candidate.name === actorName,
      );
      return actor ? { x: actor.sprite.x, y: actor.sprite.y } : null;
    }, name);
    assert.ok(position, `actor ${name} should exist`);
    await clickWorld(position.x, position.y);
  }
  async function openTarget(id) {
    await page.evaluate((targetId) => {
      const target = window.__farm.scene.targets.find(
        (candidate) => candidate.id === targetId,
      );
      if (!target) throw new Error(`target ${targetId} should exist`);
      target.action();
    }, id);
  }
  await clickWorld(480, 380);
  await page.waitForFunction(
    ({ x }) => Math.abs(window.__farm.scene.player.x - x) > 10,
    initial,
  );
  await clickWorld(419, 249);
  await page.waitForFunction(
    () => window.__farm.state.harvested > 0,
    {},
    { timeout: 25000 },
  );
  assert.equal(
    await page.evaluate(() => window.__farm.state.produce.carrot),
    1,
  );
  await page.locator('[data-tool="carrot"]').click();
  await clickWorld(419, 249);
  await page.waitForFunction(() => window.__farm.state.planted > 0);
  await clickWorld(419, 249);
  await page.waitForFunction(() => window.__farm.state.plots[0].watered);
  console.log("Click navigation, harvest, planting and watering verified.");
  await page.locator(".portfolio-button").click();
  await page.locator('#modal-content [data-page="about"]').click();
  await page.getByRole("heading", { name: "Prazer, Matheus." }).waitFor();
  await page
    .getByText("Tech Lead @ Humanizadas · Arquitetura de Soluções & Inovação", {
      exact: true,
    })
    .waitFor();
  await page.getByText("Sistemas de Informação", { exact: false }).waitFor();
  await page.locator('#modal-content [data-page="career"]').click();
  assert.equal(await page.locator(".career-timeline article").count(), 5);
  await page
    .getByRole("heading", { name: "The Brooklyn Brothers", exact: true })
    .waitFor();
  await page.locator('#modal-content [data-page="skills"]').click();
  await page.getByText("Oracle Cloud", { exact: true }).waitFor();
  await page.locator('#modal-content [data-page="projects"]').click();
  assert.equal(
    await page
      .locator('a[href="https://github.com/mhdsilva/meta-portifolio"]')
      .count(),
    1,
  );
  await page.locator('#modal-content [data-page="case-farm"]').click();
  await page
    .getByRole("heading", { name: "A fazenda como portfólio." })
    .waitFor();
  await page.getByText("Decisões de construção", { exact: true }).waitFor();
  await page.locator('#modal-content [data-page="projects"]').click();
  await page.locator('#modal-content [data-page="case-meta"]').click();
  await page
    .getByRole("heading", { name: "Um portfólio que se constrói." })
    .waitFor();
  await page.getByText("Seis atos, uma narrativa", { exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await page.locator(".portfolio-button").click();
  await page.locator('#modal-content [data-page="contact"]').click();
  assert.equal(
    await page
      .locator('a[href="mailto:matheushenrique2773@gmail.com"]')
      .count(),
    1,
  );
  assert.equal(
    await page
      .locator('a[href="https://linkedin.com/in/matheushenrique2773"]')
      .count(),
    1,
  );
  assert.equal(await page.locator('a[href="tel:+5534998147021"]').count(), 1);
  await snapshot("/tmp/vale-contact.png");
  await page.keyboard.press("Escape");
  await page.locator("#bag-button").click();
  await page.getByRole("heading", { name: "Sua mochila" }).waitFor();
  await page.keyboard.press("Escape");
  await clickWorld(220, 386);
  await page
    .getByRole("heading", { name: "Mercado da Rosa" })
    .waitFor({ timeout: 20000 });
  await page.locator("#sell").click();
  assert.equal(await page.evaluate(() => window.__farm.state.sold), 1);
  const seedsBefore = await page.evaluate(() => window.__farm.state.seeds.corn);
  await page.locator('[data-buy="corn"]').click();
  assert.equal(
    await page.evaluate(() => window.__farm.state.seeds.corn),
    seedsBefore + 1,
  );
  await page.keyboard.press("Escape");
  await openTarget("barn");
  await page.getByRole("heading", { name: "Um dia bom no pasto." }).waitFor();
  assert.equal(
    await page.locator('[data-valley="collect-animal"]').isDisabled(),
    true,
  );
  await page.keyboard.press("Escape");
  await clickActor("cow");
  await page.waitForFunction(() =>
    window.__farm.state.valley.daily.cared.includes("cow"),
  );
  await openTarget("barn");
  await page.locator('[data-valley="collect-animal"]:not([disabled])').click();
  await page.waitForFunction(
    () => window.__farm.state.animalProducts.milk === 1,
  );
  await page.keyboard.press("Escape");
  await openTarget("market");
  await page.getByRole("heading", { name: "Mercado da Rosa" }).waitFor();
  await page.locator("#sell").click();
  await page.waitForFunction(
    () => window.__farm.state.animalProducts.milk === 0,
  );
  console.log("Animal care, collection and sale verified.");
  await page.keyboard.press("Escape");
  await page.addInitScript(() => {
    if (sessionStorage.getItem("animal-order-smoke-patched")) return;
    const key = "vale-do-matheus:v1";
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const farm = JSON.parse(raw);
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: farm.valley.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    farm.valley.day = ["year", "month", "day"]
      .map((type) => parts.find((part) => part.type === type)?.value)
      .join("-");
    farm.valley.daily.requestId = "lia-milk";
    farm.valley.daily.seeded = true;
    farm.valley.daily.delivered = false;
    farm.animalProducts.milk = 1;
    localStorage.setItem(key, JSON.stringify(farm));
    sessionStorage.setItem("animal-order-smoke-patched", "1");
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#enter-game:enabled").click();
  await page.locator("#journal-button").click();
  await page.locator('#modal-content [data-page="request"]').click();
  await page.getByText("1 leite", { exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await openTarget("Lia");
  await page.locator('[data-valley="request"]').click();
  await page.waitForFunction(() => window.__farm.state.valley.daily.delivered);
  assert.equal(
    await page.evaluate(() => window.__farm.state.animalProducts.milk),
    0,
  );
  console.log("Animal product daily order and delivery verified.");
  await page.keyboard.press("Escape");
  assert.deepEqual(
    await page.evaluate(() =>
      Object.fromEntries(
        window.__farm.scene.actors
          .filter((actor) => ["Lia", "Bento", "Rosa"].includes(actor.name))
          .map((actor) => [actor.name, actor.work?.texture.key]),
      ),
    ),
    { Lia: "can", Bento: "wrench", Rosa: "basket" },
  );
  const npcBefore = await page.evaluate(() =>
    window.__farm.scene.actors.map((a) => ({ x: a.sprite.x, y: a.sprite.y })),
  );
  await page.waitForTimeout(7000);
  const npcAfter = await page.evaluate(() =>
    window.__farm.scene.actors.map((a) => ({ x: a.sprite.x, y: a.sprite.y })),
  );
  assert.ok(
    npcBefore.some(
      (p, i) => Math.hypot(p.x - npcAfter[i].x, p.y - npcAfter[i].y) > 5,
    ),
  );
  console.log("Shop, portfolio and autonomous routines verified.");
  const before = await page.evaluate(() => window.__farm.state);
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#enter-game:enabled").waitFor();
  await page.locator("#enter-game").click();
  await page.waitForFunction(
    () => document.getElementById("loading").style.display === "none",
  );
  assert.deepEqual(await page.evaluate(() => window.__farm.state), before);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  assert.equal(
    await page.locator("#portfolio-tour").evaluate((panel) => {
      const rect = panel.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= innerWidth;
    }),
    true,
  );
  assert.equal(
    await page.evaluate(
      () =>
        document.querySelector(".game-stage").getBoundingClientRect().height ===
        innerHeight,
    ),
    true,
  );
  await snapshot("/tmp/vale-mobile.png");
  assert.deepEqual(errors, []);
  console.log(
    "Browser smoke passed: rendering, click movement, harvest, planting, watering, actual shop purchases and sales, autonomous NPCs, portfolio, inventory, persistence and mobile layout.",
  );
} catch (error) {
  await snapshot("/tmp/vale-failure.png").catch(() => {});
  console.error(
    await page.evaluate(() => {
      const s = window.__farm?.scene;
      return s
        ? {
            player: { x: s.player.x, y: s.player.y },
            path: s.playerPath,
            pending: s.pending?.id,
            harvested: window.__farm.state.harvested,
            toast: document.getElementById("toast").textContent,
            modal: document.getElementById("modal").open,
            fps: s.game.loop.actualFps,
            actors: s.actors.map((a) => ({
              name: a.name,
              x: a.sprite.x,
              y: a.sprite.y,
              path: a.path.length,
            })),
          }
        : {};
    }),
  );
  throw error;
} finally {
  await browser.close();
}
