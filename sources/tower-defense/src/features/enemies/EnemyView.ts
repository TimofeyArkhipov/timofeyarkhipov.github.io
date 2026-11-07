import { Container, Graphics, Sprite } from 'pixi.js';
import { texture } from '@assets/manifest';
import { COLORS, FLY_HEIGHT } from '@core/config';
import type { Enemy } from './Enemy';

interface Item {
  root: Container;
  body: Sprite;
  bar: Graphics;
  barWidth: number;
  shownHp: number;
  baseScale: number;
}

/**
 * Draws enemies: walkers hop along the road, flyers hover above a shadow and flap.
 * Health bar, frozen tint. Flyers are always drawn above walkers.
 */
export class EnemyView extends Container {
  private readonly items = new Map<number, Item>();

  constructor() {
    super();
    this.sortableChildren = true;
  }

  sync(enemies: Enemy[], time: number): void {
    const seen = new Set<number>();
    for (const e of enemies) {
      seen.add(e.id);
      const item = this.items.get(e.id) ?? this.create(e);
      item.root.position.set(e.x, e.y);
      item.root.zIndex = e.y + (e.flying ? 10000 : 0);

      const facingLeft = Math.cos(e.angle) < -0.1;
      const sx = item.baseScale * (facingLeft ? -1 : 1);
      if (e.flying) {
        const flap = Math.sin(time * 14 + e.id);
        item.body.scale.set(sx, item.baseScale * (0.85 + 0.15 * flap));
        item.body.y = -FLY_HEIGHT + Math.sin(time * 3 + e.id) * 3;
      } else {
        item.body.scale.set(sx, item.baseScale);
        item.body.y = -Math.abs(Math.sin(time * 9 + e.id)) * 3;
      }
      item.body.tint = e.slowed ? 0x9fdcff : 0xffffff;

      if (item.shownHp !== e.hp) this.drawBar(item, e);
    }
    for (const [id, item] of this.items) {
      if (seen.has(id)) continue;
      item.root.destroy({ children: true });
      this.items.delete(id);
    }
  }

  private create(e: Enemy): Item {
    const root = new Container();
    const body = new Sprite(texture(e.type.sprite));
    body.anchor.set(0.5, e.flying ? 0.5 : 0.7);
    const baseScale = 1;
    if (e.flying) {
      const r = e.type.radius;
      root.addChild(new Graphics().ellipse(0, 6, r * 0.9, r * 0.3).fill({ color: 0x000000, alpha: 0.25 }));
    }
    const bar = new Graphics();
    const barWidth = Math.max(28, e.type.radius * 2);
    const top = e.flying ? -FLY_HEIGHT - body.height / 2 : -body.height * 0.7;
    bar.position.set(-barWidth / 2, top - 10);
    root.addChild(body, bar);
    this.addChild(root);
    const item: Item = { root, body, bar, barWidth, shownHp: -1, baseScale };
    this.items.set(e.id, item);
    return item;
  }

  private drawBar(item: Item, e: Enemy): void {
    item.shownHp = e.hp;
    const k = e.hp / e.maxHp;
    item.bar.clear();
    if (k >= 1) return; // full health - no bar, less clutter
    const color = k > 0.5 ? COLORS.accent : k > 0.25 ? COLORS.gold : COLORS.danger;
    item.bar
      .roundRect(0, 0, item.barWidth, 6, 3)
      .fill({ color: 0x000000, alpha: 0.6 })
      .roundRect(1, 1, (item.barWidth - 2) * k, 4, 2)
      .fill(color);
  }
}
