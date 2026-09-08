import type Phaser from "phaser";
import type { FarmState } from "./model";
import type { Site } from "./valley-content";
import { dailyDiscovery } from "./valley";

export const VALLEY_ASSETS = [
  "mill-old",
  "mill",
  "mill-sails",
  "stall-old",
  "stall",
  "well-old",
  "well",
  "workbench-old",
  "workbench",
  "seed-pouch",
  "flowerbed",
  "picnic",
  "bunting",
  "lantern",
];
type Target = {
  id: string;
  x: number;
  y: number;
  label: string;
  action: () => void;
  sprite: Phaser.GameObjects.Image;
};
type Hooks = {
  register: (target: Target) => void;
  block: (x: number, y: number, w: number, h: number) => void;
  open: (page: string, context: string) => void;
  discover: () => void;
};

/** Owns story scenery; the farm scene retains movement, depth and collision rules. */
export class ValleyWorld {
  private repairs: {
    sprite: Phaser.GameObjects.Image;
    key: string;
    chapter: number;
  }[] = [];
  private decorations: { sprite: Phaser.GameObjects.Image; id: string }[] = [];
  private lights: Phaser.GameObjects.Image[] = [];
  private sails: Phaser.GameObjects.Image;
  private flowers: Phaser.GameObjects.Image;
  private riverLights: Phaser.GameObjects.Image[] = [];
  private discovery: Target;
  private reducedMotion = matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  constructor(
    private scene: Phaser.Scene,
    private farm: FarmState,
    hooks: Hooks,
  ) {
    scene.add.tileSprite(224, 298, 160, 20, "path").setDepth(1);
    scene.add.tileSprite(160, 328, 20, 60, "path").setDepth(1);
    scene.add.tileSprite(460, 424, 20, 80, "path").setDepth(1);
    const sites: {
      id: Site;
      key: string;
      x: number;
      y: number;
      width: number;
      chapter: number;
      label: string;
    }[] = [
      {
        id: "mill",
        key: "mill",
        x: 170,
        y: 282,
        width: 48,
        chapter: 6,
        label: "O antigo moinho",
      },
      {
        id: "bench",
        key: "workbench",
        x: 566,
        y: 467,
        width: 44,
        chapter: 2,
        label: "Bancada do Bento",
      },
      {
        id: "fair",
        key: "stall",
        x: 460,
        y: 457,
        width: 72,
        chapter: 3,
        label: "A feira do vale",
      },
      {
        id: "well",
        key: "well",
        x: 363,
        y: 437,
        width: 32,
        chapter: 4,
        label: "O poço da vila",
      },
    ];
    for (const site of sites) {
      const sprite = this.prop(`${site.key}-old`, site.x, site.y);
      hooks.block(site.x - site.width / 2, site.y - 24, site.width, 24);
      hooks.register({
        id: `work-${site.id}`,
        x: site.x,
        y: site.y + 20,
        label: site.label,
        sprite,
        action: () => hooks.open("work", site.id),
      });
      this.repairs.push({ sprite, key: site.key, chapter: site.chapter });
    }
    this.sails = scene.add.image(170, 216, "mill-sails").setDepth(283);
    this.flowers = this.prop("flowerbed", 347, 278).setScale(0.65);
    for (const [id, x, y] of [
      ["flowerbed", 313, 258],
      ["picnic", 302, 474],
      ["bunting", 328, 200],
    ] as const)
      this.decorations.push({
        id,
        // Roof-mounted bunting is an overlay, not a ground-level prop.
        sprite: this.prop(id, x, y).setDepth(id === "bunting" ? 259 : y),
      });
    for (const x of [390, 435, 480, 525])
      this.lights.push(this.prop("lantern", x, 396).setDepth(500));
    for (const y of [333, 357, 381])
      this.riverLights.push(this.prop("lantern", 900, y).setScale(0.6));
    this.discovery = {
      id: "daily-discovery",
      x: 568,
      y: 416,
      label: "Uma pequena descoberta",
      sprite: this.prop("seed-pouch", 568, 408),
      action: hooks.discover,
    };
    hooks.register(this.discovery);
    this.refresh();
  }
  private prop(key: string, x: number, y: number) {
    return this.scene.add.image(x, y, key).setOrigin(0.5, 1).setDepth(y);
  }
  refresh() {
    const s = this.farm.valley;
    for (const repair of this.repairs)
      repair.sprite.setTexture(
        s.chapter >= repair.chapter ? repair.key : `${repair.key}-old`,
      );
    this.sails.setVisible(s.chapter >= 6);
    this.flowers.setVisible(s.chapter >= 1);
    for (const d of this.decorations)
      d.sprite.setVisible(s.activeDecorations.some((id) => id === d.id));
    for (const light of this.lights) light.setVisible(s.chapter >= 5);
    for (const light of this.riverLights) light.setVisible(s.chapter >= 7);
    const positions = [
      [568, 408],
      [280, 462],
      [600, 440],
      [392, 413],
      [738, 266],
      [190, 322],
      [518, 487],
    ];
    const [x, y] = positions[dailyDiscovery(this.farm).index];
    this.discovery.x = x;
    this.discovery.y = y + 8;
    this.discovery.sprite
      .setPosition(x, y)
      .setDepth(y)
      .setVisible(!s.daily.discovered);
  }
  update(time: number) {
    if (this.reducedMotion) return;
    if (this.sails.visible) this.sails.setAngle(time / 65);
    this.discovery.sprite.setY(
      this.discovery.y - 8 + Math.sin(time / 400) * 1.5,
    );
  }
}
