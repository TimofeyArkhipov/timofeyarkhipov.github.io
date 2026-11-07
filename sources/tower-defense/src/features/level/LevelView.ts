import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { texture } from '@assets/manifest';
import { COLORS, FONT, TILE } from '@core/config';
import { seededRandom } from '@core/math';
import type { Vec } from '@core/math';
import type { Grid } from './Grid';
import { tileCenter } from './Grid';
import type { LevelData } from './levels';
import { entriesOf, exitsOf } from './levels';

interface Marker {
  root: Container;
  /** Inward direction, radians. */
  angle: number;
}

/** Static background of the level: grass, roads, decorations; plus entry and exit markers. */
export class LevelView extends Container {
  private readonly entries: Marker[] = [];
  private openCount = -1;
  private warnIndex = -1;

  constructor(grid: Grid, level: LevelData) {
    super();
    const width = grid.cols * TILE;
    const height = grid.rows * TILE;
    const rand = seededRandom(17 + level.index);

    const ground = new Container();
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const tile = new Sprite(texture(rand() < 0.5 ? 'grassA' : 'grassB'));
        tile.position.set(col * TILE, row * TILE);
        tile.setSize(TILE, TILE);
        ground.addChild(tile);
      }
    }

    // Edges of all roads first, then the fill on top: crossings and merges look like one road.
    const road = new Graphics();
    const routes = grid.paths.map((p) => p.points);
    for (const pts of routes) strokePath(road, pts).stroke({ width: TILE * 0.9, color: COLORS.pathEdge, cap: 'round', join: 'round' });
    for (const pts of routes) strokePath(road, pts).stroke({ width: TILE * 0.74, color: COLORS.path, cap: 'round', join: 'round' });
    for (const pts of routes) strokePath(road, pts).stroke({ width: TILE * 0.08, color: 0xdcc08a, alpha: 0.6, cap: 'round', join: 'round' });

    const decor = new Container();
    for (const d of grid.decor) {
      const s = new Sprite(texture(d.kind));
      s.anchor.set(0.5);
      s.position.set((d.col + 0.5) * TILE, (d.row + 0.5) * TILE);
      decor.addChild(s);
    }

    const markers = new Container();
    entriesOf(level).forEach((p, i) => {
      const m = this.marker(p, level, width, height, true, String(i + 1));
      this.entries.push(m);
      markers.addChild(m.root);
    });
    for (const p of exitsOf(level)) markers.addChild(this.marker(p, level, width, height, false).root);

    const mask = new Graphics().rect(0, 0, width, height).fill(0xffffff);
    this.addChild(ground, road, decor, markers, mask);
    this.mask = mask;
  }

  /**
   * Open entries are bright, closed ones dim. `warn` - entry that opens with the next wave, it blinks.
   */
  setEntries(open: number, warn: number | null, time: number): void {
    const w = warn ?? -1;
    if (open !== this.openCount || w !== this.warnIndex) {
      this.openCount = open;
      this.warnIndex = w;
      this.entries.forEach((m, i) => (m.root.alpha = i < open ? 1 : 0.35));
    }
    if (w >= 0 && this.entries[w]) this.entries[w].root.alpha = 0.45 + 0.55 * Math.abs(Math.sin(time * 4));
    for (let i = 0; i < Math.min(open, this.entries.length); i++) {
      const m = this.entries[i];
      const push = Math.sin(time * 5) * 3;
      m.root.children[1].position.set(Math.cos(m.angle) * push, Math.sin(m.angle) * push);
    }
  }

  /** Entry: red flag with an arrow pointing in. Exit: gold gate. Both sit on the map edge. */
  private marker(p: [number, number], level: LevelData, width: number, height: number, entry: boolean, label = ''): Marker {
    const route = level.routes.find((r) => (entry ? r[0] : r[r.length - 1]) === p)!;
    const inner = entry ? route[1] : route[route.length - 2];
    const outer = tileCenter(...p);
    const toward = tileCenter(...inner);
    const angle = Math.atan2(toward.y - outer.y, toward.x - outer.x);
    // point on the map border between the outside point and the first tile inside
    const edge = {
      x: Math.max(18, Math.min(width - 18, outer.x + Math.cos(angle) * TILE * 0.9)),
      y: Math.max(18, Math.min(height - 18, outer.y + Math.sin(angle) * TILE * 0.9)),
    };

    const root = new Container();
    root.position.set(edge.x, edge.y);
    const base = new Graphics();
    const arrow = new Graphics();
    const dir = entry ? angle : angle + Math.PI;

    if (entry) {
      base.circle(0, 0, 17).fill({ color: COLORS.danger, alpha: 0.9 }).stroke({ width: 3, color: 0x3a0d0f });
      chevron(arrow, dir, 0xffffff);
    } else {
      base.roundRect(-18, -18, 36, 36, 10).fill({ color: COLORS.gold, alpha: 0.95 }).stroke({ width: 3, color: 0x3d2a05 });
      chevron(arrow, dir, 0x3d2a05);
    }
    root.addChild(base, arrow);
    if (label) {
      const t = new Text({ text: label, style: { fontFamily: FONT, fontSize: 13, fontWeight: '900', fill: 0xffffff, stroke: { color: 0x3a0d0f, width: 4 } } });
      t.anchor.set(0.5);
      t.position.set(-Math.cos(angle) * 4 + Math.sin(angle) * 22, -Math.sin(angle) * 4 - Math.cos(angle) * 22);
      root.addChild(t);
    }
    return { root, angle };
  }
}

function chevron(g: Graphics, angle: number, color: number): void {
  const pt = (along: number, side: number) => ({
    x: Math.cos(angle) * along - Math.sin(angle) * side,
    y: Math.sin(angle) * along + Math.cos(angle) * side,
  });
  const a = pt(-4, -8);
  const b = pt(6, 0);
  const c = pt(-4, 8);
  g.moveTo(a.x, a.y).lineTo(b.x, b.y).lineTo(c.x, c.y).stroke({ width: 4, color, cap: 'round', join: 'round' });
}

function strokePath(g: Graphics, points: Vec[]): Graphics {
  g.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
  return g;
}
