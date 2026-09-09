import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

// Source artwork: integer-pixel shapes, a shared palette, no external images.
const out = new URL("../public/assets/", import.meta.url);
mkdirSync(out, { recursive: true });
const P = {
  ink: "#493d39",
  wood: "#98603d",
  woodL: "#c68a4e",
  cream: "#f6dfad",
  light: "#fff0c3",
  green: "#518448",
  leaf: "#78aa49",
  lime: "#a5c85d",
  dark: "#35694a",
  red: "#bd594b",
  redL: "#e57b59",
  roof: "#b95842",
  roofL: "#df7950",
  blue: "#597e92",
  sky: "#99c4c0",
  yellow: "#f5c35c",
  soil: "#a77448",
};
let W, H, pixels;
function canvas(w, h) {
  W = w;
  H = h;
  pixels = Buffer.alloc(w * h * 4);
}
function rgb(c) {
  c = P[c] || c;
  return [
    parseInt(c.slice(1, 3), 16),
    parseInt(c.slice(3, 5), 16),
    parseInt(c.slice(5, 7), 16),
    255,
  ];
}
function rect(x, y, w, h, c) {
  const v = rgb(c);
  for (let yy = Math.max(0, y | 0); yy < Math.min(H, y + h); yy++)
    for (let xx = Math.max(0, x | 0); xx < Math.min(W, x + w); xx++) {
      const i = (yy * W + xx) * 4;
      for (let j = 0; j < 4; j++) pixels[i + j] = v[j];
    }
}
function ellipse(x, y, rx, ry, c) {
  for (let yy = -ry; yy <= ry; yy++)
    for (let xx = -rx; xx <= rx; xx++)
      if ((xx * xx) / (rx * rx) + (yy * yy) / (ry * ry) <= 1)
        rect(x + xx, y + yy, 1, 1, c);
}
function poly(points, c) {
  for (let y = 0; y < H; y++) {
    let xs = [];
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const a = points[i],
        b = points[j];
      if (a[1] > y !== b[1] > y)
        xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i < xs.length; i += 2)
      rect(
        Math.ceil(xs[i]),
        y,
        Math.floor(xs[i + 1]) - Math.ceil(xs[i]) + 1,
        1,
        c,
      );
  }
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function chunk(type, data) {
  const t = Buffer.from(type),
    b = Buffer.concat([t, data]);
  let crc = 0xffffffff;
  for (const v of b) crc = crcTable[(crc ^ v) & 255] ^ (crc >>> 8);
  const head = Buffer.alloc(4),
    tail = Buffer.alloc(4);
  head.writeUInt32BE(data.length);
  tail.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([head, b, tail]);
}
const metadata = {};
function save(name) {
  const head = Buffer.alloc(13);
  head.writeUInt32BE(W, 0);
  head.writeUInt32BE(H, 4);
  head[8] = 8;
  head[9] = 6;
  const rows = [];
  for (let y = 0; y < H; y++)
    rows.push(Buffer.from([0]), pixels.subarray(y * W * 4, (y + 1) * W * 4));
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", head),
    chunk("IDAT", deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(new URL(`${name}.png`, out), png);
  metadata[name] = { width: W, height: H };
}
let seed = 42;
function rand(n) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed % n;
}

for (let v = 0; v < 4; v++) {
  canvas(16, 16);
  rect(0, 0, 16, 16, "#91b96b");
  for (let i = 0; i < 14; i++)
    rect(
      rand(16),
      rand(16),
      rand(2) + 1,
      1,
      ["#9dc376", "#85ad60", "#a5c67a"][rand(3)],
    );
  save(`grass${v}`);
}
canvas(16, 16);
rect(0, 0, 16, 16, "#ddbd82");
for (let i = 0; i < 15; i++)
  rect(rand(16), rand(16), 1, 1, ["#e9cb93", "#ceac72"][rand(2)]);
save("path");
canvas(16, 16);
rect(0, 0, 16, 16, "#b18351");
rect(0, 1, 16, 13, "#9d7048");
for (let y = 3; y < 15; y += 4) {
  rect(1, y, 14, 1, "#bf8b55");
  rect(2, y + 1, 12, 1, "#88643f");
}
save("soil");
canvas(16, 16);
rect(0, 0, 16, 16, "#597f63");
for (let y = 3; y < 15; y += 4) {
  rect(1, y, 14, 1, "#759469");
  rect(2, y + 1, 12, 1, "#456d57");
}
save("wet-soil");
canvas(16, 16);
rect(0, 0, 16, 16, "#73b8bc");
rect(1, 3, 7, 1, "#9ad3ce");
rect(10, 11, 5, 1, "#92cec8");
rect(4, 15, 8, 1, "#68abb4");
save("water");

canvas(48, 64);
ellipse(24, 58, 17, 4, "#6f9555");
rect(21, 34, 8, 25, "wood");
rect(24, 38, 3, 20, "woodL");
poly(
  [
    [21, 53],
    [15, 60],
    [24, 57],
    [33, 60],
    [28, 51],
  ],
  "wood",
);
ellipse(24, 31, 22, 17, "dark");
ellipse(17, 24, 16, 16, "green");
ellipse(30, 22, 15, 17, "green");
ellipse(24, 14, 15, 13, "leaf");
ellipse(14, 20, 10, 10, "leaf");
ellipse(31, 25, 10, 10, "leaf");
ellipse(24, 12, 9, 8, "lime");
rect(9, 25, 4, 2, "lime");
rect(33, 29, 4, 2, "lime");
rect(14, 37, 5, 2, "leaf");
save("tree");
canvas(28, 22);
ellipse(14, 17, 13, 4, "#75964f");
ellipse(9, 12, 8, 8, "green");
ellipse(19, 11, 8, 8, "leaf");
ellipse(13, 7, 8, 6, "leaf");
rect(10, 4, 5, 2, "lime");
rect(18, 12, 2, 2, "redL");
rect(7, 10, 2, 2, "redL");
save("bush");
canvas(20, 16);
ellipse(10, 12, 9, 3, "#78945e");
poly(
  [
    [2, 11],
    [5, 4],
    [12, 2],
    [17, 7],
    [18, 12],
    [10, 14],
  ],
  "#8e9d8f",
);
poly(
  [
    [5, 4],
    [12, 2],
    [15, 7],
    [8, 9],
    [2, 11],
  ],
  "#b0b8a0",
);
rect(9, 5, 4, 1, "#d3d3b3");
save("rock");
canvas(32, 20);
rect(0, 7, 32, 3, "wood");
rect(0, 13, 32, 2, "wood");
for (const x of [2, 26]) {
  rect(x, 3, 4, 17, "wood");
  rect(x, 3, 3, 15, "cream");
  rect(x, 3, 4, 2, "light");
}
rect(0, 7, 32, 1, "cream");
rect(0, 13, 32, 1, "woodL");
save("fence");

function windowAt(x, y, w = 12, h = 14) {
  rect(x - 2, y - 2, w + 4, h + 4, "wood");
  rect(x, y, w, h, "blue");
  rect(x + 1, y + 1, w - 2, 3, "sky");
  rect(x + (w >> 1), y, 1, h, "cream");
  rect(x, y + (h >> 1), w, 1, "cream");
  rect(x - 3, y + h + 2, w + 6, 2, "woodL");
}
function building(name, kind) {
  canvas(112, 104);
  ellipse(56, 96, 51, 5, "#799957");
  const barn = kind === "barn",
    shop = kind === "shop";
  rect(14, 46, 84, 49, barn ? "red" : "cream");
  rect(14, 91, 84, 5, "wood");
  rect(94, 48, 5, 43, barn ? "#9b4d43" : "#d4b98a");
  for (let y = 53; y < 91; y += 7)
    rect(16, y, 78, 1, barn ? "#a74e43" : "#ddc598");
  rect(13, 44, 5, 48, barn ? "cream" : "woodL");
  rect(91, 44, 5, 48, barn ? "cream" : "woodL");
  poly(
    [
      [5, 49],
      [52, 9],
      [104, 46],
      [104, 52],
      [7, 52],
    ],
    "wood",
  );
  poly(
    [
      [5, 45],
      [52, 6],
      [107, 45],
    ],
    barn ? "#83544d" : "roof",
  );
  poly(
    [
      [10, 43],
      [52, 10],
      [101, 43],
    ],
    barn ? "#a26a58" : "roofL",
  );
  for (let y = 17; y <= 42; y += 6) {
    const half = (y - 6) * 1.25;
    rect(
      Math.max(10, 52 - half),
      y,
      Math.min(93, half * 2),
      2,
      barn ? "#83544d" : "roof",
    );
  }
  rect(5, 46, 102, 4, "wood");
  rect(9, 46, 94, 2, barn ? "cream" : "#edab6c");
  if (barn) {
    rect(39, 57, 35, 37, "cream");
    rect(42, 60, 29, 34, "#804b3d");
    rect(44, 61, 11, 32, "red");
    rect(58, 61, 11, 32, "red");
    for (let y = 0; y < 26; y++) {
      rect(44 + Math.floor(y * 0.42), 64 + y, 2, 2, "cream");
      rect(68 - Math.floor(y * 0.42), 64 + y, 2, 2, "cream");
    }
    rect(55, 60, 3, 34, "cream");
    windowAt(22, 61, 9, 12);
    windowAt(80, 61, 8, 12);
    rect(43, 34, 23, 11, "cream");
    rect(46, 37, 17, 5, "wood");
  } else {
    rect(47, 66, 21, 29, "wood");
    rect(50, 69, 15, 25, "#6f5741");
    rect(51, 70, 13, 12, "blue");
    rect(61, 85, 2, 2, "yellow");
    windowAt(24, 63);
    windowAt(77, 63);
    rect(43, 95, 29, 3, "#c1b69a");
    rect(40, 98, 35, 3, "#d7cbb0");
    rect(77, 11, 9, 19, "#a58670");
    rect(75, 10, 13, 4, "cream");
    if (shop) {
      rect(17, 51, 76, 11, "cream");
      for (let x = 17; x < 93; x += 12) rect(x, 51, 6, 11, "green");
      rect(18, 61, 74, 3, "dark");
    }
  }
  for (const x of [18, 83]) {
    rect(x, 88, 10, 7, "wood");
    ellipse(x + 5, 85, 7, 5, "green");
    rect(x + 3, 81, 2, 3, "yellow");
    rect(x + 7, 84, 2, 2, "redL");
  }
  save(name);
}
building("house", "house");
building("barn", "barn");
building("market", "shop");
canvas(76, 67);
ellipse(38, 61, 35, 4, "#779953");
rect(9, 25, 58, 35, "wood");
rect(12, 28, 52, 29, "woodL");
for (let x = 15; x < 65; x += 8) rect(x, 29, 1, 26, "wood");
poly(
  [
    [3, 28],
    [18, 7],
    [62, 7],
    [74, 29],
  ],
  "wood",
);
poly(
  [
    [5, 25],
    [19, 5],
    [61, 5],
    [71, 25],
  ],
  "#dba74d",
);
for (let y = 10; y < 25; y += 5)
  rect(15 - (y - 10) / 2, y, 48 + y - 10, 1, "#b7873f");
rect(30, 35, 18, 25, "#5b503c");
windowAt(15, 35, 9, 10);
rect(48, 57, 21, 4, "cream");
save("coop");
canvas(62, 46);
ellipse(30, 40, 29, 4, "#789650");
rect(11, 20, 41, 14, "dark");
rect(13, 16, 22, 14, "#6e9c6a");
rect(15, 16, 17, 3, "#a7be6e");
rect(36, 6, 18, 22, "dark");
rect(38, 9, 12, 15, "sky");
rect(38, 10, 3, 14, "blue");
rect(34, 5, 23, 4, "#c0c785");
rect(17, 8, 3, 10, "ink");
rect(14, 8, 6, 3, "ink");
rect(8, 23, 5, 8, "cream");
for (const [x, y, r] of [
  [18, 34, 9],
  [46, 33, 12],
]) {
  ellipse(x, y, r, r, "ink");
  ellipse(x, y, r - 3, r - 3, "#798077");
  ellipse(x, y, r - 5, r - 5, "cream");
  rect(x - 1, y - 2, 3, 4, "wood");
}
save("tractor");
canvas(28, 36);
rect(12, 17, 4, 18, "wood");
rect(3, 4, 23, 17, "wood");
rect(4, 5, 20, 13, "#689a87");
rect(5, 6, 17, 3, "#8fb49a");
rect(18, 7, 3, 7, "cream");
rect(7, 12, 9, 1, "dark");
rect(24, 1, 2, 12, "red");
rect(25, 1, 3, 5, "redL");
save("mailbox");
canvas(36, 38);
rect(7, 15, 4, 22, "wood");
rect(27, 15, 4, 22, "wood");
rect(2, 3, 33, 23, "wood");
rect(4, 5, 29, 19, "cream");
for (let i = 0; i < 3; i++) {
  rect(7 + i * 8, 8, 6, 9, ["#ecd08a", "#a2bba0", "#d8a38a"][i]);
  rect(8 + i * 8, 10, 4, 1, "wood");
}
rect(3, 3, 31, 2, "woodL");
save("board");

// A 32 × 48 source frame leaves room for facial features, layered clothing and
// replaceable hair / hat / outfit palettes, while rendering at a small world size.
function person(name, shirt, hat, overrides = {}) {
  canvas(128, 192);
  const outfits = {
    player: {
      hair: "#634b36",
      pants: "#507481",
      light: "#76949a",
      trim: "#c1ac79",
    },
    farmer: {
      hair: "#824d32",
      pants: "#59756b",
      light: "#82a18a",
      trim: "#ebc883",
    },
    mechanic: {
      hair: "#473c37",
      pants: "#4b5d69",
      light: "#74838a",
      trim: "#b2a181",
    },
    merchant: {
      hair: "#654639",
      pants: "#7e6578",
      light: "#aa8590",
      trim: "#e0b886",
    },
  };
  const o = {
    ...outfits[name.startsWith("player-") ? "player" : name],
    ...overrides,
  };
  for (let dir = 0; dir < 4; dir++)
    for (let f = 0; f < 4; f++) {
      const ox = f * 32,
        oy = dir * 48,
        bob = f % 2,
        side = dir === 1 || dir === 2,
        back = dir === 3;
      const r = (x, y, w, h, c) => rect(ox + x, oy + y - bob, w, h, c);
      const e = (x, y, rx, ry, c) => ellipse(ox + x, oy + y - bob, rx, ry, c);
      const stride = f === 1 ? 2 : f === 3 ? -2 : 0;
      // Boots, trouser seams and soles.
      r(9, 34, 6, 9 + stride, o.pants);
      r(18, 34, 6, 9 - stride, o.pants);
      r(10, 35, 2, 6 + stride, o.light);
      r(19, 35, 2, 6 - stride, o.light);
      r(8, 41 + stride, 7, 4, "#574437");
      r(17, 41 - stride, 8, 4, "#574437");
      r(9, 41 + stride, 5, 1, "#927354");
      r(18, 41 - stride, 5, 1, "#927354");
      r(8, 45 + stride, 7, 1, "#3d3933");
      r(17, 45 - stride, 8, 1, "#3d3933");
      // Shirt silhouette and sleeves.
      r(9, 23, 15, 13, "#57614c");
      r(10, 23, 13, 11, shirt);
      r(6, 24 + stride, 4, 7, shirt);
      r(24, 24 - stride, 4, 7, shirt);
      r(6, 30 + stride, 4, 4, "#d49b75");
      r(24, 30 - stride, 4, 4, "#d49b75");
      r(7, 30 + stride, 3, 3, "#efbd8b");
      r(24, 30 - stride, 3, 3, "#efbd8b");
      r(11, 24, 2, 10, o.light);
      r(21, 24, 2, 10, o.light);
      r(12, 28, 10, 9, o.pants);
      r(14, 29, 6, 5, o.light);
      r(15, 30, 4, 3, o.pants);
      r(12, 27, 2, 2, "yellow");
      r(21, 27, 2, 2, "yellow");
      r(11, 35, 12, 2, "#485b57");
      r(16, 35, 3, 2, o.trim);
      // Neck, ears and shaded face.
      r(14, 20, 6, 5, "#d49b75");
      r(15, 21, 4, 3, "#efbd8b");
      e(16, 15, 9, 9, o.hair);
      r(8, 12, 17, 9, o.hair);
      r(8, 15, 2, 5, "#d49b75");
      r(24, 15, 2, 5, "#d49b75");
      r(10, 12, 14, 9, "#efbd8b");
      r(12, 11, 10, 11, "#f7cda0");
      r(11, 21, 11, 2, "#dca57c");
      r(13, 22, 7, 1, "#d49b75");
      r(9, 9, 16, 5, o.hair);
      r(10, 12, 3, 3, o.hair);
      r(22, 12, 3, 4, o.hair);
      r(12, 9, 3, 2, "#9a7047");
      r(18, 10, 4, 2, "#9a7047");
      if (!back) {
        if (!side) {
          r(12, 15, 3, 1, "#785541");
          r(20, 15, 3, 1, "#785541");
          r(13, 16, 2, 3, "#343b32");
          r(21, 16, 2, 3, "#343b32");
          r(13, 16, 1, 1, "#fff1d2");
          r(21, 16, 1, 1, "#fff1d2");
          r(11, 19, 3, 1, "#e5a087");
          r(22, 19, 2, 1, "#e5a087");
          r(17, 18, 2, 2, "#db9e78");
          r(16, 21, 4, 1, "#ab765b");
        } else {
          const eye = dir === 1 ? 11 : 22;
          r(eye, 15, 2, 1, "#785541");
          r(eye, 16, 2, 3, "#343b32");
          r(eye, 16, 1, 1, "#fff1d2");
          r(dir === 1 ? 8 : 24, 18, 2, 2, "#e5b080");
          r(dir === 1 ? 10 : 21, 21, 3, 1, "#ab765b");
          r(dir === 1 ? 20 : 10, 13, 3, 9, o.hair);
        }
      } else {
        r(9, 11, 16, 10, o.hair);
        r(11, 18, 11, 5, o.hair);
        r(11, 12, 2, 7, "#79563c");
        r(17, 13, 2, 8, "#79563c");
        r(23, 12, 1, 6, "#3f3630");
        r(12, 24, 2, 11, o.light);
        r(21, 24, 2, 11, o.light);
        r(14, 28, 8, 8, o.pants);
      }
      if (hat) {
        r(8, 5, 17, 5, "#bd8e46");
        r(10, 2, 13, 7, "#e1b760");
        r(12, 1, 9, 2, "#f0cc7a");
        r(11, 3, 11, 2, "#efcd80");
        r(9, 7, 15, 2, "#8b683e");
        r(4, 9, 25, 3, "#b28b48");
        r(5, 9, 23, 2, "#f0cf83");
        r(7, 8, 19, 2, "#eac471");
        for (let x = 8; x < 26; x += 4) r(x, 10, 1, 1, "#bc974f");
      } else if (name === "mechanic") {
        r(9, 6, 16, 4, "#597c85");
        r(11, 4, 12, 3, "#73929a");
        r(dir === 1 ? 5 : 20, 9, 8, 2, "#3d616c");
        r(14, 6, 4, 2, "#c7caa2");
      } else {
        r(9, 8, 3, 15, o.hair);
        r(23, 9, 3, 14, o.hair);
        r(23, 12, 3, 3, "#e4ba81");
        r(10, 10, 1, 10, "#8c6648");
      }
    }
  save(name);
  metadata[name].frameWidth = 32;
  metadata[name].frameHeight = 48;
  metadata[name].directions = ["down", "left", "right", "up"];
  metadata[name].framesPerDirection = 4;
}
person("player", "#eee0b7", true);
person("player-sunset", "#d98262", true, {
  hair: "#5a3e46",
  pants: "#714f68",
  light: "#b27b75",
  trim: "#f1c873",
});
person("player-berry", "#b5628c", false, {
  hair: "#4d3a49",
  pants: "#5e567c",
  light: "#907bb2",
  trim: "#eac19a",
});
person("farmer", "#db8961", true);
person("mechanic", "#6d92a3", false);
person("merchant", "#bb7891", false);
canvas(32, 40);
rect(6, 19, 21, 21, "#d88862");
rect(12, 26, 10, 14, "#769b9c");
rect(8, 8, 16, 15, "#f4c89a");
rect(7, 7, 19, 6, "wood");
rect(9, 2, 15, 8, "yellow");
rect(4, 9, 25, 4, "cream");
rect(12, 16, 2, 2, "ink");
rect(21, 16, 2, 2, "ink");
rect(16, 21, 4, 1, "#bd806b");
save("farmer-portrait");
canvas(20, 20);
ellipse(10, 17, 8, 2, "#7a995c");
rect(7, 14, 2, 5, "woodL");
rect(13, 14, 2, 5, "woodL");
ellipse(10, 11, 7, 5, "light");
ellipse(14, 7, 4, 5, "light");
rect(12, 2, 2, 3, "red");
rect(15, 3, 2, 2, "redL");
rect(15, 6, 1, 2, "ink");
rect(18, 8, 2, 2, "yellow");
rect(6, 9, 4, 3, "cream");
rect(2, 7, 3, 4, "light");
save("chicken");
canvas(36, 28);
ellipse(18, 24, 16, 3, "#79985a");
for (const x of [7, 12, 24, 29]) {
  rect(x, 18, 3, 7, "cream");
  rect(x, 24, 3, 2, "ink");
}
ellipse(18, 13, 14, 9, "light");
rect(7, 7, 7, 7, "#655949");
rect(20, 6, 6, 5, "#655949");
rect(19, 13, 8, 6, "#655949");
rect(1, 10, 3, 12, "cream");
rect(26, 7, 9, 13, "light");
rect(24, 6, 4, 3, "cream");
rect(33, 6, 3, 3, "cream");
rect(27, 12, 2, 2, "ink");
rect(33, 12, 2, 2, "ink");
rect(27, 17, 8, 5, "#dba493");
rect(29, 19, 1, 1, "wood");
rect(33, 19, 1, 1, "wood");
save("cow");
canvas(20, 20);
ellipse(10, 18, 7, 2, "#7a995c");
rect(6, 7, 8, 10, "cream");
rect(8, 4, 4, 4, "light");
rect(9, 2, 2, 3, "blue");
rect(7, 8, 6, 2, "sky");
rect(7, 14, 6, 2, "#e5c985");
rect(14, 10, 2, 4, "ink");
rect(15, 9, 2, 2, "light");
save("milk");
canvas(20, 20);
ellipse(10, 17, 7, 2, "#7a995c");
ellipse(10, 11, 6, 8, "cream");
ellipse(8, 8, 2, 3, "light");
rect(13, 13, 2, 2, "#e1b66d");
rect(6, 14, 2, 2, "#d7b26e");
save("egg");

for (const crop of ["carrot", "turnip", "corn"]) {
  for (let stage = 0; stage < 3; stage++) {
    canvas(16, 24);
    if (stage === 0) {
      rect(7, 17, 2, 5, "green");
      rect(4, 17, 4, 2, "leaf");
      rect(9, 15, 3, 3, "lime");
    } else if (crop === "corn") {
      rect(7, 5, 2, 17, "green");
      for (let y = 8; y < 21; y += 5) {
        poly(
          [
            [8, y + 3],
            [2, y - 2],
            [3, y + 3],
            [8, y + 5],
          ],
          "leaf",
        );
        poly(
          [
            [8, y],
            [14, y - 4],
            [13, y + 1],
            [8, y + 4],
          ],
          "lime",
        );
      }
      if (stage === 2) {
        rect(5, 7, 3, 8, "yellow");
        rect(9, 12, 3, 7, "yellow");
        rect(7, 1, 1, 5, "cream");
      }
    } else {
      if (stage === 2) {
        if (crop === "carrot")
          poly(
            [
              [4, 15],
              [12, 15],
              [10, 21],
              [7, 23],
            ],
            "#ef994c",
          );
        else {
          ellipse(8, 18, 5, 4, "light");
          rect(4, 15, 8, 3, "#c397b3");
        }
      }
      rect(7, 10, 2, 8, "green");
      poly(
        [
          [8, 15],
          [2, 10],
          [2, 6],
          [5, 8],
          [8, 13],
        ],
        "leaf",
      );
      poly(
        [
          [8, 14],
          [9, 5],
          [12, 3],
          [12, 8],
        ],
        "dark",
      );
      poly(
        [
          [8, 14],
          [13, 8],
          [15, 9],
          [13, 13],
        ],
        "lime",
      );
    }
    save(`${crop}-${stage}`);
  }
}
for (const name of ["carrot", "turnip", "corn"]) {
  canvas(24, 24);
  if (name === "carrot") {
    poly(
      [
        [6, 9],
        [16, 12],
        [7, 23],
        [3, 23],
      ],
      "#e99949",
    );
    rect(7, 13, 5, 2, "#f8bd68");
    rect(12, 4, 3, 7, "green");
    poly(
      [
        [14, 9],
        [16, 2],
        [20, 1],
        [18, 8],
      ],
      "leaf",
    );
    rect(8, 3, 3, 6, "leaf");
  }
  if (name === "turnip") {
    ellipse(12, 15, 8, 7, "light");
    rect(6, 9, 12, 4, "#b48aab");
    rect(11, 3, 2, 8, "green");
    rect(5, 3, 7, 3, "leaf");
    rect(13, 1, 5, 4, "lime");
  }
  if (name === "corn") {
    ellipse(12, 13, 5, 10, "yellow");
    for (let y = 5; y < 22; y += 4) rect(10, y, 4, 1, "#d19a3f");
    poly(
      [
        [9, 23],
        [3, 12],
        [5, 8],
        [11, 17],
      ],
      "green",
    );
    poly(
      [
        [13, 23],
        [21, 8],
        [19, 6],
        [13, 17],
      ],
      "leaf",
    );
  }
  save(name);
}
canvas(24, 24);
rect(5, 10, 15, 11, "wood");
rect(6, 11, 13, 8, "woodL");
rect(4, 9, 17, 3, "cream");
rect(7, 4, 2, 6, "wood");
rect(17, 4, 2, 6, "wood");
rect(8, 3, 10, 2, "wood");
for (let y = 13; y < 21; y += 3) rect(6, y, 13, 1, "cream");
save("basket");
canvas(24, 24);
rect(7, 9, 12, 12, "blue");
rect(8, 10, 10, 3, "sky");
rect(17, 5, 5, 3, "blue");
rect(20, 7, 2, 8, "blue");
poly(
  [
    [7, 13],
    [2, 9],
    [0, 11],
    [7, 19],
  ],
  "blue",
);
rect(6, 20, 14, 2, "#446c80");
rect(9, 6, 6, 3, "sky");
save("can");
canvas(24, 24);
rect(7, 2, 11, 5, "wood");
rect(8, 3, 8, 3, "cream");
rect(4, 7, 17, 15, "wood");
rect(5, 7, 15, 13, "woodL");
rect(5, 7, 15, 5, "cream");
rect(11, 10, 3, 5, "wood");
rect(7, 16, 11, 5, "#aa744a");
rect(8, 16, 9, 1, "cream");
save("bag");
canvas(24, 30);
rect(11, 13, 2, 17, "green");
poly(
  [
    [11, 25],
    [3, 19],
    [3, 16],
    [9, 19],
  ],
  "leaf",
);
poly(
  [
    [13, 22],
    [20, 16],
    [21, 19],
    [15, 24],
  ],
  "green",
);
for (let a = 0; a < 8; a++) {
  const t = (a * Math.PI) / 4;
  ellipse(
    Math.round(12 + Math.cos(t) * 6),
    Math.round(9 + Math.sin(t) * 6),
    3,
    3,
    "yellow",
  );
}
ellipse(12, 9, 4, 4, "wood");
rect(10, 7, 2, 2, "woodL");
save("sunflower");
canvas(16, 16);
rect(7, 7, 2, 9, "green");
for (const [x, y] of [
  [5, 4],
  [9, 4],
  [3, 7],
  [11, 7],
  [7, 2],
])
  rect(x, y, 3, 3, "#f3dfa6");
rect(7, 6, 3, 3, "yellow");
save("flower");
canvas(24, 22);
rect(2, 7, 20, 12, "#d7b365");
rect(3, 5, 18, 13, "yellow");
for (let x = 5; x < 22; x += 4) rect(x, 6, 1, 12, "#bd984d");
rect(2, 11, 20, 2, "woodL");
save("hay");
canvas(24, 12);
ellipse(12, 6, 11, 5, "#557855");
save("shadow");
// Cartas do Vale: original, deterministic pixel artwork for the evolving village.
for (const restored of [false, true]) {
  canvas(80, 110);
  ellipse(40, 104, 32, 5, "#678250");
  poly(
    [
      [20, 100],
      [26, 34],
      [54, 34],
      [62, 100],
    ],
    "ink",
  );
  poly(
    [
      [23, 98],
      [29, 35],
      [51, 35],
      [59, 98],
    ],
    restored ? "cream" : "#a7a38a",
  );
  for (let y = 53; y < 99; y += 11) {
    rect(25, y, 32, 2, restored ? "#c0aa7c" : "#878977");
    rect(32 + (y % 3) * 6, y - 9, 1, 9, "#b3a788");
  }
  poly(
    [
      [17, 40],
      [40, 10],
      [63, 40],
    ],
    "ink",
  );
  poly(
    [
      [21, 37],
      [40, 14],
      [59, 37],
    ],
    restored ? "roofL" : "#887d65",
  );
  for (let y = 26; y < 38; y += 5)
    rect(30 - (y - 26), y, 20 + (y - 26) * 2, 1, restored ? "roof" : "wood");
  rect(34, 77, 14, 23, "ink");
  rect(36, 79, 10, 21, "wood");
  rect(37, 80, 1, 19, "woodL");
  rect(43, 90, 2, 2, "yellow");
  rect(35, 53, 12, 14, "ink");
  rect(37, 55, 8, 10, restored ? "sky" : "wood");
  rect(40, 55, 2, 10, "cream");
  if (!restored) {
    rect(17, 38, 48, 4, "wood");
    poly(
      [
        [34, 21],
        [38, 19],
        [50, 73],
        [46, 75],
      ],
      "woodL",
    );
    ellipse(24, 95, 10, 5, "green");
    rect(38, 84, 11, 3, "#68694e");
  }
  save(restored ? "mill" : "mill-old");
  canvas(80, 60);
  ellipse(40, 56, 36, 3, "#6d8353");
  rect(9, 21, 4, 36, "wood");
  rect(67, 21, 4, 36, "wood");
  rect(8, 42, 64, 12, "ink");
  rect(10, 43, 60, 9, "woodL");
  for (let x = 13; x < 70; x += 12) rect(x, 44, 1, 8, "wood");
  if (restored) {
    poly(
      [
        [7, 6],
        [68, 6],
        [78, 28],
        [1, 28],
      ],
      "ink",
    );
    for (let i = 0; i < 6; i++) {
      poly(
        [
          [9 + i * 10, 8],
          [18 + i * 10, 8],
          [26 + i * 10, 26],
          [3 + i * 12, 26],
        ],
        i % 2 ? "cream" : "green",
      );
      rect(3 + i * 12, 27, 12, 5, i % 2 ? "light" : "leaf");
    }
    for (let i = 0; i < 8; i++) {
      ellipse(16 + i * 7, 39, 4, 3, i % 2 ? "yellow" : "redL");
      rect(16 + i * 7, 34, 1, 3, "green");
    }
  } else {
    rect(10, 20, 61, 3, "wood");
    poly(
      [
        [13, 42],
        [15, 38],
        [65, 52],
        [62, 55],
      ],
      "wood",
    );
    ellipse(58, 50, 10, 3, "green");
  }
  save(restored ? "stall" : "stall-old");
  canvas(42, 46);
  ellipse(21, 39, 18, 6, "ink");
  rect(4, 30, 34, 10, "#8d998b");
  ellipse(21, 30, 17, 6, "#c0c3a8");
  ellipse(21, 30, 12, 3, restored ? "blue" : "#69765f");
  for (let x = 7; x < 37; x += 9) rect(x, 35, 1, 6, "#727e70");
  rect(7, 10, 3, 23, "wood");
  rect(32, 10, 3, 23, "wood");
  poly(
    [
      [1, 14],
      [21, 1],
      [41, 14],
    ],
    "ink",
  );
  poly(
    [
      [4, 12],
      [21, 3],
      [38, 12],
    ],
    restored ? "roofL" : "wood",
  );
  rect(20, 14, 1, 15, "cream");
  rect(18, 25, 7, 6, "woodL");
  if (!restored) {
    ellipse(9, 32, 6, 3, "green");
    ellipse(28, 30, 5, 2, "leaf");
  }
  save(restored ? "well" : "well-old");
  canvas(48, 30);
  rect(6, 13, 4, 16, "wood");
  rect(37, 13, 4, 16, "wood");
  rect(7, 24, 32, 3, "woodL");
  rect(2, 9, 44, 7, "ink");
  rect(3, 9, 42, 4, restored ? "woodL" : "#978467");
  if (restored) {
    rect(13, 3, 3, 8, "wood");
    rect(9, 2, 11, 4, "blue");
    rect(27, 6, 12, 3, "cream");
    rect(33, 4, 4, 2, "sky");
  } else {
    rect(8, 7, 19, 3, "wood");
    rect(22, 4, 17, 4, "#afa07b");
  }
  save(restored ? "workbench" : "workbench-old");
}
canvas(64, 64);
for (let i = 0; i < 4; i++) {
  const transform = ([x, y]) => {
    for (let n = 0; n < i; n++) [x, y] = [-y, x];
    return [x + 32, y + 32];
  };
  poly(
    [
      [-2, -30],
      [7, -30],
      [4, -4],
      [-2, 0],
    ].map(transform),
    "wood",
  );
  poly(
    [
      [0, -28],
      [5, -28],
      [3, -7],
      [0, -5],
    ].map(transform),
    "cream",
  );
  for (let y = -25; y < -8; y += 5)
    poly(
      [
        [0, y],
        [5, y],
        [5, y + 1],
        [0, y + 1],
      ].map(transform),
      "woodL",
    );
}
ellipse(32, 32, 5, 5, "ink");
ellipse(32, 32, 3, 3, "woodL");
save("mill-sails");
canvas(30, 24);
rect(2, 4, 26, 18, "woodL");
rect(3, 3, 24, 17, "cream");
poly(
  [
    [3, 4],
    [15, 14],
    [26, 4],
  ],
  "light",
);
rect(12, 12, 6, 5, "red");
rect(13, 12, 3, 2, "redL");
save("letter");
canvas(20, 24);
ellipse(10, 16, 8, 7, "wood");
ellipse(9, 15, 6, 6, "cream");
poly(
  [
    [5, 9],
    [3, 3],
    [15, 4],
    [13, 10],
  ],
  "cream",
);
rect(5, 8, 9, 3, "red");
rect(8, 14, 3, 5, "green");
rect(10, 13, 3, 2, "leaf");
rect(16, 2, 1, 5, "light");
rect(14, 4, 5, 1, "light");
save("seed-pouch");
canvas(48, 26);
rect(2, 15, 44, 9, "wood");
rect(3, 15, 42, 3, "woodL");
for (let x = 7; x < 45; x += 7) {
  rect(x, 7, 2, 10, "green");
  ellipse(x + 1, 6, 4, 3, x % 2 ? "redL" : "yellow");
  rect(x, 5, 2, 2, "light");
}
save("flowerbed");
canvas(58, 38);
poly(
  [
    [8, 5],
    [47, 5],
    [56, 33],
    [1, 33],
  ],
  "cream",
);
for (let y = 7; y < 33; y += 8)
  for (let x = 9; x < 49; x += 10) rect(x, y, 5, 4, "redL");
ellipse(37, 15, 10, 5, "light");
ellipse(37, 15, 6, 3, "yellow");
rect(12, 13, 15, 11, "wood");
rect(14, 11, 11, 3, "woodL");
rect(16, 9, 7, 2, "wood");
save("picnic");
canvas(72, 22);
for (let x = 0; x < 72; x++)
  rect(x, Math.round(2 + Math.sin((x / 72) * Math.PI) * 5), 1, 1, "wood");
for (let i = 0; i < 6; i++) {
  const x = i * 12 + 2,
    y = Math.round(3 + Math.sin((x / 72) * Math.PI) * 5);
  poly(
    [
      [x, y],
      [x + 9, y],
      [x + 5, y + 11],
    ],
    ["redL", "yellow", "sky"][i % 3],
  );
}
save("bunting");
canvas(16, 26);
rect(7, 1, 2, 6, "wood");
rect(3, 7, 10, 3, "wood");
rect(3, 10, 10, 11, "yellow");
rect(5, 11, 5, 8, "light");
rect(2, 20, 12, 3, "wood");
rect(3, 10, 1, 10, "woodL");
rect(12, 10, 1, 10, "woodL");
save("lantern");
writeFileSync(
  new URL("manifest.json", out),
  JSON.stringify(metadata, null, 2) + "\n",
);
console.log(`Generated ${Object.keys(metadata).length} original PNG assets.`);
