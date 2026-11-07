import { Container, Rectangle } from 'pixi.js';
import type { FederatedPointerEvent } from 'pixi.js';
import { audio } from '@core/audio';
import { COLORS, LAYOUT, SIM, TILE } from '@core/config';
import { clamp } from '@core/math';
import { FixedStep } from '@core/FixedStep';
import type { Scene } from '@core/Scene';
import { EffectsView } from '../effects/EffectsView';
import { ENEMY_TYPES } from '../enemies/enemyTypes';
import type { EnemyKind } from '../enemies/enemyTypes';
import { EnemyView } from '../enemies/EnemyView';
import { tileAt } from '../level/Grid';
import { LEVELS, entriesOf, exitsOf } from '../level/levels';
import { LevelView } from '../level/LevelView';
import { PlacementView } from '../towers/PlacementView';
import { ProjectileView } from '../towers/ProjectileView';
import type { Tower } from '../towers/Tower';
import { TowerView } from '../towers/TowerView';
import { TOWER_ORDER, TOWER_TYPES } from '../towers/towerTypes';
import type { TowerKind } from '../towers/towerTypes';
import { Hud } from '../ui/Hud';
import { Overlay } from '../ui/Overlay';
import type { OverlayButton } from '../ui/Overlay';
import { SidePanel } from '../ui/SidePanel';
import { generateWaves } from '../waves/waves';
import { World } from '../world/World';
import { loadProgress, saveVictory } from './progress';

/** What the scene shows first: the level list, the level briefing, or nothing (instant restart). */
export type Intro = 'menu' | 'briefing' | 'none';
export type GoTo = (level: number, intro: Intro) => void;

/** Glue between the simulation (World), its views and the UI. Handles all player input. */
export class GameScene implements Scene {
  readonly view = new Container();

  private readonly world: World;
  private readonly map = new Container();
  private readonly levelView: LevelView;
  private readonly placement = new PlacementView();
  private readonly towers = new TowerView();
  private readonly enemies = new EnemyView();
  private readonly projectiles = new ProjectileView();
  private readonly effects = new EffectsView();
  private readonly hud: Hud;
  private readonly panel: SidePanel;
  private readonly overlay = new Overlay();
  private readonly stepper = new FixedStep(SIM.step, SIM.maxStepsPerFrame);

  private speedIndex = 0;
  private paused = false;
  private buildKind: TowerKind | null = null;
  private selected: Tower | null = null;
  private hover: { col: number; row: number } | null = null;
  /** Simulation time (stops on pause) and real time (for UI blinking). */
  private time = 0;
  private clock = 0;
  private readonly onKey = (e: KeyboardEvent) => this.handleKey(e);

  constructor(
    private readonly levelIndex: number,
    private readonly goto: GoTo,
    intro: Intro = 'briefing',
  ) {
    const level = LEVELS[levelIndex];
    this.world = new World(level);
    const { cols, rows } = this.world.grid;

    this.levelView = new LevelView(this.world.grid, level);
    this.map.position.set(LAYOUT.map.x, LAYOUT.map.y);
    this.map.addChild(this.levelView, this.placement, this.towers, this.enemies, this.projectiles, this.effects);
    this.map.eventMode = 'static';
    this.map.hitArea = new Rectangle(0, 0, cols * TILE, rows * TILE);
    this.map.on('pointermove', (e) => this.onPointerMove(e));
    this.map.on('pointertap', (e) => this.onTap(e));
    // A finger "leaves" right after every tap - only a mouse leaving should clear the preview.
    this.map.on('pointerleave', (e) => e.pointerType === 'mouse' && this.setHover(null));
    this.map.on('rightclick', () => this.cancel());

    this.hud = new Hud({
      onMenu: () => this.showMenu(),
      onSpeed: () => this.cycleSpeed(),
      onPause: () => this.togglePause(),
      onMute: () => this.toggleMute(),
    });
    this.panel = new SidePanel({
      onSelectBuild: (kind) => this.selectBuild(kind),
      onUpgrade: () => this.upgradeSelected(),
      onSell: () => this.sellSelected(),
      onNextWave: () => this.callWave(),
    });
    this.panel.position.set(LAYOUT.panel.x, LAYOUT.panel.y);

    this.view.addChild(this.map, this.hud, this.panel, this.overlay);
    this.bindWorld();
    window.addEventListener('keydown', this.onKey);
    this.refresh();
    this.syncEntries();

    if (intro === 'menu') this.showMenu();
    else if (intro === 'briefing') this.showBriefing();
  }

  private get speed(): number {
    return SIM.speeds[this.speedIndex];
  }

  // ---------- frame ----------

  update(dt: number): void {
    const running = !this.paused && !this.overlay.visible;
    const simDt = running ? dt * this.speed : 0;
    if (running) this.stepper.advance(simDt, (step) => this.world.update(step));
    this.time += simDt;
    this.clock += dt;

    this.enemies.sync(this.world.enemies, this.time);
    this.towers.sync(this.world.towers, simDt);
    this.projectiles.sync(this.world.projectiles);
    this.effects.update(simDt);
    this.hud.update(dt);
    this.panel.tick(this.world);
    this.syncEntries();
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKey);
    this.world.events.clear();
    this.view.destroy({ children: true });
  }

  /** Open entries are lit; the one that opens with the next wave blinks. */
  private syncEntries(): void {
    const w = this.world;
    const open = w.waveIndex >= 0 ? w.waves[w.waveIndex].entries : 0;
    const next = w.nextWave;
    const warn = next && next.entries > open ? next.entries - 1 : null;
    this.levelView.setEntries(open, warn, this.clock);
  }

  // ---------- world events -> feedback ----------

  private bindWorld(): void {
    const ev = this.world.events;
    ev.on('changed', () => this.refresh());
    ev.on('shot', ({ tower }) => {
      this.towers.kick(tower);
      audio.play(tower.type.sound);
    });
    ev.on('impact', ({ projectile: p, x, y }) => {
      if (p.kind === 'cannonball') {
        this.effects.explosion(x, y, (p.hit.splash ?? 1) * TILE);
        audio.play('boom');
      } else if (p.kind === 'shard') {
        this.effects.puff(x, y, 0x9fe3ff, (p.hit.splash ?? 0.5) * TILE * 0.6);
      } else {
        this.effects.spark(x, y);
        audio.play('hit');
      }
    });
    ev.on('enemyKilled', ({ enemy }) => {
      this.effects.puff(enemy.x, enemy.hitY, enemy.type.color, enemy.type.radius);
      this.effects.floatText(enemy.x, enemy.hitY - 20, `+${enemy.reward}`);
    });
    ev.on('enemyLeaked', ({ enemy }) => {
      const { width, height } = this.mapSize;
      this.effects.floatText(clamp(enemy.x, 30, width - 30), clamp(enemy.y, 30, height - 30), `-${enemy.type.damage}`, COLORS.lives);
      this.hud.flashLives();
      audio.play('leak');
    });
    ev.on('towerBuilt', ({ tower }) => {
      this.effects.puff(tower.x, tower.y, COLORS.gold, 26);
      audio.play('build');
    });
    ev.on('towerUpgraded', ({ tower }) => {
      this.effects.puff(tower.x, tower.y, COLORS.accent, 30);
      audio.play('upgrade');
    });
    ev.on('towerSold', ({ tower, refund }) => {
      this.effects.floatText(tower.x, tower.y - 10, `+${refund}`);
      audio.play('sell');
    });
    ev.on('waveStarted', ({ index, newEntry, earlyBonus }) => {
      const wave = this.world.waves[index];
      const boss = wave.groups.find((g) => g.kind === 'boss' || g.kind === 'dragon');
      const last = index === this.world.totalWaves - 1;
      let sub = '';
      if (newEntry !== null && index > 0) sub = `New entry opened: ${newEntry + 1}`;
      else if (boss) sub = `${ENEMY_TYPES[boss.kind].name} is coming!`;
      else if (earlyBonus) sub = `+${earlyBonus} gold for calling early`;
      this.effects.banner(this.mapCenter.x, this.mapCenter.y, last ? 'Final wave' : `Wave ${index + 1}`, sub);
      audio.play('wave');
    });
    ev.on('waveSpawned', ({ bonus }) => {
      this.effects.floatText(this.mapCenter.x, 34, `Wave bonus +${bonus}`);
    });
    ev.on('gameOver', ({ victory, wavesCleared }) => {
      this.cancel();
      audio.play(victory ? 'win' : 'lose');
      const total = this.world.totalWaves;
      const stars = victory ? saveVictory(this.levelIndex, this.world.lives, this.world.level.lives) : 0;
      setTimeout(() => (victory ? this.showVictory(stars) : this.showDefeat(wavesCleared, total)), 900);
    });
  }

  private get mapSize() {
    return { width: this.world.grid.cols * TILE, height: this.world.grid.rows * TILE };
  }

  private get mapCenter() {
    return { x: this.mapSize.width / 2, y: this.mapSize.height / 2 - 20 };
  }

  // ---------- screens ----------

  private showMenu(): void {
    if (this.world.over) return this.showLevels('Tower Defense', 'Choose a level.', []);
    const fresh = this.world.waveIndex < 0 && this.world.towers.length === 0;
    this.cancel();
    this.showLevels('Tower Defense', fresh ? 'Choose a level.' : 'Paused. Pick another level or continue.', [
      { text: fresh ? `Play level ${this.levelIndex + 1}` : 'Continue', onTap: () => (fresh ? this.showBriefing() : this.overlay.hide()), primary: true },
    ]);
  }

  private showLevels(title: string, body: string, buttons: OverlayButton[]): void {
    const p = loadProgress();
    this.overlay.show({
      title,
      body,
      buttons,
      levels: {
        count: LEVELS.length,
        unlocked: p.unlocked,
        stars: p.stars,
        current: this.levelIndex,
        onPick: (i) => (i === this.levelIndex && this.world.waveIndex < 0 && !this.world.over ? this.showBriefing() : this.go(i, 'briefing')),
      },
    });
  }

  private showBriefing(): void {
    const level = this.world.level;
    const entries = entriesOf(level).length;
    const exits = exitsOf(level).length;
    const lines = [
      `${level.waveCount} waves. Waves start by themselves - build fast.`,
      entries > 1
        ? `Enemies come from ${entries} entries and leave through ${exits === 1 ? 'one exit' : `${exits} exits`}. New entries open during the level.`
        : 'Enemies come from one entry.',
    ];
    const news = newEnemies(this.levelIndex);
    if (news.length) {
      lines.push(`New: ${news.map((k) => ENEMY_TYPES[k].name).join(', ')}.`);
      if (news.some((k) => ENEMY_TYPES[k].flying)) lines.push('Flyers ignore the roads and fly straight to the exit. Cannons can\'t hit them.');
      if (news.some((k) => ENEMY_TYPES[k].armor >= 4 && !ENEMY_TYPES[k].flying)) lines.push('Armor blocks part of every hit: weak shots barely scratch it.');
    }
    const bosses = this.world.waves[this.world.totalWaves - 1].groups.filter((g) => g.kind === 'boss' || g.kind === 'dragon');
    if (bosses.length) lines.push(`Final wave: ${bosses.map((g) => ENEMY_TYPES[g.kind].name).join(' and ')}.`);
    this.overlay.show({
      title: `Level ${this.levelIndex + 1}: ${level.name}`,
      body: lines.join('\n'),
      buttons: [
        { text: 'Levels', onTap: () => this.showMenuFromBriefing() },
        { text: 'Start', onTap: () => this.overlay.hide(), primary: true },
      ],
    });
  }

  private showMenuFromBriefing(): void {
    this.showLevels('Tower Defense', 'Choose a level.', [
      { text: `Play level ${this.levelIndex + 1}`, onTap: () => this.showBriefing(), primary: true },
    ]);
  }

  private showVictory(stars: number): void {
    const last = this.levelIndex === LEVELS.length - 1;
    this.overlay.show({
      title: last ? 'Campaign complete!' : 'Victory!',
      titleColor: COLORS.accent,
      stars,
      body:
        `All ${this.world.totalWaves} waves defeated with ${this.world.lives} lives left.` +
        (last ? '\nAll 10 levels are done. Try to get 3 stars everywhere!' : ''),
      buttons: [
        { text: 'Levels', onTap: () => this.showLevels('Tower Defense', 'Choose a level.', []) },
        last
          ? { text: 'Play again', onTap: () => this.go(this.levelIndex, 'none'), primary: true }
          : { text: `Next: level ${this.levelIndex + 2}`, onTap: () => this.go(this.levelIndex + 1, 'briefing'), primary: true },
      ],
    });
  }

  private showDefeat(cleared: number, total: number): void {
    this.overlay.show({
      title: 'Defeat',
      titleColor: COLORS.danger,
      body: `The enemies broke through.\nYou held out for ${cleared} of ${total} waves.\nTip: upgrades add damage and range - often better than a new tower.`,
      buttons: [
        { text: 'Levels', onTap: () => this.showLevels('Tower Defense', 'Choose a level.', []) },
        { text: 'Try again', onTap: () => this.go(this.levelIndex, 'none'), primary: true },
      ],
    });
  }

  /** Switches scene outside of the current event dispatch: this scene gets destroyed. */
  private go(level: number, intro: Intro): void {
    this.overlay.hide();
    setTimeout(() => this.goto(level, intro), 0);
  }

  // ---------- player actions ----------

  private selectBuild(kind: TowerKind): void {
    if (this.world.over) return;
    audio.unlock();
    this.selected = null;
    this.buildKind = this.buildKind === kind ? null : kind;
    this.refresh();
  }

  private cancel(): void {
    this.buildKind = null;
    this.selected = null;
    this.refresh();
  }

  private callWave(): void {
    audio.unlock();
    this.world.callNextWave();
  }

  private upgradeSelected(): void {
    if (this.selected) this.world.upgrade(this.selected);
  }

  private sellSelected(): void {
    if (!this.selected) return;
    this.world.sell(this.selected);
    this.selected = null;
    this.refresh();
  }

  private cycleSpeed(): void {
    this.speedIndex = (this.speedIndex + 1) % SIM.speeds.length;
    this.refresh();
  }

  private togglePause(): void {
    if (this.world.over) return;
    this.paused = !this.paused;
    this.refresh();
  }

  private toggleMute(): void {
    audio.unlock();
    audio.toggleMute();
    this.refresh();
  }

  // ---------- input ----------

  private onPointerMove(e: FederatedPointerEvent): void {
    if (e.pointerType !== 'mouse') return; // touch has no hover: preview is shown on the first tap
    this.setHover(this.tileOf(e));
  }

  private onTap(e: FederatedPointerEvent): void {
    if (e.button !== 0 || this.world.over) return;
    audio.unlock();
    const tile = this.tileOf(e);
    const tower = this.world.towerAt(tile.col, tile.row);

    if (this.buildKind && !tower) {
      // Touch: first tap previews the tower, second tap on the same tile builds it.
      const confirmed = e.pointerType === 'mouse' || (this.hover?.col === tile.col && this.hover?.row === tile.row);
      this.setHover(tile);
      if (!confirmed) return;
      if (this.world.build(this.buildKind, tile.col, tile.row)) {
        if (this.world.gold < TOWER_TYPES[this.buildKind].levels[0].cost) this.buildKind = null;
        if (e.pointerType !== 'mouse') this.hover = null;
        this.refresh();
      }
      return;
    }

    this.buildKind = null;
    this.selected = tower && tower !== this.selected ? tower : null;
    this.refresh();
  }

  private handleKey(e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    audio.unlock();

    if (this.overlay.visible) {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this.overlay.confirm();
      }
      return;
    }

    const towerIndex = ['Digit1', 'Digit2', 'Digit3'].indexOf(e.code);
    if (towerIndex >= 0) return this.selectBuild(TOWER_ORDER[towerIndex]);

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this.callWave();
        break;
      case 'Escape':
        if (this.buildKind || this.selected) this.cancel();
        else this.showMenu();
        break;
      case 'KeyP':
        this.togglePause();
        break;
      case 'KeyF':
        this.cycleSpeed();
        break;
      case 'KeyU':
        this.upgradeSelected();
        break;
      case 'KeyS':
      case 'Delete':
        this.sellSelected();
        break;
      case 'KeyM':
        this.toggleMute();
        break;
    }
  }

  private tileOf(e: FederatedPointerEvent) {
    const p = e.getLocalPosition(this.map);
    return tileAt(p.x, p.y);
  }

  private setHover(tile: { col: number; row: number } | null): void {
    this.hover = tile;
    this.refreshPlacement();
  }

  // ---------- ui ----------

  private refresh(): void {
    if (this.selected && !this.world.towers.includes(this.selected)) this.selected = null;
    this.hud.refresh(this.world, { speed: this.speed, paused: this.paused, muted: audio.muted });
    this.panel.refresh(this.world, this.buildKind, this.selected);
    this.refreshPlacement();
  }

  private refreshPlacement(): void {
    if (this.buildKind && this.hover && this.world.grid.inside(this.hover.col, this.hover.row)) {
      const { col, row } = this.hover;
      this.placement.showGhost(this.buildKind, col, row, this.world.canBuild(this.buildKind, col, row));
    } else {
      this.placement.showSelection(this.selected);
    }
  }
}

/** Enemy kinds that appear in this level for the first time in the campaign. */
function newEnemies(index: number): EnemyKind[] {
  const kinds = (i: number) => new Set(generateWaves(LEVELS[i]).flatMap((w) => w.groups.map((g) => g.kind)));
  const seen = new Set<EnemyKind>();
  for (let i = 0; i < index; i++) for (const k of kinds(i)) seen.add(k);
  return [...kinds(index)].filter((k) => !seen.has(k));
}
