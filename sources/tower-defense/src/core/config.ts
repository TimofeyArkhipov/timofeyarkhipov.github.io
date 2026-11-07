// Base configuration shared by every part of the game.
// Gameplay numbers for specific towers/enemies live next to their features.

/** Design resolution. The whole scene is scaled to fit the window. */
export const DESIGN = { width: 1280, height: 720 } as const;

/** Size of one map tile in design pixels. */
export const TILE = 60;

/** Layout of the screen areas (design pixels). */
export const LAYOUT = {
  hud: { x: 0, y: 0, width: 1020, height: 60 },
  map: { x: 0, y: 60 },
  panel: { x: 1020, y: 0, width: 260, height: 720 },
} as const;

/** Flying enemies are drawn and hit this many pixels above their ground position. */
export const FLY_HEIGHT = 22;

/** Fixed simulation step: logic always advances in equal steps, independent of FPS. */
export const SIM = {
  step: 1 / 60,
  maxStepsPerFrame: 10,
  speeds: [1, 2, 3] as const,
} as const;

/** Waves start by themselves: seconds before the first wave and between waves. */
export const WAVE_TIMER = {
  first: 25,
  /** Counted from the moment the previous wave has fully entered the map. */
  between: 10,
  /** Gold per second left on the timer when the player calls a wave early. */
  earlyGoldPerSecond: 1,
} as const;

export const ECONOMY = {
  sellRefund: 0.7,
  /**
   * One number that grows over a level and over the campaign. Drives wave size,
   * enemy health and rewards. level and wave are 0-based.
   */
  difficulty: (level: number, wave: number) => wave + level * 1.5,
  /** Grows faster late in the campaign, when the player can afford max-level towers. */
  hpScale: (d: number) => 1 + d * 0.05 + d * d * 0.0012,
  rewardScale: (d: number) => 1 + d * 0.03,
  /** Paid when a wave has fully entered the map. */
  waveBonus: (d: number) => Math.round(20 + d * 3),
} as const;

export const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export const COLORS = {
  background: 0x0e1712,
  panel: 0x16241b,
  panelLight: 0x1f3226,
  panelBorder: 0x2d4a37,
  text: 0xe8f1e4,
  textMuted: 0x8fa996,
  gold: 0xf2c14e,
  lives: 0xff6b6b,
  accent: 0x6fd08c,
  danger: 0xe5484d,
  path: 0xc9a66b,
  pathEdge: 0x8a6b3e,
  range: 0xffffff,
  invalid: 0xff4d4d,
} as const;

export const STORAGE_KEYS = {
  /** Number of unlocked levels. */
  unlocked: 'td.unlocked',
  /** Best result per level: lives left on victory. */
  stars: 'td.stars',
  muted: 'td.muted',
} as const;
