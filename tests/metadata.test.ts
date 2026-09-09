import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = (path: string) => readFileSync(resolve(root, path), "utf8");

test("public pages expose share metadata for the live domain", () => {
  for (const path of ["index.html", "curriculo/index.html"]) {
    const source = html(path);
    assert.match(source, /<meta\s+property="og:title"\s+content="[^"]+"\s*\/>/);
    assert.match(
      source,
      /<meta\s+property="og:description"\s+content="[^"]+"\s*\/>/,
    );
    assert.match(
      source,
      /<meta\s+property="og:image"\s+content="https:\/\/imatheus\.com\/assets\/social-card\.png"\s*\/>/,
    );
    assert.match(
      source,
      /<meta\s+name="twitter:card"\s+content="summary_large_image"\s*\/>/,
    );
  }
});

test("the generated social card has the expected share dimensions", () => {
  const png = readFileSync(resolve(root, "public/assets/social-card.png"));
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});
