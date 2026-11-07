import { FLY_HEIGHT, TILE } from '@core/config';
import type { Path } from '../level/Path';
import type { EnemyType } from './enemyTypes';

export class Enemy {
  readonly maxHp: number;
  hp: number;
  /** Distance travelled along its path, in pixels. */
  distance = 0;
  x = 0;
  y = 0;
  angle = 0;
  alive = true;
  reachedExit = false;

  private slowFactor = 1;
  private slowTimer = 0;

  constructor(
    readonly id: number,
    readonly type: EnemyType,
    hpScale: number,
    /** Gold for the kill, already scaled for the level. */
    readonly reward: number,
    /** Road for walkers, straight flight line for flyers. */
    readonly path: Path,
  ) {
    this.maxHp = Math.round(type.hp * hpScale);
    this.hp = this.maxHp;
    this.syncPosition();
  }

  get flying(): boolean {
    return this.type.flying;
  }

  get slowed(): boolean {
    return this.slowTimer > 0;
  }

  /** Where projectiles aim: flyers are hit in the air, not at their shadow. */
  get hitY(): number {
    return this.type.flying ? this.y - FLY_HEIGHT : this.y;
  }

  /** Pixels left to the exit. Towers shoot the enemy with the smallest value first. */
  get remaining(): number {
    return this.path.length - this.distance;
  }

  update(dt: number): void {
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) this.slowFactor = 1;
    }
    this.distance += this.type.speed * TILE * this.slowFactor * dt;
    if (this.distance >= this.path.length) {
      this.reachedExit = true;
      this.alive = false;
      return;
    }
    this.syncPosition();
  }

  /** Applies armor. Returns true if this hit killed the enemy. */
  takeDamage(amount: number): boolean {
    if (!this.alive) return false;
    this.hp -= Math.max(amount * 0.25, amount - this.type.armor);
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      return true;
    }
    return false;
  }

  /** factor = speed multiplier (0.5 = half speed). The strongest active slow wins. */
  applySlow(factor: number, duration: number): void {
    this.slowFactor = Math.min(this.slowFactor, factor);
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  private syncPosition(): void {
    const p = this.path.at(this.distance);
    this.x = p.x;
    this.y = p.y;
    this.angle = p.angle;
  }
}
