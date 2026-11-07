import type { SpriteKey } from '@assets/manifest';

export type EnemyKind = 'slime' | 'scout' | 'brute' | 'beetle' | 'bat' | 'gargoyle' | 'boss' | 'dragon';

export interface EnemyType {
  kind: EnemyKind;
  name: string;
  hp: number;
  /** Tiles per second. */
  speed: number;
  /** Gold for a kill (before the level reward multiplier). */
  reward: number;
  /** Lives lost if it reaches the exit. */
  damage: number;
  /** Flat damage reduction per hit (a hit always deals at least 25% of its damage). */
  armor: number;
  /** Flyers ignore the road and go straight to the exit. Cannons can't hit them. */
  flying: boolean;
  /** Collision radius for splash damage, in pixels. */
  radius: number;
  sprite: SpriteKey;
  /** Color of the death puff. */
  color: number;
}

export const ENEMY_TYPES: Record<EnemyKind, EnemyType> = {
  slime: { kind: 'slime', name: 'Slime', hp: 40, speed: 1.2, reward: 5, damage: 1, armor: 0, flying: false, radius: 16, sprite: 'enemySlime', color: 0x7ed957 },
  scout: { kind: 'scout', name: 'Scout', hp: 26, speed: 2.3, reward: 4, damage: 1, armor: 0, flying: false, radius: 14, sprite: 'enemyScout', color: 0xf08a24 },
  brute: { kind: 'brute', name: 'Golem', hp: 200, speed: 0.75, reward: 14, damage: 2, armor: 0, flying: false, radius: 20, sprite: 'enemyBrute', color: 0xb3b9c0 },
  beetle: { kind: 'beetle', name: 'Iron Beetle', hp: 90, speed: 1.0, reward: 9, damage: 1, armor: 6, flying: false, radius: 18, sprite: 'enemyBeetle', color: 0x7fb2e5 },
  bat: { kind: 'bat', name: 'Bat', hp: 30, speed: 1.9, reward: 5, damage: 1, armor: 0, flying: true, radius: 16, sprite: 'enemyBat', color: 0xa07cc9 },
  gargoyle: { kind: 'gargoyle', name: 'Gargoyle', hp: 140, speed: 0.95, reward: 13, damage: 2, armor: 3, flying: true, radius: 20, sprite: 'enemyGargoyle', color: 0xb7c1cb },
  boss: { kind: 'boss', name: 'Ogre King', hp: 1500, speed: 0.55, reward: 120, damage: 10, armor: 2, flying: false, radius: 28, sprite: 'enemyBoss', color: 0xb77bd1 },
  dragon: { kind: 'dragon', name: 'Dragon', hp: 1300, speed: 0.6, reward: 140, damage: 10, armor: 4, flying: true, radius: 30, sprite: 'enemyDragon', color: 0xff7a5c },
};
