export interface Vec {
  x: number;
  y: number;
}

export const dist2 = (a: Vec, b: Vec) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
export const dist = (a: Vec, b: Vec) => Math.sqrt(dist2(a, b));
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const angleTo = (from: Vec, to: Vec) => Math.atan2(to.y - from.y, to.x - from.x);

/** Deterministic pseudo-random generator (Park-Miller): same seed - same sequence. Returns [0, 1). */
export function seededRandom(seed: number): () => number {
  // scramble the seed so that close seeds (1, 2, 3...) don't give close first values
  let s = (Math.abs(Math.floor(seed) * 2654435761) % 2147483646) + 1;
  const next = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 4; i++) next();
  return next;
}

/** Shortest signed difference between two angles, in radians. */
export function angleDelta(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}
