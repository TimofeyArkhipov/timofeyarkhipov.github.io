// The 10 maps of the campaign. A map is a set of routes: each route is an axis-aligned
// polyline in tile coordinates from an entry to an exit. The first and last points lie
// just outside the 17x11 map. Routes may share segments and cross each other.

export type Route = [number, number][];

export interface LevelData {
  /** 0-based position in the campaign. */
  index: number;
  name: string;
  cols: number;
  rows: number;
  routes: Route[];
  waveCount: number;
  startGold: number;
  lives: number;
}

const COLS = 17;
const ROWS = 11;

const MAPS: { name: string; waves: number; routes: Route[] }[] = [
  {
    name: 'Green Valley',
    waves: 3,
    routes: [[[-1, 2], [4, 2], [4, 7], [9, 7], [9, 2], [13, 2], [13, 8], [17, 8]]],
  },
  {
    name: 'Crossroads',
    waves: 6,
    routes: [[[-1, 5], [11, 5], [11, 1], [6, 1], [6, 9], [14, 9], [14, 3], [17, 3]]],
  },
  {
    name: 'Twin Fords',
    waves: 8,
    routes: [
      [[-1, 2], [5, 2], [5, 8], [12, 8], [12, 4], [17, 4]],
      [[8, 11], [8, 1], [14, 1], [14, 4], [17, 4]],
    ],
  },
  {
    name: 'Serpent Pass',
    waves: 10,
    routes: [
      [[-1, 1], [3, 1], [3, 9], [7, 9], [7, 3], [11, 3], [11, 9], [15, 9], [15, 5], [17, 5]],
      [[-1, 6], [9, 6], [9, 1], [13, 1], [13, 5], [17, 5]],
    ],
  },
  {
    name: 'Three Gates',
    waves: 12,
    routes: [
      [[-1, 1], [4, 1], [4, 6], [10, 6], [10, 2], [17, 2]],
      [[-1, 9], [7, 9], [7, 4], [14, 4], [14, 8], [17, 8]],
      [[12, -1], [12, 10], [16, 10], [16, 8], [17, 8]],
    ],
  },
  {
    name: 'Windmill',
    waves: 14,
    routes: [
      [[-1, 3], [10, 3], [10, 9], [17, 9]],
      [[4, -1], [4, 7], [13, 7], [13, 2], [17, 2]],
      [[7, 11], [7, 5], [15, 5], [15, 2], [17, 2]],
    ],
  },
  {
    name: 'Old Fortress',
    waves: 16,
    routes: [
      [[2, -1], [2, 3], [12, 3], [12, 7], [8, 7], [8, 11]],
      [[14, -1], [14, 9], [5, 9], [5, 5], [-1, 5]],
      [[17, 5], [10, 5], [10, 1], [6, 1], [6, 5], [-1, 5]],
    ],
  },
  {
    name: 'Labyrinth',
    waves: 18,
    routes: [
      [[-1, 1], [6, 1], [6, 9], [17, 9]],
      [[-1, 6], [10, 6], [10, 2], [15, 2], [15, 6], [17, 6]],
      [[-1, 9], [3, 9], [3, 4], [13, 4], [13, 0], [17, 0]],
    ],
  },
  {
    name: 'The Knot',
    waves: 20,
    routes: [
      [[3, -1], [3, 3], [10, 3], [10, 8], [13, 8], [13, 11]],
      [[13, -1], [13, 5], [6, 5], [6, 8], [3, 8], [3, 11]],
      [[-1, 1], [8, 1], [8, 10], [15, 10], [15, 4], [17, 4]],
    ],
  },
  {
    name: 'Dragon Lair',
    waves: 20,
    routes: [
      [[-1, 2], [4, 2], [4, 8], [9, 8], [9, 4], [15, 4], [15, 8], [17, 8]],
      [[-1, 6], [12, 6], [12, 1], [17, 1]],
      [[7, -1], [7, 10], [17, 10]],
    ],
  },
];

export const LEVELS: LevelData[] = MAPS.map((m, index) => ({
  index,
  name: m.name,
  cols: COLS,
  rows: ROWS,
  routes: m.routes,
  waveCount: m.waves,
  startGold: 200 + index * 45,
  lives: 20,
}));

const key = (p: [number, number]) => `${p[0]},${p[1]}`;

/** Distinct route starts, in order of first appearance. Entry 0 opens first. */
export function entriesOf(level: LevelData): [number, number][] {
  const seen = new Map<string, [number, number]>();
  for (const r of level.routes) if (!seen.has(key(r[0]))) seen.set(key(r[0]), r[0]);
  return [...seen.values()];
}

export function exitsOf(level: LevelData): [number, number][] {
  const seen = new Map<string, [number, number]>();
  for (const r of level.routes) {
    const end = r[r.length - 1];
    if (!seen.has(key(end))) seen.set(key(end), end);
  }
  return [...seen.values()];
}

/** Index of the entry a route starts from. */
export function routeEntry(level: LevelData, route: number): number {
  const start = key(level.routes[route][0]);
  return entriesOf(level).findIndex((e) => key(e) === start);
}

/**
 * How many entries are open during a wave: enemies come from one entry first,
 * then new entries open evenly over the level.
 */
export function openEntries(level: LevelData, wave: number): number {
  const n = entriesOf(level).length;
  return Math.min(n, 1 + Math.floor((wave * n) / level.waveCount));
}
