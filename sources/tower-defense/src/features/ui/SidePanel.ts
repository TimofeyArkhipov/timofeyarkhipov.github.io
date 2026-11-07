import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { texture } from '@assets/manifest';
import { COLORS, FONT, LAYOUT } from '@core/config';
import { ENEMY_TYPES } from '../enemies/enemyTypes';
import type { EnemyKind } from '../enemies/enemyTypes';
import type { Tower } from '../towers/Tower';
import { createTowerSprite } from '../towers/TowerView';
import { TOWER_ORDER, TOWER_TYPES } from '../towers/towerTypes';
import type { TowerKind, TowerLevel } from '../towers/towerTypes';
import type { World } from '../world/World';
import { Button } from './Button';

export interface PanelHandlers {
  onSelectBuild: (kind: TowerKind) => void;
  onUpgrade: () => void;
  onSell: () => void;
  onNextWave: () => void;
}

const PAD = 16;
const INNER = LAYOUT.panel.width - PAD * 2;
const TOUCH = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

const HINT_BUILD = TOUCH
  ? 'Tap a free tile to preview,\ntap it again to build.\nTap the card again to cancel.'
  : 'Click a free tile to build.\nRight-click or Esc to cancel.';
const HINT_HOW = TOUCH
  ? 'Waves come by themselves. Build towers next to the roads. Tap a tower to upgrade it: more damage and range.'
  : 'Waves come by themselves. Build towers next to the roads. Click a tower to upgrade it: more damage and range.\n\nKeys: 1-3 towers, Space call wave, U upgrade, S sell, P pause, F speed.';

/** Right panel: tower shop, selected tower info, wave timer. */
export class SidePanel extends Container {
  private readonly cards = new Map<TowerKind, TowerCard>();
  private readonly title: Text;
  private readonly stats: Text;
  private readonly upgradeBtn: Button;
  private readonly sellBtn: Button;
  private readonly waveBtn: Button;
  private readonly preview: Text;
  private shownWaveText = '';

  constructor(handlers: PanelHandlers) {
    super();
    const { width, height } = LAYOUT.panel;
    this.addChild(new Graphics().rect(0, 0, width, height).fill(COLORS.panel).rect(0, 0, 2, height).fill(COLORS.panelBorder));

    this.addChild(label('TOWERS', PAD, 18));
    TOWER_ORDER.forEach((kind, i) => {
      const card = new TowerCard(kind, () => handlers.onSelectBuild(kind));
      card.position.set(PAD, 44 + i * 94);
      this.cards.set(kind, card);
      this.addChild(card);
    });

    this.addChild(new Graphics().rect(PAD, 334, INNER, 2).fill(COLORS.panelBorder));

    this.title = new Text({ text: '', style: { fontFamily: FONT, fontSize: 20, fontWeight: '800', fill: COLORS.text } });
    this.title.position.set(PAD, 350);
    this.stats = new Text({
      text: '',
      style: { fontFamily: FONT, fontSize: 15, fill: COLORS.textMuted, lineHeight: 21, wordWrap: true, wordWrapWidth: INNER },
    });
    this.stats.position.set(PAD, 382);

    this.upgradeBtn = new Button({ width: INNER, height: 44, text: 'Upgrade', onTap: handlers.onUpgrade, color: 0x2f5d3d });
    this.upgradeBtn.position.set(PAD, 520);
    this.sellBtn = new Button({ width: INNER, height: 36, text: 'Sell', onTap: handlers.onSell, color: 0x4a2a2a });
    this.sellBtn.position.set(PAD, 570);

    this.preview = new Text({
      text: '',
      style: { fontFamily: FONT, fontSize: 12, fill: COLORS.textMuted, lineHeight: 15, wordWrap: true, wordWrapWidth: INNER },
    });
    this.preview.position.set(PAD, 614);

    this.waveBtn = new Button({ width: INNER, height: 52, text: '', fontSize: 16, onTap: handlers.onNextWave, color: 0x3c7a4e });
    this.waveBtn.position.set(PAD, 662);

    this.addChild(this.title, this.stats, this.upgradeBtn, this.sellBtn, this.preview, this.waveBtn);
  }

  /** Called every frame: the wave timer changes without world events. */
  tick(world: World): void {
    let text: string;
    if (world.over) text = world.state === 'won' ? 'Victory!' : 'Defeat';
    else if (world.countdown !== null) {
      text = `Wave ${world.waveIndex + 2} in ${Math.ceil(world.countdown)}s\nCall now  +${world.earlyBonus} gold`;
    } else if (world.waveIndex === world.totalWaves - 1) text = 'Final wave!';
    else text = `Wave ${world.waveIndex + 1} incoming`;
    if (text !== this.shownWaveText) {
      this.shownWaveText = text;
      this.waveBtn.text = text;
    }
    this.waveBtn.enabled = world.canCallWave;
  }

  refresh(world: World, buildKind: TowerKind | null, selected: Tower | null): void {
    this.preview.text = previewText(world);
    this.tick(world);
    for (const [kind, card] of this.cards) {
      card.refresh(kind === buildKind, world.gold >= TOWER_TYPES[kind].levels[0].cost && !world.over);
    }

    if (selected) {
      const next = selected.upgradeCost;
      this.title.text = `${selected.type.name}  ·  level ${selected.level + 1}/${selected.type.levels.length}`;
      this.stats.text = describe(selected.stats, selected.nextStats) + (selected.type.hitsAir ? '' : '\nCan\'t hit flyers');
      this.upgradeBtn.visible = this.sellBtn.visible = true;
      this.upgradeBtn.text = next === null ? 'Max level' : `Upgrade  -${next}`;
      this.upgradeBtn.enabled = next !== null && world.gold >= next && !world.over;
      this.sellBtn.text = `Sell  +${selected.sellValue}`;
      this.sellBtn.enabled = !world.over;
    } else if (buildKind) {
      const type = TOWER_TYPES[buildKind];
      this.title.text = `Build: ${type.name}`;
      this.stats.text = `${describe(type.levels[0], null)}\n\n${HINT_BUILD}`;
      this.upgradeBtn.visible = this.sellBtn.visible = false;
    } else {
      this.title.text = 'How to play';
      this.stats.text = HINT_HOW;
      this.upgradeBtn.visible = this.sellBtn.visible = false;
    }
  }
}

/** "Next: 12 Slime, 4 Bat (air)" plus a warning when a new entry opens. */
function previewText(world: World): string {
  const wave = world.nextWave;
  if (!wave || world.over) return '';
  const counts = new Map<EnemyKind, number>();
  for (const g of wave.groups) counts.set(g.kind, (counts.get(g.kind) ?? 0) + g.count);
  const list = [...counts].map(([kind, n]) => `${n} ${ENEMY_TYPES[kind].name}${ENEMY_TYPES[kind].flying ? ' (air)' : ''}`).join(', ');
  const before = world.waveIndex >= 0 ? world.waves[world.waveIndex].entries : 1;
  return `Next: ${list}` + (wave.entries > before ? '  ·  new entry!' : '');
}

/** Stats text; when `next` is given, shows how the upgrade changes them. */
function describe(s: TowerLevel, next: TowerLevel | null): string {
  const row = (name: string, a: string, b?: string) => `${name}: ${a}${b && b !== a ? `  →  ${b}` : ''}`;
  const lines = [
    row('Damage', `${s.damage}`, next ? `${next.damage}` : undefined),
    row('Range', `${s.range}`, next ? `${next.range}` : undefined),
    row('Shots/sec', `${s.fireRate}`, next ? `${next.fireRate}` : undefined),
  ];
  if (s.splash) lines.push(row('Area', `${s.splash}`, next?.splash ? `${next.splash}` : undefined));
  if (s.slow) {
    const pct = (f: number) => `${Math.round((1 - f) * 100)}%`;
    lines.push(row('Slow', pct(s.slow.factor), next?.slow ? pct(next.slow.factor) : undefined));
  }
  return lines.join('\n');
}

function label(text: string, x: number, y: number): Text {
  const t = new Text({ text, style: { fontFamily: FONT, fontSize: 13, fontWeight: '800', fill: COLORS.textMuted, letterSpacing: 2 } });
  t.position.set(x, y);
  return t;
}

class TowerCard extends Container {
  private readonly bg = new Graphics();
  private hovered = false;
  private selected = false;
  private affordable = true;

  constructor(kind: TowerKind, onTap: () => void) {
    super();
    const type = TOWER_TYPES[kind];
    const icon = createTowerSprite(type).root;
    icon.scale.set(0.9);
    icon.position.set(40, 43);

    const name = new Text({ text: type.name, style: { fontFamily: FONT, fontSize: 18, fontWeight: '800', fill: COLORS.text } });
    name.position.set(80, 10);
    const coin = new Sprite(texture('iconCoin'));
    coin.scale.set(0.6);
    coin.position.set(80, 37);
    const cost = new Text({ text: String(type.levels[0].cost), style: { fontFamily: FONT, fontSize: 16, fontWeight: '700', fill: COLORS.gold } });
    cost.position.set(102, 36);
    const desc = new Text({ text: type.description, style: { fontFamily: FONT, fontSize: 13, fill: COLORS.textMuted } });
    desc.position.set(80, 60);
    const key = new Text({ text: type.hotkey, style: { fontFamily: FONT, fontSize: 12, fontWeight: '800', fill: COLORS.textMuted } });
    key.anchor.set(1, 0);
    key.position.set(INNER - 10, 8);

    this.addChild(this.bg, icon, name, coin, cost, desc, key);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerover', () => ((this.hovered = true), this.redraw()));
    this.on('pointerout', () => ((this.hovered = false), this.redraw()));
    this.on('pointertap', (e) => {
      e.stopPropagation();
      onTap();
    });
    this.redraw();
  }

  refresh(selected: boolean, affordable: boolean): void {
    if (selected === this.selected && affordable === this.affordable) return;
    this.selected = selected;
    this.affordable = affordable;
    this.redraw();
  }

  private redraw(): void {
    const border = this.selected ? COLORS.accent : this.hovered ? COLORS.gold : COLORS.panelBorder;
    this.bg
      .clear()
      .roundRect(0, 0, INNER, 86, 12)
      .fill(this.selected ? 0x24402e : COLORS.panelLight)
      .stroke({ width: this.selected ? 3 : 2, color: border });
    this.alpha = this.affordable ? 1 : 0.5;
  }
}
