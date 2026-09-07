import Phaser from "phaser";
import { assetPath } from "./assets";
import { CROPS, findPath, stage, type FarmState, type Point } from "./model";

export type WorldEvents = {
  state: FarmState;
  selected: () => string;
  blocked: () => boolean;
  interactPlot: (index: number) => void;
  open: (page: string, npc?: string) => void;
  notify: (message: string) => void;
  ready: () => void;
};
type Target = {
  id: string;
  x: number;
  y: number;
  label: string;
  action: () => void;
  sprite?: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  radius?: number;
};
type Actor = {
  sprite: Phaser.GameObjects.Sprite;
  path: Point[];
  goals: Point[];
  goal: number;
  nextMove: number;
  paused: boolean;
  target?: Target;
  speed: number;
  direction: number;
  activity: Phaser.GameObjects.Text;
  name: string;
  work?: Phaser.GameObjects.Image;
};
const TILE = 16,
  COLS = 60,
  ROWS = 40;
const worldPoint = (p: Point): Point => ({
  x: p.x * TILE + 8,
  y: p.y * TILE + 8,
});
const gridPoint = (p: Point): Point => ({
  x: Math.floor(p.x / TILE),
  y: Math.floor(p.y / TILE),
});
export class FarmScene extends Phaser.Scene {
  private hooks: WorldEvents;
  private walls = new Set<string>();
  private targets: Target[] = [];
  private actors: Actor[] = [];
  private player!: Phaser.GameObjects.Sprite;
  private playerPath: Point[] = [];
  private pending?: Target;
  private marker!: Phaser.GameObjects.Container;
  private hover!: Phaser.GameObjects.Text;
  private groundPlots: Phaser.GameObjects.Image[] = [];
  private plants: Phaser.GameObjects.Image[] = [];
  private lockedPlots: Phaser.GameObjects.Text[] = [];
  private lastRefresh = 0;
  private lastRepath = 0;
  private lastDirection = 0;
  private highlight?: Target;
  constructor(hooks: WorldEvents) {
    super("farm");
    this.hooks = hooks;
  }
  preload() {
    for (const key of [
      "grass0",
      "grass1",
      "grass2",
      "grass3",
      "path",
      "soil",
      "wet-soil",
      "water",
      "tree",
      "bush",
      "rock",
      "fence",
      "house",
      "barn",
      "market",
      "coop",
      "tractor",
      "mailbox",
      "board",
      "cow",
      "chicken",
      "flower",
      "sunflower",
      "hay",
      "shadow",
      "can",
      "basket",
      ...Object.keys(CROPS).flatMap((k) => [`${k}-0`, `${k}-1`, `${k}-2`]),
    ])
      this.load.image(key, assetPath(key));
    for (const key of ["player", "farmer", "mechanic", "merchant"])
      this.load.spritesheet(key, assetPath(key), {
        frameWidth: 32,
        frameHeight: 48,
      });
    this.load.on("progress", (value: number) => {
      const bar = document.getElementById("load-progress");
      if (bar) bar.style.width = `${Math.round(value * 100)}%`;
    });
  }
  create() {
    this.cameras.main.setBackgroundColor("#91b96b");
    this.add
      .tileSprite(
        (COLS * TILE) / 2,
        (ROWS * TILE) / 2,
        COLS * TILE,
        ROWS * TILE,
        "grass0",
      )
      .setDepth(0);
    this.drawPaths();
    this.drawRiver();
    this.drawForest();
    this.building("house", 328, 258, "Sua casa", "about");
    this.building("barn", 646, 236, "O celeiro", "barn");
    this.building("market", 220, 406, "Mercado da Rosa", "shop");
    this.building("coop", 755, 345, "Galinheiro", "coop");
    this.prop("tractor", 577, 210).setInteractive({ useHandCursor: true });
    this.blockRect(552, 184, 55, 30);
    this.targets.push({
      id: "tractor",
      x: 568,
      y: 232,
      label: "Oficina · projetos e tecnologias",
      action: () => this.hooks.open("projects"),
      radius: 32,
      sprite: this.children
        .getChildren()
        .find(
          (c) =>
            c instanceof Phaser.GameObjects.Image &&
            c.texture.key === "tractor",
        ) as Phaser.GameObjects.Image,
    });
    const mail = this.prop("mailbox", 284, 282);
    this.blockRect(276, 260, 12, 22);
    this.targets.push({
      id: "mailbox",
      x: 280,
      y: 296,
      label: "Correio · vamos conversar",
      action: () => this.hooks.open("contact"),
      sprite: mail,
    });
    this.drawGarden();
    this.drawPasture();
    for (const [x, y] of [
      [296, 286],
      [362, 279],
      [190, 423],
      [260, 424],
      [602, 240],
      [682, 241],
      [400, 225],
      [405, 245],
      [779, 349],
    ])
      this.prop("sunflower", x, y);
    for (const [x, y] of [
      [690, 237],
      [705, 240],
      [696, 253],
      [771, 338],
    ])
      this.prop("hay", x, y);
    this.prop("rock", 141, 248);
    this.prop("rock", 804, 405);
    this.prop("bush", 405, 195);
    this.prop("bush", 262, 245);
    for (let i = 0; i < 130; i++) {
      const x = ((i * 137 + 51) % 928) + 16,
        y = ((i * 89 + 21) % 608) + 16;
      if (x > 140 && x < 805 && y > 150 && y < 455) continue;
      if (x > 818 && x < 880) continue;
      this.prop("flower", x, y).setAlpha(0.85);
    }
    for (const key of ["player", "farmer", "mechanic", "merchant"])
      for (let d = 0; d < 4; d++)
        this.anims.create({
          key: `${key}-walk-${d}`,
          frames: this.anims.generateFrameNumbers(key, {
            start: d * 4,
            end: d * 4 + 3,
          }),
          frameRate: 8,
          repeat: -1,
        });
    this.player = this.add
      .sprite(456, 376, "player", 0)
      .setOrigin(0.5, 1)
      .setDepth(376)
      .setScale(0.62);
    this.marker = this.add
      .container(0, 0, [
        this.add.ellipse(0, 0, 17, 8).setStrokeStyle(1, 0xfff1bc, 0.9),
        this.add.ellipse(0, 0, 3, 2, 0xfff1bc),
      ])
      .setDepth(2)
      .setVisible(false);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      this.tweens.add({
        targets: this.marker,
        alpha: 0.45,
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
    this.hover = this.add
      .text(0, 0, "", {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#fff8dd",
        backgroundColor: "#365641",
        padding: { x: 7, y: 5 },
      })
      .setOrigin(0.5, 1)
      .setDepth(2000)
      .setVisible(false);
    this.addActor(
      "farmer",
      "Lia",
      400,
      296,
      [
        { x: 400, y: 296 },
        { x: 536, y: 360 },
        { x: 280, y: 408 },
        { x: 400, y: 344 },
      ],
      34,
    );
    this.addActor(
      "mechanic",
      "Bento",
      550,
      236,
      [
        { x: 550, y: 236 },
        { x: 592, y: 264 },
        { x: 568, y: 368 },
        { x: 320, y: 376 },
      ],
      31,
    );
    this.addActor(
      "merchant",
      "Rosa",
      248,
      426,
      [
        { x: 248, y: 426 },
        { x: 312, y: 408 },
        { x: 328, y: 344 },
      ],
      29,
    );
    for (let i = 0; i < 3; i++)
      this.addAnimal("cow", 665 + i * 37, 335 + i * 22, 632, 305, 155, 100);
    for (let i = 0; i < 5; i++)
      this.addAnimal(
        "chicken",
        710 + i * 16,
        397 + (i % 2) * 16,
        674,
        372,
        120,
        65,
      );
    this.cameras.main.setBounds(0, 0, COLS * TILE, ROWS * TILE);
    this.resize();
    this.scale.on("resize", this.resize, this);
    this.cameras.main.startFollow(this.player, true, 0.035, 0.035, 0, 70);
    this.cameras.main.centerOn(this.player.x, this.player.y - 70);
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => this.click(p));
    this.input.on("pointermove", (p: Phaser.Input.Pointer) =>
      this.pointerMove(p),
    );
    this.input.on("gameout", () => {
      this.hover.setVisible(false);
      this.highlight?.sprite?.clearTint();
    });
    this.events.once("shutdown", () =>
      this.scale.off("resize", this.resize, this),
    );
    this.refreshGarden();
    this.hooks.ready();
  }
  private resize() {
    const w = this.scale.width,
      h = this.scale.height;
    this.cameras.main.setZoom(
      Math.max(w < 600 ? 1.25 : 1.15, w / 960, h / 640),
    );
  }
  private prop(key: string, x: number, y: number) {
    return this.add.image(x, y, key).setOrigin(0.5, 1).setDepth(y);
  }
  private blockRect(x: number, y: number, w: number, h: number) {
    for (let yy = Math.floor(y / 16); yy < Math.ceil((y + h) / 16); yy++)
      for (let xx = Math.floor(x / 16); xx < Math.ceil((x + w) / 16); xx++)
        this.walls.add(`${xx},${yy}`);
  }
  private drawPaths() {
    const path = (x: number, y: number, w: number, h: number) => {
      this.add
        .rectangle(x + w / 2, y + h / 2, w + 6, h + 6, 0xb4ad71)
        .setDepth(0.1);
      this.add.tileSprite(x + w / 2, y + h / 2, w, h, "path").setDepth(0.2);
    };
    path(207, 357, 642, 35);
    path(309, 259, 35, 150);
    path(207, 388, 35, 57);
    path(405, 319, 165, 29);
    path(534, 227, 34, 145);
    path(551, 247, 108, 28);
    path(630, 239, 31, 143);
    const g = this.add.graphics().setDepth(0.3);
    g.fillStyle(0xc6a86f, 0.4);
    for (let i = 0; i < 130; i++) {
      const x = 211 + ((i * 67) % 630),
        y = 362 + ((i * 17) % 25);
      g.fillRect(x, y, 2, 1);
    }
  }
  private drawRiver() {
    const g = this.add.graphics().setDepth(0.5);
    g.fillStyle(0x659e88);
    g.fillRect(830, 0, 52, 640);
    g.fillStyle(0xbed099);
    g.fillRect(819, 0, 11, 640);
    g.fillRect(882, 0, 8, 640);
    this.add.tileSprite(856, 320, 48, 640, "water").setDepth(0.6);
    for (let y = 0; y < ROWS; y++)
      if (y < 22 || y > 24)
        for (let x = 51; x <= 55; x++) this.walls.add(`${x},${y}`);
    g.fillStyle(0x896f48);
    g.fillRect(816, 353, 79, 46);
    for (let x = 819; x < 894; x += 6) {
      g.fillStyle(0xc9a271);
      g.fillRect(x, 356, 5, 38);
      g.fillStyle(0xdfba80);
      g.fillRect(x, 356, 2, 38);
    }
    g.fillStyle(0x755b3f);
    g.fillRect(815, 350, 81, 4);
    g.fillRect(815, 396, 81, 4);
    g.fillStyle(0xe4c48a);
    g.fillRect(815, 349, 81, 2);
    g.fillRect(815, 394, 81, 2);
  }
  private drawForest() {
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++)
        if (x < 2 || x > 57 || y < 5 || y > 36) this.walls.add(`${x},${y}`);
    for (let i = 0; i < 23; i++) {
      const x = 45 + i * 39;
      if (x > 808 && x < 897) continue;
      this.prop("tree", x, 137 + (i % 3) * 14);
      this.blockRect(x - 10, 105 + (i % 3) * 14, 20, 33);
    }
    for (let i = 0; i < 11; i++) {
      const y = 174 + i * 37;
      for (const x of [66 + (i % 3) * 15, 930 - (i % 2) * 16]) {
        this.prop("tree", x, y);
        this.blockRect(x - 8, y - 18, 16, 20);
      }
    }
    for (let i = 0; i < 22; i++) {
      const x = 79 + i * 34;
      if (x > 808 && x < 897) continue;
      const y = 550 + (i % 3) * 16;
      this.prop("tree", x, y);
      this.blockRect(x - 10, y - 20, 20, 20);
    }
    for (const [x, y] of [
      [154, 184],
      [198, 164],
      [749, 173],
      [782, 198],
      [130, 441],
      [153, 477],
      [786, 490],
      [742, 508],
      [368, 510],
      [341, 497],
    ]) {
      this.prop("tree", x, y);
      this.blockRect(x - 8, y - 18, 16, 18);
    }
  }
  private building(
    key: string,
    x: number,
    y: number,
    label: string,
    page: string,
  ) {
    const sprite = this.prop(key, x, y);
    const w = key === "coop" ? 58 : 84;
    this.blockRect(x - w / 2, y - 49, w, 49);
    this.targets.push({
      id: key,
      x,
      y: y + 15,
      label,
      action: () => this.hooks.open(page),
      sprite,
      radius: 45,
    });
  }
  private drawGarden() {
    this.add.rectangle(479, 285, 161, 102, 0x7e9854).setDepth(1);
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 6; col++) {
        const i = row * 6 + col,
          x = 419 + col * 24,
          y = 249 + row * 24;
        this.groundPlots.push(
          this.add.image(x, y, "soil").setScale(1.4).setDepth(2),
        );
        this.plants.push(
          this.add
            .image(x, y + 6, "carrot-0")
            .setOrigin(0.5, 1)
            .setDepth(y + 5),
        );
        this.lockedPlots.push(
          this.add
            .text(x, y, "+", {
              fontFamily: "monospace",
              fontSize: "10px",
              color: "#bdce8a",
            })
            .setOrigin(0.5)
            .setDepth(3),
        );
        this.targets.push({
          id: `plot-${i}`,
          x,
          y: y + 5,
          label: "Canteiro",
          radius: 12,
          action: () => {
            this.hooks.interactPlot(i);
            this.refreshGarden();
          },
        });
      }
    for (let x = 411; x < 558; x += 32) this.prop("fence", x, 232);
  }
  private drawPasture() {
    for (let x = 633; x < 803; x += 32) {
      this.prop("fence", x, 288);
      this.blockRect(x - 14, 282, 28, 6);
      this.prop("fence", x, 455);
      this.blockRect(x - 14, 449, 28, 6);
    }
    for (let y = 313; y < 451; y += 22) {
      this.prop("fence", 810, y).setScale(0.35, 1);
      this.blockRect(804, y - 6, 8, 9);
    }
    this.add.rectangle(698, 316, 26, 12, 0x826343).setDepth(316);
    this.add.rectangle(698, 313, 22, 7, 0x8ac2c0).setDepth(317);
  }
  private addActor(
    key: string,
    name: string,
    x: number,
    y: number,
    goals: Point[],
    speed: number,
  ) {
    const sprite = this.add
      .sprite(x, y, key, 0)
      .setOrigin(0.5, 1)
      .setDepth(y)
      .setScale(0.6);
    const activity = this.add
      .text(x, y - 33, "…", {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#fff8df",
        backgroundColor: "#50734f",
        padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5, 1)
      .setDepth(y + 40);
    const target: Target = {
      id: name,
      x,
      y,
      label: `Conversar com ${name}`,
      sprite,
      radius: 15,
      action: () => this.hooks.open("dialogue", name),
    };
    const work =
      key === "farmer" || key === "merchant"
        ? this.add
            .image(x + 8, y - 8, key === "farmer" ? "can" : "basket")
            .setScale(0.5)
            .setDepth(y + 1)
        : undefined;
    this.targets.push(target);
    this.actors.push({
      sprite,
      path: [],
      goals,
      goal: 0,
      nextMove: this.time.now + 2000,
      paused: false,
      target,
      speed,
      direction: 0,
      activity,
      name,
      work,
    });
  }
  private addAnimal(
    key: string,
    x: number,
    y: number,
    minX: number,
    minY: number,
    w: number,
    h: number,
  ) {
    const goals = Array.from({ length: 5 }, (_, i) => ({
      x: minX + ((Math.floor(x) + i * 43) % w),
      y: minY + ((Math.floor(y) + i * 31) % h),
    }));
    const sprite = this.add
      .sprite(x, y, key)
      .setOrigin(0.5, 1)
      .setDepth(y)
      .setScale(0.85);
    const target: Target = {
      id: `${key}-${x}`,
      x,
      y,
      label:
        key === "cow" ? "Fazer carinho na vaquinha" : "Cumprimentar a galinha",
      radius: key === "cow" ? 19 : 12,
      sprite,
      action: () => {
        this.hooks.notify(
          key === "cow"
            ? "Muuu! Um carinho e um dia feliz. 🐄"
            : "Có-có! Ela parece muito ocupada procurando sementes.",
        );
        this.tweens.add({
          targets: sprite,
          scaleY: 1.15,
          duration: 150,
          yoyo: true,
        });
      },
    };
    this.targets.push(target);
    this.actors.push({
      sprite,
      path: [],
      goals,
      goal: 0,
      nextMove: this.time.now + (x % 5) * 1000,
      paused: false,
      target,
      speed: key === "cow" ? 15 : 23,
      direction: 0,
      activity: this.add.text(0, 0, ""),
      name: key,
    });
  }
  private getTarget(x: number, y: number) {
    const all = this.targets.filter((t) => {
      if (t.id.startsWith("plot-"))
        return Math.abs(t.x - x) < 12 && Math.abs(t.y - 5 - y) < 12;
      if (t.sprite) {
        const b = t.sprite.getBounds();
        return b.contains(x, y);
      }
      return Phaser.Math.Distance.Between(x, y, t.x, t.y) < (t.radius ?? 20);
    });
    return all.sort(
      (a, b) => (b.sprite?.depth ?? b.y) - (a.sprite?.depth ?? a.y),
    )[0];
  }
  private pointerMove(pointer: Phaser.Input.Pointer) {
    if (this.hooks.blocked()) return;
    const p = pointer.positionToCamera(
      this.cameras.main,
    ) as Phaser.Math.Vector2;
    const target = this.getTarget(p.x, p.y);
    if (this.highlight?.sprite) this.highlight.sprite.clearTint();
    this.highlight = target;
    this.game.canvas.style.cursor = target ? "pointer" : "crosshair";
    if (!target) {
      this.hover.setVisible(false);
      return;
    }
    target.sprite?.setTint(0xfff1cf);
    let label = target.label;
    if (target.id.startsWith("plot-")) {
      const i = Number(target.id.slice(5)),
        plot = this.hooks.state.plots[i];
      label =
        i >= 18 && !this.hooks.state.upgraded
          ? "Expansão · disponível no mercado"
          : !plot.crop
            ? "Plantar semente"
            : stage(plot) === 2
              ? `Colher ${CROPS[plot.crop].name.toLowerCase()}`
              : !plot.watered
                ? "Regar plantação"
                : "Plantação crescendo";
    }
    this.hover
      .setText(label)
      .setPosition(
        target.x,
        target.y - (target.sprite ? target.sprite.displayHeight + 9 : 22),
      )
      .setVisible(true);
  }
  private click(pointer: Phaser.Input.Pointer) {
    if (this.hooks.blocked() || pointer.rightButtonDown()) return;
    this.hover.setVisible(false);
    const p = pointer.positionToCamera(
      this.cameras.main,
    ) as Phaser.Math.Vector2;
    this.pending = undefined;
    const target = this.getTarget(p.x, p.y);
    if (target) {
      this.pending = target;
      this.routeTo(target);
    } else {
      const start = gridPoint(this.player),
        goal = gridPoint(p);
      this.playerPath = findPath(start, goal, this.walls, COLS, ROWS).map(
        worldPoint,
      );
      if (!this.playerPath.length) {
        this.marker.setVisible(false);
        if (start.x !== goal.x || start.y !== goal.y)
          this.hooks.notify(
            "Esse cantinho não tem passagem. Clique em um espaço livre.",
          );
        return;
      }
      this.marker.setPosition(p.x, p.y).setVisible(true);
    }
  }
  private routeTo(target: Target) {
    const start = gridPoint(this.player),
      goal = gridPoint(target);
    let candidates = [goal];
    for (let r = 1; r <= 2; r++)
      for (const [dx, dy] of [
        [r, 0],
        [-r, 0],
        [0, r],
        [0, -r],
      ])
        candidates.push({ x: goal.x + dx, y: goal.y + dy });
    candidates = candidates
      .filter((c) => !this.walls.has(`${c.x},${c.y}`))
      .sort(
        (a, b) =>
          Math.abs(a.x - goal.x) +
          Math.abs(a.y - goal.y) -
          Math.abs(b.x - goal.x) -
          Math.abs(b.y - goal.y),
      );
    for (const c of candidates) {
      if (c.x === start.x && c.y === start.y) {
        this.playerPath = [];
        this.perform();
        return;
      }
      const route = findPath(start, c, this.walls, COLS, ROWS);
      if (route.length) {
        this.playerPath = route.map(worldPoint);
        const dest = this.playerPath.at(-1)!;
        this.marker.setPosition(dest.x, dest.y).setVisible(true);
        return;
      }
    }
    this.pending = undefined;
    this.playerPath = [];
    this.marker.setVisible(false);
    this.hooks.notify(
      "Não encontrei uma passagem até lá. Tente se aproximar pelo caminho.",
    );
  }
  private perform() {
    const target = this.pending;
    this.pending = undefined;
    this.marker.setVisible(false);
    if (!target) return;
    const actor = this.actors.find((a) => a.target === target);
    if (actor) {
      actor.nextMove = this.time.now + 4000;
      actor.path = [];
      actor.direction = this.player.x < actor.sprite.x ? 1 : 2;
      actor.sprite.anims.stop();
      if (["Lia", "Bento", "Rosa"].includes(actor.name))
        actor.sprite.setFrame(actor.direction * 4);
    }
    target.action();
  }
  private move(
    sprite: Phaser.GameObjects.Sprite,
    path: Point[],
    speed: number,
    dt: number,
    key?: string,
  ): number {
    if (!path.length) {
      sprite.anims.stop();
      return -1;
    }
    const p = path[0],
      dx = p.x - sprite.x,
      dy = p.y - sprite.y,
      d = Math.hypot(dx, dy),
      step = speed * dt;
    const direction =
      Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : dy < 0 ? 3 : 0;
    if (d <= step) {
      sprite.setPosition(p.x, p.y);
      path.shift();
    } else {
      sprite.x += (dx / d) * step;
      sprite.y += (dy / d) * step;
    }
    sprite.setDepth(sprite.y);
    if (key) sprite.play(`${key}-walk-${direction}`, true);
    else sprite.setFlipX(dx < 0);
    return direction;
  }
  refreshGarden() {
    if (!this.groundPlots.length) return;
    this.hooks.state.plots.forEach((p, i) => {
      const locked = i >= 18 && !this.hooks.state.upgraded;
      this.groundPlots[i]
        .setTexture(p.watered ? "wet-soil" : "soil")
        .setAlpha(locked ? 0.25 : 1);
      this.lockedPlots[i].setVisible(locked);
      this.plants[i].setVisible(!!p.crop && !locked);
      if (p.crop) this.plants[i].setTexture(`${p.crop}-${stage(p)}`);
    });
  }
  update(time: number, delta: number) {
    if (!this.player) return;
    const dt = Math.min(delta, 100) / 1000;
    if (!this.hooks.blocked()) {
      if (
        this.pending?.sprite instanceof Phaser.GameObjects.Sprite &&
        time - this.lastRepath > 650 &&
        this.playerPath.length
      ) {
        this.routeTo(this.pending);
        this.lastRepath = time;
      }
      const next = this.playerPath[0];
      const crossing =
        next &&
        this.actors.some(
          (a) =>
            Phaser.Math.Distance.Between(
              a.sprite.x,
              a.sprite.y,
              this.player.x,
              this.player.y,
            ) < 17 &&
            Phaser.Math.Distance.Between(
              a.sprite.x,
              a.sprite.y,
              next.x,
              next.y,
            ) < 15 &&
            a.path.length > 0,
        );
      const direction = crossing
        ? -1
        : this.move(this.player, this.playerPath, 94, dt, "player");
      if (direction >= 0) this.lastDirection = direction;
      if (crossing) this.player.anims.stop();
      if (!this.playerPath.length) {
        this.player.anims.stop();
        this.player.setFrame(this.lastDirection * 4);
        this.marker.setVisible(false);
        if (this.pending) this.perform();
      }
    } else {
      this.player.anims.stop();
    }
    for (const a of this.actors) {
      const isPerson = ["Lia", "Bento", "Rosa"].includes(a.name);
      if (this.hooks.blocked() && isPerson) {
        a.sprite.anims.stop();
        continue;
      }
      if (a.path.length) {
        const dir = this.move(
          a.sprite,
          a.path,
          a.speed,
          dt,
          isPerson ? a.sprite.texture.key : undefined,
        );
        if (dir >= 0) a.direction = dir;
        a.activity.setVisible(false);
        if (!a.path.length) {
          a.nextMove = time + 3500 + (a.goal % 3) * 1700;
          a.sprite.anims.stop();
          if (isPerson) a.sprite.setFrame(a.direction * 4);
        }
      } else {
        a.activity.setVisible(isPerson);
        a.activity.setText(
          a.name === "Lia" ? "❀" : a.name === "Bento" ? "…" : "♪",
        );
        if (time > a.nextMove) {
          a.goal = (a.goal + 1) % a.goals.length;
          a.path = findPath(
            gridPoint(a.sprite),
            gridPoint(a.goals[a.goal]),
            this.walls,
            COLS,
            ROWS,
          ).map(worldPoint);
          a.nextMove = time + 4000;
        }
      }
      a.activity
        .setPosition(a.sprite.x, a.sprite.y - 33)
        .setDepth(a.sprite.y + 40);
      if (a.work) {
        a.work
          .setVisible(!a.path.length)
          .setPosition(a.sprite.x + 8, a.sprite.y - 9 + Math.sin(time / 250))
          .setDepth(a.sprite.y + 1)
          .setAngle(a.name === "Lia" ? -15 + Math.sin(time / 300) * 10 : 0);
      }
      if (a.target) {
        a.target.x = a.sprite.x;
        a.target.y = a.sprite.y;
      }
    }
    if (time - this.lastRefresh > 300) {
      this.refreshGarden();
      this.drawMinimap();
      this.lastRefresh = time;
      const el = document.getElementById("area-name");
      if (el)
        el.innerHTML =
          this.player.x > 610
            ? "Entre penas e pastagens<small>UM CANTINHO CHEIO DE VIDA</small>"
            : this.player.x < 285
              ? "O mercadinho da vila<small>DA TERRA PARA A BANCA</small>"
              : this.player.y < 315
                ? "Onde as ideias crescem<small>PLANTE ALGO BOM HOJE</small>"
                : "O coração da fazenda<small>CLIQUE PARA EXPLORAR</small>";
    }
  }
  private drawMinimap() {
    const canvas = document.getElementById(
        "minimap",
      ) as HTMLCanvasElement | null,
      ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const sx = 144 / 960,
      sy = 96 / 640;
    ctx.fillStyle = "#94b574";
    ctx.fillRect(0, 0, 144, 96);
    ctx.fillStyle = "#6b945b";
    ctx.fillRect(0, 0, 144, 22);
    ctx.fillRect(0, 0, 17, 96);
    ctx.fillRect(0, 80, 144, 16);
    ctx.fillRect(135, 0, 9, 96);
    ctx.fillStyle = "#82babc";
    ctx.fillRect(124, 0, 9, 96);
    ctx.fillStyle = "#dcc28b";
    ctx.fillRect(31, 54, 102, 5);
    ctx.fillRect(46, 37, 5, 26);
    ctx.fillRect(80, 35, 5, 20);
    ctx.fillRect(95, 34, 4, 23);
    for (const [x, y, w, h, color] of [
      [283, 180, 85, 75, "#c88056"],
      [180, 335, 80, 65, "#bb8860"],
      [601, 157, 88, 78, "#b96552"],
      [725, 280, 62, 58, "#c7a26c"],
      [405, 235, 151, 100, "#8b7649"],
    ] as const) {
      ctx.fillStyle = color;
      ctx.fillRect(x * sx, y * sy, w * sx, h * sy);
    }
    ctx.fillStyle = "#f9edba";
    for (const a of this.actors.slice(0, 3))
      ctx.fillRect(a.sprite.x * sx - 1, a.sprite.y * sy - 1, 2, 2);
    ctx.fillStyle = "#46654a";
    ctx.fillRect(this.player.x * sx - 3, this.player.y * sy - 3, 6, 6);
    ctx.fillStyle = "#fff9e0";
    ctx.fillRect(this.player.x * sx - 2, this.player.y * sy - 2, 4, 4);
  }
}

export function createGame(hooks: WorldEvents) {
  const scene = new FarmScene(hooks);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game",
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#91b96b",
    scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%" },
    scene: [scene],
    render: { antialias: false },
    audio: { noAudio: true },
    banner: false,
  });
  return { game, scene };
}
