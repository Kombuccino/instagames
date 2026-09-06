---
name: phaser-minifugg
description: Use this skill for any MiniFugg task that creates, migrates, debugs or polishes Phaser 4 gameplay, animated covers, entry scenes, rendering, scaling, input, cameras, particles, tweens, physics, assets or Phaser lifecycle. It routes the agent to the official Phaser 4.2.1 vendor skills while enforcing MiniFugg architecture.
---

# Phaser 4 in MiniFugg

Use this skill whenever the task materially touches Phaser.

## 1. MiniFugg rules win

Before applying generic Phaser advice, read the latest project rules relevant to the task, especially:

- `AGENTS.md`
- `codex.md` for project history/context
- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/GAME_LAYOUT_SYSTEM.md`
- `docs/INPUT_GESTURES.md`
- `docs/ORIENTATION_LAYOUT.md`
- `docs/AUDIO_SYSTEM.md`
- `docs/GAME_CREATION_PIPELINE.md`
- the game's `ART_DIRECTION.md`, `GAME_STATUS.md` and `ASSET_MANIFEST.md` when present

For production art also read `docs/GAME_ART_PRODUCTION_PIPELINE.md` and `docs/ASSET_PIPELINE.md`.

The user's explicit instruction and current MiniFugg normative docs take precedence over the vendored Phaser skills.

## 2. Read the relevant official Phaser skill

MiniFugg pins the official Phaser agent documentation to the exact runtime version used by the app.

Vendor root:

`vendor/phaser-skills/4.2.1/`

If that directory is absent, run:

```bash
npm run vendor:phaser-skills
```

Then inspect only the subsystem skills needed for the current task.

Common routing:

- game/config/scaling: `game-setup-and-config/SKILL.md`, `scale-and-responsive/SKILL.md`
- scene lifecycle: `scenes/SKILL.md`, `events-system/SKILL.md`
- pointer/touch/keyboard/gamepad: `input-keyboard-mouse-touch/SKILL.md`
- sprites/assets: `sprites-and-images/SKILL.md`, `loading-assets/SKILL.md`
- animation: `animations/SKILL.md`, `tweens/SKILL.md`
- cameras: `cameras/SKILL.md`
- particles: `particles/SKILL.md`
- v4 filters/rendering: `filters-and-postfx/SKILL.md`, `v4-new-features/SKILL.md`
- shapes/math: `graphics-and-shapes/SKILL.md`, `geometry-and-math/SKILL.md`
- render textures: `render-textures/SKILL.md`
- text: `text-and-bitmaptext/SKILL.md`
- tilemaps: `tilemaps/SKILL.md`
- simple physics: `physics-arcade/SKILL.md`
- Matter physics: `physics-matter/SKILL.md`
- timers: `time-and-timers/SKILL.md`
- groups/batch utilities: `groups-and-containers/SKILL.md`, `actions-and-utilities/SKILL.md`
- Phaser 3 migration: `v3-to-v4-migration/SKILL.md`, `v4-new-features/SKILL.md`

See `docs/PHASER_SKILLS.md` for the complete inventory and provenance.

## 3. MiniFugg-specific Phaser constraints

Do not let generic Phaser examples override these:

### Fixed stage

- portrait default: `390 × 844`
- landscape default: `844 × 390`
- use fixed logical coordinates and uniform aspect-preserving FIT scaling
- do not reflow gameplay for desktop vs mobile
- do not use critical `vw` / `vh` world geometry

### React/Core boundary

Phaser owns game/cover/entry-scene rendering and game-specific interaction. React Core owns account, discovery, comments, shop, leaderboard, platform controls and other Core UI.

The Core close/return control is overlaid by Core. Do not draw a game-specific duplicate inside Phaser or artwork.

### Audio boundary

Core owns realtime audio globally. Read `docs/AUDIO_SYSTEM.md`.

Production Phaser hosts use:

```js
audio: { noAudio: true }
```

Do not create a local `AudioContext`, Phaser SoundManager music system, local autoplay retry listeners or an Enable Audio screen inside a game/cover/scene.

The upstream `audio-and-sound` skill is reference material only; MiniFugg's Core audio architecture overrides its normal Phaser integration advice.

### Assets

Production imagery uses the MiniFugg Drive → GitHub asset pipeline. Do not replace authored assets with generic generated rectangles because Phaser can draw them procedurally. Use procedural graphics for dynamic FX, masks, particles, debug/prototype geometry and truly procedural content.

### Cleanup

Pause inactive scenes, remove listeners/timers, destroy game instances on unmount and do not retain parallel DOM/Canvas legacy renderers after a migration becomes canonical.

## 4. Before finishing a Phaser task

Check:

- the relevant official 4.2.1 skill was consulted;
- game geometry is stable at canonical logical size;
- input works in logical coordinates;
- Core/game ownership boundaries remain intact;
- audio remains Core-owned;
- inactive/unmounted lifecycle is clean;
- build/typecheck/tests requested by project docs pass;
- obsolete legacy implementation is removed when the migration/cutover is complete.
