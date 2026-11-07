import { Container, Sprite } from 'pixi.js';
import { texture } from '@assets/manifest';
import type { SpriteKey } from '@assets/manifest';
import type { Projectile } from './Projectile';
import type { ProjectileKind } from './towerTypes';

const SPRITE: Record<ProjectileKind, SpriteKey> = {
  arrow: 'projectileArrow',
  cannonball: 'projectileCannonball',
  shard: 'projectileShard',
};

export class ProjectileView extends Container {
  private readonly items = new Map<number, Sprite>();

  sync(projectiles: Projectile[]): void {
    const seen = new Set<number>();
    for (const p of projectiles) {
      seen.add(p.id);
      let s = this.items.get(p.id);
      if (!s) {
        s = new Sprite(texture(SPRITE[p.kind]));
        s.anchor.set(0.5);
        this.addChild(s);
        this.items.set(p.id, s);
      }
      s.position.set(p.x, p.y);
      if (p.kind !== 'cannonball') s.rotation = p.angle;
    }
    for (const [id, s] of this.items) {
      if (seen.has(id)) continue;
      s.destroy();
      this.items.delete(id);
    }
  }
}
