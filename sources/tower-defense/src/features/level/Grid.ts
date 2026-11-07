import { TILE } from '@core/config';
import { seededRandom } from '@core/math';
import type { Vec } from '@core/math';
import type { LevelData } from './levels';
import { routeEntry } from './levels';
import { Path } from './Path';

export const Cell = {
  Grass: 0,
  Path: 1,
  Blocked: 2,
  Tower: 3,
} as const;
export type Cell = (typeof Cell)[keyof typeof Cell];

export type DecorKind = 'tree' | 'rock';

/** Tile map of the level: what is on every cell, where towers may be built, enemy routes. */
export class Grid {
  readonly cols: number;
  readonly rows: number;
  /** Roads, one per route. */
  readonly paths: Path[];
  /** Straight flight lines for flying enemies, one per route. */
  readonly flights: Path[];
  /** Entry index of every route. */
  readonly routeEntries: number[];
  readonly decor: { kind: DecorKind; col: number; row: number }[] = [];
  private readonly cells: Uint8Array;

  constructor(level: LevelData) {
    this.cols = level.cols;
    this.rows = level.rows;
    this.cells = new Uint8Array(this.cols * this.rows);

    for (const route of level.routes) for (const [col, row] of pathTiles(route)) this.set(col, row, Cell.Path);

    this.paths = level.routes.map((r) => new Path(r.map(([c, row]) => tileCenter(c, row))));
    this.flights = level.routes.map((r) => new Path([tileCenter(...r[0]), tileCenter(...r[r.length - 1])]));
    this.routeEntries = level.routes.map((_, i) => routeEntry(level, i));

    this.placeDecor(level.index);
  }

  inside(col: number, row: number): boolean {
    return col >= 0 && row >= 0 && col < this.cols && row < this.rows;
  }

  get(col: number, row: number): Cell {
    return this.inside(col, row) ? (this.cells[row * this.cols + col] as Cell) : Cell.Blocked;
  }

  set(col: number, row: number, cell: Cell): void {
    if (this.inside(col, row)) this.cells[row * this.cols + col] = cell;
  }

  isBuildable(col: number, row: number): boolean {
    return this.get(col, row) === Cell.Grass;
  }

  /** Trees and rocks only on tiles at least 2 tiles away from any road, so they never take good spots. */
  private placeDecor(seed: number): void {
    const rand = seededRandom(seed * 7919 + 13);
    const free: [number, number][] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.get(col, row) === Cell.Grass && this.distanceToRoad(col, row) >= 2) free.push([col, row]);
      }
    }
    const count = Math.min(10, Math.floor(free.length / 3));
    for (let i = 0; i < count; i++) {
      const [col, row] = free.splice(Math.floor(rand() * free.length), 1)[0];
      this.decor.push({ kind: rand() < 0.75 ? 'tree' : 'rock', col, row });
      this.set(col, row, Cell.Blocked);
    }
  }

  private distanceToRoad(col: number, row: number): number {
    let best = Infinity;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.get(c, r) === Cell.Path) best = Math.min(best, Math.max(Math.abs(c - col), Math.abs(r - row)));
      }
    }
    return best;
  }
}

export const tileCenter = (col: number, row: number): Vec => ({
  x: (col + 0.5) * TILE,
  y: (row + 0.5) * TILE,
});

export const tileAt = (x: number, y: number) => ({
  col: Math.floor(x / TILE),
  row: Math.floor(y / TILE),
});

/** Every tile covered by an axis-aligned polyline. */
export function pathTiles(corners: [number, number][]): [number, number][] {
  const tiles: [number, number][] = [];
  for (let i = 1; i < corners.length; i++) {
    const [c0, r0] = corners[i - 1];
    const [c1, r1] = corners[i];
    const steps = Math.max(Math.abs(c1 - c0), Math.abs(r1 - r0));
    for (let s = 0; s <= steps; s++) {
      tiles.push([c0 + Math.sign(c1 - c0) * s, r0 + Math.sign(r1 - r0) * s]);
    }
  }
  return tiles;
}
