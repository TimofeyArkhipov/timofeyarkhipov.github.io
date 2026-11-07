import { Container, Graphics, Text } from 'pixi.js';
import { COLORS, DESIGN, FONT } from '@core/config';
import { Button } from './Button';

const W = 600;

export interface OverlayButton {
  text: string;
  onTap: () => void;
  /** The main action: green, triggered by Enter / Space. */
  primary?: boolean;
}

export interface LevelGrid {
  count: number;
  /** How many levels are open. */
  unlocked: number;
  /** Best stars per level (0-3). */
  stars: number[];
  current: number;
  onPick: (index: number) => void;
}

export interface OverlayOptions {
  title: string;
  body: string;
  titleColor?: number;
  buttons: OverlayButton[];
  levels?: LevelGrid;
  /** Big star row under the title (victory screen). */
  stars?: number;
}

/** Modal window: level select, briefing, victory, defeat. Blocks clicks to the game underneath. */
export class Overlay extends Container {
  private readonly title: Text;
  private readonly body: Text;
  private readonly bg = new Graphics();
  private readonly box = new Container();
  private readonly dynamic = new Container();
  private primary: (() => void) | null = null;

  constructor() {
    super();
    const dim = new Graphics().rect(0, 0, DESIGN.width, DESIGN.height).fill({ color: 0x000000, alpha: 0.6 });
    dim.eventMode = 'static'; // swallow clicks

    this.title = new Text({ text: '', style: { fontFamily: FONT, fontSize: 38, fontWeight: '900', fill: COLORS.text } });
    this.title.anchor.set(0.5, 0);
    this.title.position.set(W / 2, 30);
    this.body = new Text({
      text: '',
      style: { fontFamily: FONT, fontSize: 17, fill: COLORS.textMuted, align: 'center', lineHeight: 26, wordWrap: true, wordWrapWidth: W - 80 },
    });
    this.body.anchor.set(0.5, 0);
    this.body.position.set(W / 2, 92);
    this.box.addChild(this.bg, this.title, this.body, this.dynamic);

    this.addChild(dim, this.box);
    this.visible = false;
  }

  show(o: OverlayOptions): void {
    this.title.text = o.title;
    this.title.style.fill = o.titleColor ?? COLORS.text;
    this.body.text = o.body;
    for (const c of this.dynamic.removeChildren()) c.destroy({ children: true });

    this.body.y = 92;
    if (o.stars !== undefined) {
      const row = starRow(o.stars, 22);
      row.position.set(W / 2, 112);
      this.dynamic.addChild(row);
      this.body.y = 148;
    }
    let y = this.body.y + (o.body ? this.body.height + 28 : 0);
    if (o.levels) {
      const grid = levelGrid(o.levels);
      grid.position.set((W - grid.width) / 2, y);
      this.dynamic.addChild(grid);
      y += grid.height + 28;
    }

    const bw = o.buttons.length > 1 ? 220 : 240;
    const gap = 20;
    const total = o.buttons.length * bw + (o.buttons.length - 1) * gap;
    this.primary = null;
    o.buttons.forEach((b, i) => {
      const btn = new Button({ width: bw, height: 54, text: b.text, fontSize: 19, onTap: b.onTap, color: b.primary ? 0x3c7a4e : COLORS.panelLight });
      btn.position.set((W - total) / 2 + i * (bw + gap), y);
      this.dynamic.addChild(btn);
      if (b.primary) this.primary = b.onTap;
    });
    const height = y + (o.buttons.length ? 54 + 30 : 0);

    this.bg.clear().roundRect(0, 0, W, height, 18).fill(COLORS.panel).stroke({ width: 3, color: COLORS.panelBorder });
    this.box.position.set((DESIGN.width - W) / 2, Math.max(10, (DESIGN.height - height) / 2));
    this.visible = true;
  }

  /** Enter / Space on the keyboard. */
  confirm(): void {
    this.primary?.();
  }

  hide(): void {
    this.visible = false;
  }
}

/** Three stars centered on (0, 0): earned ones gold, the rest dark. */
export function starRow(earned: number, radius: number): Graphics {
  const g = new Graphics();
  const gap = radius * 2.5;
  for (let s = 0; s < 3; s++) {
    const cx = (s - 1) * gap;
    const pts: number[] = [];
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? radius * 0.45 : radius;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      pts.push(cx + Math.cos(a) * r, Math.sin(a) * r);
    }
    g.poly(pts).fill(s < earned ? COLORS.gold : 0x0b120d).stroke({ width: 1.5, color: s < earned ? 0x3d2a05 : COLORS.panelBorder });
  }
  return g;
}

function levelGrid(g: LevelGrid): Container {
  const root = new Container();
  const size = { w: 96, h: 74 };
  const gap = 12;
  for (let i = 0; i < g.count; i++) {
    const open = i < g.unlocked;
    const cell = new Container();
    cell.position.set((i % 5) * (size.w + gap), Math.floor(i / 5) * (size.h + gap));
    const bg = new Graphics();
    const draw = (hover: boolean) =>
      bg
        .clear()
        .roundRect(0, 0, size.w, size.h, 12)
        .fill(i === g.current && open ? 0x24402e : COLORS.panelLight)
        .stroke({ width: i === g.current ? 3 : 2, color: hover && open ? COLORS.gold : i === g.current ? COLORS.accent : COLORS.panelBorder });
    draw(false);

    const num = new Text({ text: String(i + 1), style: { fontFamily: FONT, fontSize: 26, fontWeight: '900', fill: open ? COLORS.text : COLORS.textMuted } });
    num.anchor.set(0.5, 0);
    num.position.set(size.w / 2, 6);
    let sub: Container;
    if (open) {
      sub = starRow(g.stars[i] ?? 0, 9);
      sub.position.set(size.w / 2, 54);
    } else {
      const t = new Text({ text: 'locked', style: { fontFamily: FONT, fontSize: 13, fontWeight: '700', fill: COLORS.textMuted } });
      t.anchor.set(0.5, 0);
      t.position.set(size.w / 2, 46);
      sub = t;
    }
    cell.addChild(bg, num, sub);
    cell.alpha = open ? 1 : 0.5;
    if (open) {
      cell.eventMode = 'static';
      cell.cursor = 'pointer';
      cell.on('pointerover', () => draw(true));
      cell.on('pointerout', () => draw(false));
      cell.on('pointertap', (e) => {
        e.stopPropagation();
        g.onPick(i);
      });
    }
    root.addChild(cell);
  }
  return root;
}
