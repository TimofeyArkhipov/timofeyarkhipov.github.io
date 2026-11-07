import { Container, Graphics, Text } from 'pixi.js';
import { COLORS, FONT } from '@core/config';

interface Effect {
  node: Container;
  age: number;
  life: number;
  tick: (k: number) => void;
}

/** Short-lived visual feedback: explosions, frost puffs, floating numbers, banners. */
export class EffectsView extends Container {
  private readonly active: Effect[] = [];

  update(dt: number): void {
    for (const fx of this.active) {
      fx.age += dt;
      fx.tick(Math.min(1, fx.age / fx.life));
    }
    for (let i = this.active.length - 1; i >= 0; i--) {
      if (this.active[i].age < this.active[i].life) continue;
      this.active[i].node.destroy({ children: true });
      this.active.splice(i, 1);
    }
  }

  explosion(x: number, y: number, radius: number): void {
    const g = new Graphics();
    g.position.set(x, y);
    this.add(g, 0.35, (k) => {
      g.clear()
        .circle(0, 0, radius * (0.4 + 0.6 * k))
        .fill({ color: 0xffb347, alpha: 0.45 * (1 - k) })
        .circle(0, 0, radius * (0.2 + 0.4 * k))
        .fill({ color: 0xfff1b8, alpha: 0.6 * (1 - k) });
    });
  }

  puff(x: number, y: number, color: number, radius = 18): void {
    const g = new Graphics();
    g.position.set(x, y);
    this.add(g, 0.3, (k) => {
      g.clear().circle(0, 0, radius * (0.5 + k)).stroke({ width: 3, color, alpha: 1 - k });
    });
  }

  spark(x: number, y: number): void {
    const g = new Graphics();
    g.position.set(x, y);
    this.add(g, 0.15, (k) => {
      g.clear().circle(0, 0, 3 + 6 * k).fill({ color: 0xffffff, alpha: 0.7 * (1 - k) });
    });
  }

  floatText(x: number, y: number, text: string, color: number = COLORS.gold): void {
    const t = new Text({
      text,
      style: { fontFamily: FONT, fontSize: 16, fontWeight: '800', fill: color, stroke: { color: 0x000000, width: 4 } },
    });
    t.anchor.set(0.5);
    t.position.set(x, y);
    this.add(t, 0.9, (k) => {
      t.y = y - 30 * k;
      t.alpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
    });
  }

  banner(x: number, y: number, text: string, sub = ''): void {
    const box = new Container();
    const title = new Text({
      text,
      style: { fontFamily: FONT, fontSize: 44, fontWeight: '900', fill: COLORS.text, stroke: { color: 0x0b120d, width: 8 } },
    });
    title.anchor.set(0.5);
    box.addChild(title);
    if (sub) {
      const s = new Text({
        text: sub,
        style: { fontFamily: FONT, fontSize: 20, fontWeight: '700', fill: COLORS.gold, stroke: { color: 0x0b120d, width: 6 } },
      });
      s.anchor.set(0.5);
      s.y = 40;
      box.addChild(s);
    }
    box.position.set(x, y);
    this.add(box, 1.6, (k) => {
      const appear = Math.min(1, k / 0.12);
      box.scale.set(0.8 + 0.2 * appear);
      box.alpha = k < 0.75 ? appear : 1 - (k - 0.75) / 0.25;
    });
  }

  private add(node: Container, life: number, tick: (k: number) => void): void {
    tick(0);
    this.addChild(node);
    this.active.push({ node, age: 0, life, tick });
  }
}
