import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { texture } from '@assets/manifest';
import type { SpriteKey } from '@assets/manifest';
import { COLORS, FONT, LAYOUT } from '@core/config';
import type { World } from '../world/World';
import { Button } from './Button';

export interface HudHandlers {
  onMenu: () => void;
  onSpeed: () => void;
  onPause: () => void;
  onMute: () => void;
}

export interface HudState {
  speed: number;
  paused: boolean;
  muted: boolean;
}

/** Top bar: lives, gold, wave counter, level name and game controls. */
export class Hud extends Container {
  private readonly lives: Text;
  private readonly gold: Text;
  private readonly wave: Text;
  private readonly level: Text;
  private readonly speedBtn: Button;
  private readonly pauseBtn: Button;
  private readonly muteBtn: Button;
  private livesFlash = 0;

  constructor(handlers: HudHandlers) {
    super();
    const { width, height } = LAYOUT.hud;
    this.addChild(
      new Graphics()
        .rect(0, 0, width, height)
        .fill(COLORS.panel)
        .rect(0, height - 2, width, 2)
        .fill(COLORS.panelBorder),
    );

    this.lives = this.stat('iconHeart', 14, COLORS.lives);
    this.gold = this.stat('iconCoin', 104, COLORS.gold);
    this.wave = this.stat('iconWave', 214, COLORS.text);
    this.level = new Text({ text: '', style: { fontFamily: FONT, fontSize: 15, fontWeight: '700', fill: COLORS.textMuted, lineHeight: 19 } });
    this.level.anchor.set(0, 0.5);
    this.level.position.set(386, 30);
    this.addChild(this.level);

    const y = 10;
    const menuBtn = new Button({ width: 76, height: 40, text: 'Menu', fontSize: 15, onTap: handlers.onMenu });
    this.speedBtn = new Button({ width: 92, height: 40, text: 'Speed x1', fontSize: 15, onTap: handlers.onSpeed });
    this.pauseBtn = new Button({ width: 86, height: 40, text: 'Pause', fontSize: 15, onTap: handlers.onPause });
    this.muteBtn = new Button({ width: 104, height: 40, text: 'Sound on', fontSize: 15, onTap: handlers.onMute });
    menuBtn.position.set(width - 394, y);
    this.speedBtn.position.set(width - 310, y);
    this.pauseBtn.position.set(width - 210, y);
    this.muteBtn.position.set(width - 116, y);
    this.addChild(menuBtn, this.speedBtn, this.pauseBtn, this.muteBtn);
  }

  refresh(world: World, state: HudState): void {
    this.lives.text = String(world.lives);
    this.gold.text = String(world.gold);
    this.wave.text = `${Math.max(0, world.waveIndex + 1)}/${world.totalWaves}`;
    this.level.text = `Level ${world.level.index + 1}\n${world.level.name}`;
    this.speedBtn.text = `Speed x${state.speed}`;
    this.speedBtn.active = state.speed > 1;
    this.pauseBtn.text = state.paused ? 'Resume' : 'Pause';
    this.pauseBtn.active = state.paused;
    this.muteBtn.text = state.muted ? 'Sound off' : 'Sound on';
  }

  flashLives(): void {
    this.livesFlash = 1;
  }

  update(dt: number): void {
    if (this.livesFlash <= 0) return;
    this.livesFlash = Math.max(0, this.livesFlash - dt * 2.5);
    this.lives.scale.set(1 + this.livesFlash * 0.35);
  }

  private stat(icon: SpriteKey, x: number, color: number): Text {
    const s = new Sprite(texture(icon));
    s.anchor.set(0.5);
    s.position.set(x + 14, 30);
    const t = new Text({ text: '0', style: { fontFamily: FONT, fontSize: 22, fontWeight: '800', fill: color } });
    t.anchor.set(0, 0.5);
    t.position.set(x + 34, 30);
    this.addChild(s, t);
    return t;
  }
}
