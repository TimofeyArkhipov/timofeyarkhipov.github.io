import type { SpriteKey } from '@assets/manifest';
import type { Sfx } from '@core/audio';

export type TowerKind = 'archer' | 'cannon' | 'frost';
export type ProjectileKind = 'arrow' | 'cannonball' | 'shard';

export interface TowerLevel {
  /** Gold to build (level 1) or to upgrade to this level. */
  cost: number;
  damage: number;
  /** Tiles. */
  range: number;
  /** Shots per second. */
  fireRate: number;
  /** Area damage radius in tiles. */
  splash?: number;
  /** Speed multiplier applied to hit enemies, and for how long. */
  slow?: { factor: number; duration: number };
}

export interface TowerType {
  kind: TowerKind;
  name: string;
  description: string;
  hotkey: string;
  turret: SpriteKey;
  projectile: ProjectileKind;
  /** Tiles per second. */
  projectileSpeed: number;
  /** Can it shoot flying enemies? */
  hitsAir: boolean;
  sound: Sfx;
  /** Level 1 is the build; every next level is an upgrade: more damage and more range. */
  levels: TowerLevel[];
}

export const TOWER_TYPES: Record<TowerKind, TowerType> = {
  archer: {
    kind: 'archer',
    name: 'Archer',
    description: 'Fast shots, hits flyers',
    hotkey: '1',
    turret: 'turretArcher',
    projectile: 'arrow',
    projectileSpeed: 12,
    hitsAir: true,
    sound: 'arrow',
    levels: [
      { cost: 60, damage: 9, range: 2.6, fireRate: 1.4 },
      { cost: 50, damage: 15, range: 2.9, fireRate: 1.5 },
      { cost: 80, damage: 23, range: 3.2, fireRate: 1.6 },
      { cost: 120, damage: 34, range: 3.5, fireRate: 1.7 },
      { cost: 170, damage: 50, range: 3.9, fireRate: 1.9 },
    ],
  },
  cannon: {
    kind: 'cannon',
    name: 'Cannon',
    description: 'Area damage, ground only',
    hotkey: '2',
    turret: 'turretCannon',
    projectile: 'cannonball',
    projectileSpeed: 7,
    hitsAir: false,
    sound: 'cannon',
    levels: [
      { cost: 100, damage: 28, range: 2.3, fireRate: 0.55, splash: 0.9 },
      { cost: 80, damage: 45, range: 2.5, fireRate: 0.6, splash: 1.0 },
      { cost: 130, damage: 70, range: 2.8, fireRate: 0.62, splash: 1.1 },
      { cost: 180, damage: 105, range: 3.1, fireRate: 0.66, splash: 1.2 },
      { cost: 250, damage: 155, range: 3.4, fireRate: 0.7, splash: 1.3 },
    ],
  },
  frost: {
    kind: 'frost',
    name: 'Frost',
    description: 'Slows ground and air',
    hotkey: '3',
    turret: 'turretFrost',
    projectile: 'shard',
    projectileSpeed: 10,
    hitsAir: true,
    sound: 'frost',
    levels: [
      { cost: 80, damage: 4, range: 2.2, fireRate: 1.0, splash: 0.6, slow: { factor: 0.55, duration: 1.4 } },
      { cost: 60, damage: 7, range: 2.4, fireRate: 1.1, splash: 0.7, slow: { factor: 0.48, duration: 1.6 } },
      { cost: 100, damage: 11, range: 2.7, fireRate: 1.2, splash: 0.8, slow: { factor: 0.42, duration: 1.8 } },
      { cost: 140, damage: 16, range: 3.0, fireRate: 1.3, splash: 0.9, slow: { factor: 0.36, duration: 2.0 } },
      { cost: 200, damage: 24, range: 3.3, fireRate: 1.4, splash: 1.0, slow: { factor: 0.3, duration: 2.2 } },
    ],
  },
};

export const TOWER_ORDER: TowerKind[] = ['archer', 'cannon', 'frost'];
