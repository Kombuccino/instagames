---
name: phaser-minifugg
description: Use this skill for any MiniFugg task that creates, migrates, debugs or polishes Phaser 4 gameplay, legacy cover migration, entry scenes, rendering, scaling, input, cameras, particles, tweens, physics, assets or Phaser lifecycle. It routes the agent to the official Phaser 4.2.1 vendor skills while enforcing MiniFugg architecture.
---

# Phaser 4 in MiniFugg

Use this skill whenever the task materially touches Phaser.

## 1. MiniFugg rules win

Before applying generic Phaser advice, read the latest project rules relevant to the task, especially:

- `AGENTS.md`
- `codex.md` for project history/context
- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/GAME_LAYOUT_SYSTEM.md`
- `docs/MINIFUGG_ZONES.md`
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

### Portrait zones and scaling

- canonical width: `390`; art envelope: `390 × 844`; reference gameplay window: `390 × 662`
- each game declares the vertical crop priority that matches its mechanic: `top`, `center` or `bottom`; `center` is the default, Vlad is bottom-anchored
- mobile: width controls uniform scale and the useful height only changes vertical crop/reveal; it must not silently shrink the 390-wide game
- PC/big screen: the 662-unit reference window controls uniform scale, capped by available width
- the world always remains one `390 × 844` coordinate system; vertical anchoring is a viewport decision, never a second mobile/desktop layout
- EXTRA HAUT/BAS exist only outside MASTER on unusually tall mobile viewports
- do not add game-owned decorative width outside the 390-wide composition
- keep Core currency and CTA inside the 390-wide frame; keep the cover rail at the left over the portrait composition
- do not reflow gameplay for desktop vs mobile
- do not use critical `vw` / `vh` world geometry

### React/Core boundary

Phaser owns gameplay/entry-scene rendering and game-specific interaction. New covers are static raster art owned by React Core. Existing Phaser covers are legacy to replace and remove. React Core owns account, discovery, comments, shop, leaderboard, platform controls and other Core UI.

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

Production imagery follows the route selected by `ASSET_PIPELINE.md`: Codex writes locally; ChatGPT uses private Drive. New runtime art uses verified WebP lossless by default, AVIF only for validated large static art, and PNG for masters/fallbacks; no new JPG/JPEG. Do not replace authored assets with generic generated rectangles because Phaser can draw them procedurally. Use procedural graphics for dynamic FX, masks, particles, debug/prototype geometry and truly procedural content.

### DA, FX and visual validation

Before a full approved-DA integration, follow `GAME_ART_PRODUCTION_PIPELINE.md`: create the visual translation board, show composition/layers/states and FX proposals in the approved DA's own visual language, then validate one representative vertical slice before scaling production.

For each notable FX, record the intended player sensation, trigger, Phaser recipe, asset support, cost and reduced-motion behavior. Prefer bounded particles, shared textures and local/internal effects for ambient detail. Reserve camera-wide filters and dense bursts for short, high-value moments, then measure them on the target device. The board is the reference; a prose-only FX list is insufficient.

### Cleanup

Pause inactive scenes, remove listeners/timers, destroy game instances on unmount and do not retain parallel DOM/Canvas legacy renderers after a migration becomes canonical.

## 4. Before finishing a Phaser task

Check:

- the relevant official 4.2.1 skill was consulted;
- game geometry is stable at canonical logical size;
- vertical crop follows the declared game anchor on short and tall viewports without changing the 390-wide world;
- input works in logical coordinates, including when the authored canvas overflows vertically;
- Core/game ownership boundaries remain intact;
- audio remains Core-owned;
- inactive/unmounted lifecycle is clean;
- build/typecheck/tests requested by project docs pass;
- obsolete legacy implementation is removed when the migration/cutover is complete.
