import type { EnemyKind } from '../enemies/enemyTypes';
import type { WaveData } from './waves';

export interface Spawn {
  kind: EnemyKind;
  /** Index of the route the enemy takes. */
  route: number;
}

/** Turns a wave description into a timeline of spawns spread over the open routes. */
export class WaveSpawner {
  private queue: (Spawn & { at: number })[] = [];
  private time = 0;

  /** `routes` - indices of the routes that are open in this wave. */
  start(wave: WaveData, routes: number[]): void {
    this.time = 0;
    this.queue = wave.groups
      .flatMap((g, gi) =>
        Array.from({ length: g.count }, (_, i) => ({
          at: (g.delay ?? 0) + i * g.interval,
          kind: g.kind,
          route: routes[(i + gi) % routes.length],
        })),
      )
      .sort((a, b) => a.at - b.at);
  }

  update(dt: number, spawn: (s: Spawn) => void): void {
    this.time += dt;
    while (this.queue.length && this.queue[0].at <= this.time) spawn(this.queue.shift()!);
  }

  get done(): boolean {
    return this.queue.length === 0;
  }
}
