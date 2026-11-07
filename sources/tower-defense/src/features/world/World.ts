import { ECONOMY, TILE, WAVE_TIMER } from '@core/config';
import { EventBus } from '@core/EventBus';
import { dist2 } from '@core/math';
import { Enemy } from '../enemies/Enemy';
import { ENEMY_TYPES } from '../enemies/enemyTypes';
import { Cell, Grid } from '../level/Grid';
import type { LevelData } from '../level/levels';
import { Projectile } from '../towers/Projectile';
import { Tower } from '../towers/Tower';
import { TOWER_TYPES } from '../towers/towerTypes';
import type { TowerKind } from '../towers/towerTypes';
import { generateWaves } from '../waves/waves';
import type { WaveData } from '../waves/waves';
import { WaveSpawner } from '../waves/WaveSpawner';
import type { Spawn } from '../waves/WaveSpawner';

export type WorldState = 'playing' | 'won' | 'lost';

export interface WorldEvents {
  enemyKilled: { enemy: Enemy };
  enemyLeaked: { enemy: Enemy };
  shot: { tower: Tower };
  impact: { projectile: Projectile; x: number; y: number };
  towerBuilt: { tower: Tower };
  towerUpgraded: { tower: Tower };
  towerSold: { tower: Tower; refund: number };
  /** `newEntry` - index of an entry that opens with this wave. */
  waveStarted: { index: number; newEntry: number | null; earlyBonus: number };
  /** The wave has fully entered the map; the timer to the next one starts. */
  waveSpawned: { index: number; bonus: number };
  changed: void;
  gameOver: { victory: boolean; wavesCleared: number };
}

/**
 * The whole game simulation. Pure logic: no Pixi, no DOM.
 * Views read its state every frame and listen to its events.
 *
 * Waves start by themselves: a timer runs before the first wave and after each wave
 * has fully entered the map, so waves may overlap. The player can call the next wave early.
 */
export class World {
  readonly events = new EventBus<WorldEvents>();
  readonly grid: Grid;
  readonly waves: WaveData[];
  readonly enemies: Enemy[] = [];
  readonly towers: Tower[] = [];
  readonly projectiles: Projectile[] = [];

  gold: number;
  lives: number;
  /** Index of the current (or last started) wave; -1 before the first one. */
  waveIndex = -1;
  /** Seconds until the next wave, or null while a wave is still entering / after the last one. */
  countdown: number | null = WAVE_TIMER.first;
  state: WorldState = 'playing';

  private readonly spawner = new WaveSpawner();
  private spawning = false;
  private nextId = 1;

  constructor(readonly level: LevelData) {
    this.grid = new Grid(level);
    this.waves = generateWaves(level);
    this.gold = level.startGold;
    this.lives = level.lives;
  }

  get totalWaves(): number {
    return this.waves.length;
  }

  /** The wave the timer counts down to. */
  get nextWave(): WaveData | null {
    return this.waves[this.waveIndex + 1] ?? null;
  }

  /** Waves fully survived: started and with no enemies of them left alive. */
  get wavesCleared(): number {
    if (this.state === 'won') return this.totalWaves;
    return Math.max(0, this.waveIndex + (this.spawning || this.enemies.length ? 0 : 1));
  }

  get canCallWave(): boolean {
    return this.state === 'playing' && this.countdown !== null;
  }

  get earlyBonus(): number {
    return this.countdown === null ? 0 : Math.ceil(this.countdown) * WAVE_TIMER.earlyGoldPerSecond;
  }

  get over(): boolean {
    return this.state !== 'playing';
  }

  towerAt(col: number, row: number): Tower | undefined {
    return this.towers.find((t) => t.col === col && t.row === row);
  }

  canBuild(kind: TowerKind, col: number, row: number): boolean {
    return !this.over && this.grid.isBuildable(col, row) && this.gold >= TOWER_TYPES[kind].levels[0].cost;
  }

  build(kind: TowerKind, col: number, row: number): Tower | null {
    if (!this.canBuild(kind, col, row)) return null;
    const tower = new Tower(this.nextId++, TOWER_TYPES[kind], col, row);
    this.gold -= tower.invested;
    this.towers.push(tower);
    this.grid.set(col, row, Cell.Tower);
    this.events.emit('towerBuilt', { tower });
    this.events.emit('changed', undefined);
    return tower;
  }

  upgrade(tower: Tower): boolean {
    const cost = tower.upgradeCost;
    if (this.over || cost === null || this.gold < cost) return false;
    this.gold -= cost;
    tower.upgrade();
    this.events.emit('towerUpgraded', { tower });
    this.events.emit('changed', undefined);
    return true;
  }

  sell(tower: Tower): void {
    if (this.over) return;
    const i = this.towers.indexOf(tower);
    if (i < 0) return;
    const refund = tower.sellValue;
    this.towers.splice(i, 1);
    this.grid.set(tower.col, tower.row, Cell.Grass);
    this.gold += refund;
    this.events.emit('towerSold', { tower, refund });
    this.events.emit('changed', undefined);
  }

  /** Starts the next wave now instead of waiting for the timer; pays gold for the time saved. */
  callNextWave(): boolean {
    if (!this.canCallWave) return false;
    const bonus = this.earlyBonus;
    this.gold += bonus;
    this.startWave(bonus);
    return true;
  }

  update(dt: number): void {
    if (this.over) return;

    if (this.countdown !== null) {
      this.countdown -= dt;
      if (this.countdown <= 0) this.startWave(0);
    }

    if (this.spawning) {
      this.spawner.update(dt, (s) => this.spawn(s));
      if (this.spawner.done) this.finishSpawning();
    }

    for (const e of this.enemies) {
      e.update(dt);
      if (e.reachedExit) this.leak(e);
    }
    if (this.over) return;

    for (const t of this.towers) t.update(dt, this.enemies, (tower, target) => this.fire(tower, target));

    for (const p of this.projectiles) {
      if (p.update(dt, this.findEnemy(p.targetId))) this.impact(p);
    }

    removeDead(this.enemies);
    removeDead(this.projectiles);

    const lastWave = this.waveIndex === this.totalWaves - 1;
    if (lastWave && !this.spawning && this.enemies.length === 0) this.end(true);
  }

  /** Indices of the routes whose entry is open in the given wave. */
  openRoutes(wave: number): number[] {
    const entries = this.waves[wave].entries;
    return this.grid.routeEntries.flatMap((entry, route) => (entry < entries ? [route] : []));
  }

  private startWave(earlyBonus: number): void {
    this.waveIndex++;
    this.countdown = null;
    this.spawning = true;
    const wave = this.waves[this.waveIndex];
    const before = this.waveIndex > 0 ? this.waves[this.waveIndex - 1].entries : 1;
    this.spawner.start(wave, this.openRoutes(this.waveIndex));
    this.events.emit('waveStarted', {
      index: this.waveIndex,
      newEntry: wave.entries > before ? wave.entries - 1 : null,
      earlyBonus,
    });
    this.events.emit('changed', undefined);
  }

  private finishSpawning(): void {
    this.spawning = false;
    const bonus = ECONOMY.waveBonus(this.difficulty);
    this.gold += bonus;
    if (this.waveIndex < this.totalWaves - 1) this.countdown = WAVE_TIMER.between;
    this.events.emit('waveSpawned', { index: this.waveIndex, bonus });
    this.events.emit('changed', undefined);
  }

  private get difficulty(): number {
    return ECONOMY.difficulty(this.level.index, Math.max(0, this.waveIndex));
  }

  private spawn({ kind, route }: Spawn): void {
    const type = ENEMY_TYPES[kind];
    const d = this.difficulty;
    const path = type.flying ? this.grid.flights[route] : this.grid.paths[route];
    const reward = Math.round(type.reward * ECONOMY.rewardScale(d));
    this.enemies.push(new Enemy(this.nextId++, type, ECONOMY.hpScale(d), reward, path));
  }

  private fire(tower: Tower, target: Enemy): void {
    const { damage, splash, slow } = tower.stats;
    const muzzle = 22;
    const from = { x: tower.x + Math.cos(tower.angle) * muzzle, y: tower.y + Math.sin(tower.angle) * muzzle };
    this.projectiles.push(
      new Projectile(this.nextId++, tower.type.projectile, from, target.id, target, tower.type.projectileSpeed, {
        damage,
        splash,
        slow,
        hitsAir: tower.type.hitsAir,
      }),
    );
    this.events.emit('shot', { tower });
  }

  private impact(p: Projectile): void {
    const { damage, splash, slow, hitsAir } = p.hit;
    const victims = splash
      ? this.enemies.filter(
          (e) => e.alive && (hitsAir || !e.flying) && dist2({ x: e.x, y: e.hitY }, p) <= (splash * TILE + e.type.radius) ** 2,
        )
      : [this.findEnemy(p.targetId)].filter((e): e is Enemy => !!e?.alive);

    for (const e of victims) {
      if (slow) e.applySlow(slow.factor, slow.duration);
      if (e.takeDamage(damage)) this.kill(e);
    }
    this.events.emit('impact', { projectile: p, x: p.x, y: p.y });
  }

  private kill(enemy: Enemy): void {
    this.gold += enemy.reward;
    this.events.emit('enemyKilled', { enemy });
    this.events.emit('changed', undefined);
  }

  private leak(enemy: Enemy): void {
    this.lives = Math.max(0, this.lives - enemy.type.damage);
    this.events.emit('enemyLeaked', { enemy });
    this.events.emit('changed', undefined);
    if (this.lives === 0) this.end(false);
  }

  private end(victory: boolean): void {
    const cleared = victory ? this.totalWaves : Math.max(0, this.waveIndex);
    this.state = victory ? 'won' : 'lost';
    this.countdown = null;
    this.projectiles.length = 0;
    this.events.emit('changed', undefined);
    this.events.emit('gameOver', { victory, wavesCleared: cleared });
  }

  private findEnemy(id: number): Enemy | undefined {
    return this.enemies.find((e) => e.id === id);
  }
}

function removeDead<T extends { alive: boolean }>(list: T[]): void {
  let w = 0;
  for (const item of list) if (item.alive) list[w++] = item;
  list.length = w;
}
