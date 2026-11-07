import { ECONOMY } from '@core/config';
import { seededRandom } from '@core/math';
import { ENEMY_TYPES } from '../enemies/enemyTypes';
import type { EnemyKind } from '../enemies/enemyTypes';
import type { LevelData } from '../level/levels';
import { openEntries } from '../level/levels';

export interface SpawnGroup {
  kind: EnemyKind;
  count: number;
  /** Seconds between two enemies of the group. */
  interval: number;
  /** Seconds after the wave start before the group begins. */
  delay?: number;
}

export interface WaveData {
  groups: SpawnGroup[];
  /** Number of open entries; enemies are spread over the routes starting from them. */
  entries: number;
}

type Pattern = 'swarm' | 'rush' | 'heavy' | 'air' | 'mixed';
const PATTERNS: Pattern[] = ['swarm', 'rush', 'heavy', 'air', 'mixed'];

/** Seconds between spawns of one group. */
const INTERVAL: Record<EnemyKind, number> = {
  slime: 0.8,
  scout: 0.5,
  brute: 2.0,
  beetle: 1.2,
  bat: 0.65,
  gargoyle: 1.6,
  boss: 1,
  dragon: 1,
};

/** Which enemies a level can field. New kinds appear as the campaign goes on. */
function roster(level: number) {
  return {
    heavy: (level >= 2 ? ['brute', 'beetle'] : ['brute']) as EnemyKind[],
    air: (level >= 4 ? ['bat', 'gargoyle'] : level >= 1 ? ['bat'] : []) as EnemyKind[],
    bosses: (level >= 9 ? ['boss', 'dragon'] : level >= 6 ? ['dragon'] : level >= 2 ? ['boss'] : []) as EnemyKind[],
  };
}

/**
 * Waves are generated from the level number and the wave number: every wave gets a budget of
 * "base hit points" that grows over the level and over the campaign, and a pattern that decides
 * which enemies spend it. Seeded, so a level is the same every time.
 */
export function generateWaves(level: LevelData): WaveData[] {
  const L = level.index;
  const pool = roster(L);
  const waves: WaveData[] = [];

  for (let w = 0; w < level.waveCount; w++) {
    const rand = seededRandom(L * 1000 + w * 37 + 11);
    const d = ECONOMY.difficulty(L, w);
    const budget = 240 + 70 * d + 1.5 * d * d;
    const pace = Math.max(0.6, 1 - d * 0.012);
    const last = w === level.waveCount - 1;
    const groups: SpawnGroup[] = [];

    const add = (kind: EnemyKind, points: number, delay = 0) => {
      const count = Math.max(1, Math.round(points / ENEMY_TYPES[kind].hp));
      groups.push({ kind, count, interval: +(INTERVAL[kind] * pace).toFixed(2), delay });
    };
    const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)];

    if (last && pool.bosses.length) {
      pool.bosses.forEach((kind, i) => groups.push({ kind, count: 1, interval: 1, delay: i * 8 }));
      add(pick(pool.heavy), budget * 0.45, 3);
      add('slime', budget * 0.35, 1);
      if (pool.air.length) add(pick(pool.air), budget * 0.3, 6);
    } else if (last) {
      add('brute', budget * 0.6, 2);
      add('slime', budget * 0.5);
      if (pool.air.length) add('bat', budget * 0.25, 5);
    } else {
      let pattern = w === 0 ? 'swarm' : PATTERNS[(w + L) % PATTERNS.length];
      if (pattern === 'air' && !pool.air.length) pattern = 'rush';
      if (pattern === 'heavy' && L === 0 && w < 2) pattern = 'swarm';

      switch (pattern) {
        case 'swarm':
          add('slime', budget);
          break;
        case 'rush':
          add('scout', budget * 0.7);
          add('slime', budget * 0.3, 4);
          break;
        case 'heavy':
          add(pick(pool.heavy), budget * 0.65, 2);
          add(rand() < 0.5 ? 'slime' : 'scout', budget * 0.35);
          break;
        case 'air':
          add(pick(pool.air), budget * 0.7);
          add('slime', budget * 0.3, 3);
          break;
        case 'mixed':
          add('slime', budget * 0.35);
          add('scout', budget * 0.25, 3);
          add(pool.air.length && rand() < 0.5 ? pick(pool.air) : pick(pool.heavy), budget * 0.4, 6);
          break;
      }
    }
    waves.push({ groups, entries: openEntries(level, w) });
  }
  return waves;
}
