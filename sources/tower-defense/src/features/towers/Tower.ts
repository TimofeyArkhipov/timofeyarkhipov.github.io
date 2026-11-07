import { ECONOMY, TILE } from '@core/config';
import { angleDelta, angleTo, dist2 } from '@core/math';
import type { Enemy } from '../enemies/Enemy';
import { tileCenter } from '../level/Grid';
import type { TowerLevel, TowerType } from './towerTypes';

/** How fast the turret can turn, radians per second. */
const TURN_SPEED = 10;
/** Fire only when the turret looks roughly at the target. */
const AIM_TOLERANCE = 0.35;

export class Tower {
  readonly x: number;
  readonly y: number;
  level = 0;
  /** Turret angle; sprites point up, so -PI/2 means "no rotation". */
  angle = -Math.PI / 2;
  invested: number;
  targetId: number | null = null;
  private cooldown = 0;

  constructor(
    readonly id: number,
    readonly type: TowerType,
    readonly col: number,
    readonly row: number,
  ) {
    const c = tileCenter(col, row);
    this.x = c.x;
    this.y = c.y;
    this.invested = type.levels[0].cost;
  }

  get stats(): TowerLevel {
    return this.type.levels[this.level];
  }

  get rangePx(): number {
    return this.stats.range * TILE;
  }

  /** Stats after the next upgrade, or null at max level. */
  get nextStats(): TowerLevel | null {
    return this.maxLevel ? null : this.type.levels[this.level + 1];
  }

  get maxLevel(): boolean {
    return this.level >= this.type.levels.length - 1;
  }

  get upgradeCost(): number | null {
    return this.maxLevel ? null : this.type.levels[this.level + 1].cost;
  }

  get sellValue(): number {
    return Math.floor(this.invested * ECONOMY.sellRefund);
  }

  upgrade(): void {
    const cost = this.upgradeCost;
    if (cost === null) return;
    this.level++;
    this.invested += cost;
  }

  /** Picks a target, turns to it and calls `fire` when ready. */
  update(dt: number, enemies: Enemy[], fire: (tower: Tower, target: Enemy) => void): void {
    this.cooldown = Math.max(0, this.cooldown - dt);
    const target = this.pickTarget(enemies);
    this.targetId = target?.id ?? null;
    if (!target) return;

    const want = angleTo(this, target);
    const delta = angleDelta(this.angle, want);
    const turn = TURN_SPEED * dt;
    this.angle += Math.abs(delta) <= turn ? delta : Math.sign(delta) * turn;

    if (this.cooldown === 0 && Math.abs(angleDelta(this.angle, want)) < AIM_TOLERANCE) {
      fire(this, target);
      this.cooldown = 1 / this.stats.fireRate;
    }
  }

  /** "First" targeting: the enemy in range that is closest to its exit. */
  private pickTarget(enemies: Enemy[]): Enemy | null {
    const r2 = this.rangePx ** 2;
    let best: Enemy | null = null;
    for (const e of enemies) {
      if (!e.alive || (e.flying && !this.type.hitsAir) || dist2(this, e) > r2) continue;
      if (!best || e.remaining < best.remaining) best = e;
    }
    return best;
  }
}
