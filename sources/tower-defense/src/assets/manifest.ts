// Single registry of every sprite. Features refer to sprites only by key (SpriteKey),
// so swapping art never touches game logic.
import { Assets, Texture } from 'pixi.js';

import grassA from './sprites/grass-a.svg';
import grassB from './sprites/grass-b.svg';
import tree from './sprites/tree.svg';
import rock from './sprites/rock.svg';
import towerBase from './sprites/tower-base.svg';
import turretArcher from './sprites/turret-archer.svg';
import turretCannon from './sprites/turret-cannon.svg';
import turretFrost from './sprites/turret-frost.svg';
import enemySlime from './sprites/enemy-slime.svg';
import enemyScout from './sprites/enemy-scout.svg';
import enemyBrute from './sprites/enemy-brute.svg';
import enemyBoss from './sprites/enemy-boss.svg';
import enemyBeetle from './sprites/enemy-beetle.svg';
import enemyBat from './sprites/enemy-bat.svg';
import enemyGargoyle from './sprites/enemy-gargoyle.svg';
import enemyDragon from './sprites/enemy-dragon.svg';
import projectileArrow from './sprites/projectile-arrow.svg';
import projectileCannonball from './sprites/projectile-cannonball.svg';
import projectileShard from './sprites/projectile-shard.svg';
import iconCoin from './sprites/icon-coin.svg';
import iconHeart from './sprites/icon-heart.svg';
import iconWave from './sprites/icon-wave.svg';

const SPRITES = {
  grassA,
  grassB,
  tree,
  rock,
  towerBase,
  turretArcher,
  turretCannon,
  turretFrost,
  enemySlime,
  enemyScout,
  enemyBrute,
  enemyBoss,
  enemyBeetle,
  enemyBat,
  enemyGargoyle,
  enemyDragon,
  projectileArrow,
  projectileCannonball,
  projectileShard,
  iconCoin,
  iconHeart,
  iconWave,
} as const;

export type SpriteKey = keyof typeof SPRITES;

/** SVGs are rasterized at 2x so they stay sharp on scaled-up and high-DPI screens. */
const RESOLUTION = 2;

export async function loadAssets(onProgress?: (progress: number) => void): Promise<void> {
  const keys = Object.keys(SPRITES) as SpriteKey[];
  for (const key of keys) {
    Assets.add({ alias: key, src: SPRITES[key], data: { resolution: RESOLUTION } });
  }
  await Assets.load(keys, onProgress);
}

export const texture = (key: SpriteKey): Texture => Assets.get<Texture>(key);
