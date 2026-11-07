# Tower Defense

**Play:** https://timofeyarkhipov.github.io/works/tower-defense/

Browser tower defense game written in TypeScript with PixiJS 8.

- Campaign of 10 maps, 3 to 20 waves each; level select, progress and stars saved locally
- Waves start on a timer; calling a wave early pays bonus gold
- Up to 3 entries and 3 exits per map, crossing roads; new entries open during a level
- 8 enemy types: armored, flying (straight to the exit, cannons can't hit them), two bosses
- Waves generated from a difficulty curve, seeded so every level is the same each time
- 3 towers (archer, cannon, frost), 5 levels each: every upgrade adds damage and range
- Build preview with range, upgrade / sell, x1-x3 game speed, pause
- Mouse, keyboard shortcuts and touch controls
- Synthesized sound effects via Web Audio, no audio files

## Structure

```
src/
  core/       engine and base config: Pixi app and scaling, fixed-step loop,
              typed event bus, audio, storage, shared constants
  assets/     SVG sprites and the asset manifest (sprites are referenced by key only)
  features/   game logic and features
    level/      10 maps (routes), tile grid, paths, map rendering with entry/exit markers
    enemies/    enemy types, enemy logic, enemy rendering (walkers and flyers)
    waves/      wave generator and spawner
    towers/     tower types, targeting, projectiles, rendering, build preview
    world/      World - the whole simulation, no Pixi inside
    effects/    explosions, floating numbers, banners
    ui/         HUD, side panel, buttons, modal with level select
    game/       GameScene - connects world, views, UI and input; campaign progress
```

The simulation (`World` and everything it uses) does not import Pixi. Views read its state
every frame and react to its events, so game rules can be tested and balanced headlessly.

## Run

```
npm install
npm run dev     # local dev server
npm run build   # type check + build into ../../works/tower-defense
```
