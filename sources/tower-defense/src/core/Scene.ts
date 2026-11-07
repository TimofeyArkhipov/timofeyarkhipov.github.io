import type { Container } from 'pixi.js';

/** A screen of the game. Lives in design coordinates (DESIGN.width x DESIGN.height). */
export interface Scene {
  readonly view: Container;
  /** Called every rendered frame with real elapsed seconds. */
  update(dt: number): void;
  destroy(): void;
}
