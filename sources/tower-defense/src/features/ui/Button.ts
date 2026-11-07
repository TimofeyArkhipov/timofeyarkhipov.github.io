import { Container, Graphics, Text } from 'pixi.js';
import { audio } from '@core/audio';
import { COLORS, FONT } from '@core/config';

export interface ButtonOptions {
  width: number;
  height: number;
  text: string;
  onTap: () => void;
  color?: number;
  textColor?: number;
  fontSize?: number;
}

/** Rounded button with hover / pressed / disabled states. */
export class Button extends Container {
  private readonly bg = new Graphics();
  private readonly caption: Text;
  private hovered = false;
  private _enabled = true;
  private _active = false;

  constructor(private readonly opts: ButtonOptions) {
    super();
    this.caption = new Text({
      text: opts.text,
      style: { fontFamily: FONT, fontSize: opts.fontSize ?? 16, fontWeight: '700', fill: opts.textColor ?? COLORS.text, align: 'center' },
    });
    this.caption.anchor.set(0.5);
    this.caption.position.set(opts.width / 2, opts.height / 2);
    this.addChild(this.bg, this.caption);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerover', () => this.setHover(true));
    this.on('pointerout', () => this.setHover(false));
    this.on('pointertap', (e) => {
      e.stopPropagation();
      if (!this._enabled) return;
      audio.unlock();
      audio.play('click');
      opts.onTap();
    });
    this.redraw();
  }

  set text(value: string) {
    this.caption.text = value;
  }

  set enabled(value: boolean) {
    if (value === this._enabled) return;
    this._enabled = value;
    this.cursor = value ? 'pointer' : 'default';
    this.redraw();
  }

  set active(value: boolean) {
    if (value === this._active) return;
    this._active = value;
    this.redraw();
  }

  private setHover(value: boolean): void {
    this.hovered = value;
    this.redraw();
  }

  private redraw(): void {
    const { width, height } = this.opts;
    const base = this.opts.color ?? COLORS.panelLight;
    const fill = !this._enabled ? COLORS.panel : this._active ? COLORS.accent : base;
    this.bg
      .clear()
      .roundRect(0, 0, width, height, 10)
      .fill({ color: fill, alpha: this._enabled ? 1 : 0.6 })
      .stroke({ width: 2, color: this.hovered && this._enabled ? COLORS.gold : COLORS.panelBorder });
    this.caption.alpha = this._enabled ? 1 : 0.45;
    this.caption.style.fill = this._active ? COLORS.background : (this.opts.textColor ?? COLORS.text);
  }
}
