import { Application, Container } from 'pixi.js';
import { COLORS, DESIGN } from './config';
import type { Scene } from './Scene';

/**
 * Owns the Pixi application: canvas, resize/letterboxing and the frame loop.
 * Everything inside `root` works in fixed design coordinates.
 */
export class Game {
  readonly app = new Application();
  readonly root = new Container();
  private scene: Scene | null = null;

  async init(parent: HTMLElement): Promise<void> {
    await this.app.init({
      preference: 'webgl',
      resizeTo: parent,
      background: COLORS.background,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    parent.appendChild(this.app.canvas);
    this.app.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    this.app.stage.eventMode = 'static';
    this.app.stage.addChild(this.root);

    this.app.renderer.on('resize', () => this.layout());
    this.layout();

    this.app.ticker.add((ticker) => this.scene?.update(ticker.deltaMS / 1000));
  }

  setScene(scene: Scene): void {
    if (this.scene) {
      this.root.removeChild(this.scene.view);
      this.scene.destroy();
    }
    this.scene = scene;
    this.root.addChild(scene.view);
  }

  /** Scale the design canvas to fit the window and center it. */
  private layout(): void {
    const { width, height } = this.app.screen;
    const scale = Math.min(width / DESIGN.width, height / DESIGN.height);
    this.root.scale.set(scale);
    this.root.position.set((width - DESIGN.width * scale) / 2, (height - DESIGN.height * scale) / 2);
    this.app.stage.hitArea = this.app.screen;
  }
}
