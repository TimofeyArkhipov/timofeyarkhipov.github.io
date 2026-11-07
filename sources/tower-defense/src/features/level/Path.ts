import type { Vec } from '@core/math';

export interface PathPoint extends Vec {
  /** Direction of movement in radians. */
  angle: number;
}

/**
 * Polyline the enemies walk along. Position is described by the distance travelled,
 * which also gives a cheap "who is closest to the exit" metric for tower targeting.
 */
export class Path {
  readonly points: Vec[];
  readonly length: number;
  private readonly cumulative: number[];

  constructor(points: Vec[]) {
    this.points = points;
    this.cumulative = [0];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      this.cumulative.push(this.cumulative[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
    }
    this.length = this.cumulative[this.cumulative.length - 1];
  }

  at(distance: number): PathPoint {
    const d = Math.max(0, Math.min(distance, this.length));
    let i = 1;
    while (i < this.cumulative.length - 1 && this.cumulative[i] < d) i++;
    const a = this.points[i - 1];
    const b = this.points[i];
    const segment = this.cumulative[i] - this.cumulative[i - 1] || 1;
    const t = (d - this.cumulative[i - 1]) / segment;
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      angle: Math.atan2(b.y - a.y, b.x - a.x),
    };
  }
}
