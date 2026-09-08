import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const base = (process.argv[2] ?? "http://127.0.0.1:5173").replace(/\/$/, "");
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-software-rasterizer"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(15000);
const errors = [],
  requests = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => requests.push(r.url()));
try {
  await page.goto(`${base}/curriculo/`, { waitUntil: "networkidle" });
  await page
    .getByRole("heading", { level: 1, name: "Matheus Henrique da Silva" })
    .waitFor();
  assert.equal(await page.locator("#resume-experience article").count(), 5);
  await page.getByRole("heading", { name: "Formação", exact: true }).waitFor();
  assert.equal(
    await page
      .locator('a[href="mailto:matheushenrique2773@gmail.com"]')
      .count(),
    1,
  );
  assert.equal(await page.locator("canvas").count(), 0);
  assert.equal(
    requests.some((url) => /phaser|\/src\/game|\/assets\/game-/.test(url)),
    false,
  );
  assert.equal(
    await page.evaluate(() => localStorage.getItem("vale-do-matheus:v1")),
    null,
  );
  await page.screenshot({
    path: "/tmp/portfolio-resume-desktop.png",
    fullPage: true,
  });
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator(".resume-toolbar").isVisible(), false);
  await page.pdf({
    path: "/tmp/portfolio-resume.pdf",
    format: "A4",
    preferCSSPageSize: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({
    path: "/tmp/portfolio-resume-mobile.png",
    fullPage: true,
  });
  const nojs = await browser.newPage({ javaScriptEnabled: false });
  await nojs.goto(`${base}/curriculo/`);
  await nojs
    .getByRole("heading", { level: 1, name: "Matheus Henrique da Silva" })
    .waitFor();
  await nojs.close();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("#enter-game:enabled").waitFor();
  assert.equal(
    await page.locator('#loading a[href$="curriculo/"]').isVisible(),
    true,
  );
  const width = await page
    .locator(".loading-content")
    .evaluate((el) => el.getBoundingClientRect().width);
  assert.ok(width > 900, `Opening should use the screen; got ${width}px`);
  await page.evaluate(() => window.__farm?.game.loop.sleep());
  await page.screenshot({
    path: "/tmp/portfolio-opening.png",
    animations: "disabled",
  });
  await page.evaluate(() => window.__farm?.game.loop.wake());
  await page.locator('#loading a[href$="curriculo/"]').click();
  await page
    .getByRole("heading", { level: 1, name: "Matheus Henrique da Silva" })
    .waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "Direct curriculum, no game download/save, static HTML, print, mobile and opening shortcut verified.",
  );
} finally {
  await browser.close();
}
