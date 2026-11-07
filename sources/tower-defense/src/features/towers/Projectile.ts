import { TILE } from '@core/config';
import type { Enemy } from '../enemies/Enemy';
import type { ProjectileKind, TowerLevel } from './towerTypes';

/** Homing projectile. If the target dies on the way it flies to the last known position. */
export class Projectile {
  x: number;
  y: number;
  angle = 0;
  alive = true;
  private tx: number;
  private ty: number;
  private readonly speed: number;

  constructor(
    readonly id: number,
    readonly kind: ProjectileKind,
    from: { x: number; y: number },
    readonly targetId: number,
    target: Enemy,
    speedTiles: number,
    readonly hit: Pick<TowerLevel, 'damage' | 'splash' | 'slow'> & { hitsAir: boolean },
  ) {
    this.x = from.x;
    this.y = from.y;
    this.tx = target.x;
    this.ty = target.hitY;
    this.speed = speedTiles * TILE;
  }

  /** Moves the projectile. Returns true on the frame it arrives. */
  update(dt: number, target: Enemy | undefined): boolean {
    if (target?.alive) {
      this.tx = target.x;
      this.ty = target.hitY;
    }
    const dx = this.tx - this.x;
    const dy = this.ty - this.y;
    const d = Math.hypot(dx, dy);
    this.angle = Math.atan2(dy, dx);
    const step = this.speed * dt;
    if (d <= step) {
      this.x = this.tx;
      this.y = this.ty;
      this.alive = false;
      return true;
    }
    this.x += (dx / d) * step;
    this.y += (dy / d) * step;
    return false;
  }
}
