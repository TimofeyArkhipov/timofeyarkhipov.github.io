import { STORAGE_KEYS } from '@core/config';
import { load, save } from '@core/storage';
import { LEVELS } from '../level/levels';

/** Campaign progress kept in localStorage: open levels and best stars per level. */
export interface Progress {
  unlocked: number;
  stars: number[];
}

export function loadProgress(): Progress {
  const unlocked = Math.min(LEVELS.length, Math.max(1, load<number>(STORAGE_KEYS.unlocked, 1)));
  const stars = load<number[]>(STORAGE_KEYS.stars, []);
  return { unlocked, stars: Array.isArray(stars) ? stars : [] };
}

/** 3 stars - almost no leaks, 2 - half the lives kept, 1 - survived. */
export function starsFor(lives: number, maxLives: number): number {
  if (lives >= maxLives * 0.9) return 3;
  if (lives >= maxLives * 0.5) return 2;
  return 1;
}

/** Saves a victory: opens the next level, keeps the best stars. Returns the stars earned. */
export function saveVictory(level: number, lives: number, maxLives: number): number {
  const p = loadProgress();
  const stars = starsFor(lives, maxLives);
  p.stars[level] = Math.max(p.stars[level] ?? 0, stars);
  save(STORAGE_KEYS.stars, p.stars);
  save(STORAGE_KEYS.unlocked, Math.min(LEVELS.length, Math.max(p.unlocked, level + 2)));
  return stars;
}
