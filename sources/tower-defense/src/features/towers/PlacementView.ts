import { Container, Graphics } from 'pixi.js';
import { COLORS, TILE } from '@core/config';
import { tileCenter } from '../level/Grid';
import type { Tower } from './Tower';
import { createTowerSprite } from './TowerView';
import { TOWER_TYPES } from './towerTypes';
import type { TowerKind } from './towerTypes';

/** Build preview ("ghost" tower + range) and the range circle of the selected tower. */
export class PlacementView extends Container {
  private readonly cell = new Graphics();
  private readonly range = new Graphics();
  private ghost: Container | null = null;
  private ghostKind: TowerKind | null = null;

  constructor() {
    super();
    this.addChild(this.cell, this.range);
  }

  showGhost(kind: TowerKind, col: number, row: number, valid: boolean): void {
    if (this.ghostKind !== kind) {
      this.ghost?.destroy({ children: true });
      this.ghost = createTowerSprite(TOWER_TYPES[kind]).root;
      this.ghost.alpha = 0.7;
      this.addChild(this.ghost);
      this.ghostKind = kind;
    }
    const c = tileCenter(col, row);
    const color = valid ? COLORS.range : COLORS.invalid;
    this.ghost!.visible = true;
    this.ghost!.position.set(c.x, c.y);
    this.ghost!.tint = valid ? 0xffffff : 0xff8080;

    this.cell
      .clear()
      .roundRect(col * TILE + 2, row * TILE + 2, TILE - 4, TILE - 4, 8)
      .fill({ color, alpha: 0.18 })
      .stroke({ width: 2, color, alpha: 0.7 });
    this.drawRange(c.x, c.y, TOWER_TYPES[kind].levels[0].range * TILE, color);
  }

  showSelection(tower: Tower | null): void {
    this.hideGhost();
    if (!tower) return;
    this.cell
      .clear()
      .roundRect(tower.col * TILE + 2, tower.row * TILE + 2, TILE - 4, TILE - 4, 8)
      .stroke({ width: 3, color: COLORS.gold });
    this.drawRange(tower.x, tower.y, tower.rangePx, COLORS.range);
    // range after the next upgrade, so the player sees what the gold buys
    const next = tower.nextStats;
    if (next) this.range.circle(tower.x, tower.y, next.range * TILE).stroke({ width: 2, color: COLORS.accent, alpha: 0.5 });
  }

  hideGhost(): void {
    if (this.ghost) this.ghost.visible = false;
    this.cell.clear();
    this.range.clear();
  }

  private drawRange(x: number, y: number, r: number, color: number): void {
    this.range
      .clear()
      .circle(x, y, r)
      .fill({ color, alpha: 0.08 })
      .stroke({ width: 2, color, alpha: 0.55 });
  }
}
