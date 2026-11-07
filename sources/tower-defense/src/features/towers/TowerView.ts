import { Container, Graphics, Sprite } from 'pixi.js';
import { texture } from '@assets/manifest';
import { COLORS } from '@core/config';
import type { Tower } from './Tower';
import type { TowerType } from './towerTypes';

interface Item {
  root: Container;
  turret: Sprite;
  pips: Graphics;
  level: number;
  kick: number;
}

/** Builds the stacked base + turret sprite used for towers, the build ghost and panel icons. */
export function createTowerSprite(type: TowerType): { root: Container; turret: Sprite } {
  const root = new Container();
  const base = new Sprite(texture('towerBase'));
  base.anchor.set(0.5);
  const turret = new Sprite(texture(type.turret));
  turret.anchor.set(0.5, 0.58);
  root.addChild(base, turret);
  return { root, turret };
}

export class TowerView extends Container {
  private readonly items = new Map<number, Item>();

  /** Turret recoil on shot. */
  kick(tower: Tower): void {
    const item = this.items.get(tower.id);
    if (item) item.kick = 1;
  }

  sync(towers: Tower[], dt: number): void {
    const seen = new Set<number>();
    for (const t of towers) {
      seen.add(t.id);
      const item = this.items.get(t.id) ?? this.create(t);
      item.kick = Math.max(0, item.kick - dt * 8);
      const back = item.kick * 4;
      item.turret.rotation = t.angle + Math.PI / 2;
      item.turret.position.set(-Math.cos(t.angle) * back, -Math.sin(t.angle) * back);
      if (item.level !== t.level) this.drawPips(item, t);
    }
    for (const [id, item] of this.items) {
      if (seen.has(id)) continue;
      item.root.destroy({ children: true });
      this.items.delete(id);
    }
  }

  private create(t: Tower): Item {
    const { root, turret } = createTowerSprite(t.type);
    root.position.set(t.x, t.y);
    const pips = new Graphics();
    root.addChild(pips);
    this.addChild(root);
    const item: Item = { root, turret, pips, level: -1, kick: 0 };
    this.items.set(t.id, item);
    return item;
  }

  /** Small gold marks show the tower level. */
  private drawPips(item: Item, t: Tower): void {
    item.level = t.level;
    item.root.scale.set(1 + t.level * 0.04);
    item.pips.clear();
    const n = t.level + 1;
    const gap = 8;
    const max = t.maxLevel;
    for (let i = 0; i < n; i++) {
      item.pips
        .circle((i - (n - 1) / 2) * gap, 24, 3.2)
        .fill(max ? 0xff9f43 : COLORS.gold)
        .stroke({ width: 1.5, color: 0x3d2a05 });
    }
  }
}
