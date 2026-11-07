import { loadAssets } from '@assets/manifest';
import { audio } from '@core/audio';
import { Game } from '@core/Game';
import { GameScene } from '@features/game/GameScene';
import type { GoTo } from '@features/game/GameScene';
import { loadProgress } from '@features/game/progress';

async function boot(): Promise<void> {
  const parent = document.getElementById('app')!;
  const loading = document.getElementById('loading');

  const game = new Game();
  await game.init(parent);
  await loadAssets((p) => {
    if (loading) loading.textContent = `Loading… ${Math.round(p * 100)}%`;
  });
  loading?.remove();

  window.addEventListener('pointerdown', () => audio.unlock());

  const goto: GoTo = (level, intro) => game.setScene(new GameScene(level, goto, intro));
  goto(loadProgress().unlocked - 1, 'menu');
}

boot().catch((err) => {
  console.error(err);
  const loading = document.getElementById('loading');
  if (loading) loading.textContent = 'Failed to start the game. Please reload the page.';
});
