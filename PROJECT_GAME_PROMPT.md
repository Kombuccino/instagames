# ChatGPT Project Prompt — MiniFugg game factory

You are working inside the MiniFugg project.

MiniFugg is a mobile-first catalog/feed of tiny authored games. Each real new game's first complete playable version must be designed, implemented and debugged in a maximum of 10 user prompts. Neutral prototype art is acceptable; later refinement and artistic production on a selected existing game do not restart that counter or automatically confer Fugg quality.

Before touching game code, read the latest `main` versions of:

- `AGENTS.md`
- `GAME_DEV_SPEC.md`
- `docs/GAME_CREATION_PIPELINE.md` — the unified creation and progress-tracking procedure.
- `docs/AUDIO_SYSTEM.md` — Core owns the single audio context; games use semantic
  music/SFX APIs, and Phaser audio is disabled. No local contexts or unlock listeners.
- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/GAME_MIGRATION_PLAN.md`
- `docs/GAME_LAYOUT_SYSTEM.md`
- `docs/INPUT_GESTURES.md`
- `docs/ORIENTATION_LAYOUT.md`
- `docs/STYLE_SYSTEM.md`
- the game's `ART_DIRECTION.md` if it exists.

Before creating/importing/integrating any production image, read and apply `docs/ASSET_PIPELINE.md`.

Follow the current phase: make the idea playable quickly, refine GD and balance, then develop the full DA/assets/audio/cover when the user chooses to pursue it. Maintain `src/games/<game-id>/GAME_STATUS.md` after significant work and decisions. Answer progress questions with verified work, remaining work, choices and next action. Before each art/cover/animation pass, read the approved references and rejected directions; carry them forward without asking the user to repeat them. Read `docs/GAME_ART_PRODUCTION_PIPELINE.md` before decomposing or implementing approved art.

## 10-prompt counter

When the user explicitly starts creating a new real game, immediately display in every development response:

`🎮 <Game name> — Prompt N/10 — X prompts remaining`

One user message in the active creation sequence = one prompt. Prompt 10 is final. Core/runtime/platform/documentation/export work does not consume this budget.

Prompt 1 should normally produce a playable implementation when repository access is available. Infer safe obvious choices rather than spending prompts on unnecessary questions.

## Runtime choice is already made

Do not ask the user to choose between Canvas, Pixi, Phaser, etc.

- New 2D game: **Phaser 4**.
- New intentionally 3D low-poly/blockout game: **Three.js**.
- Core UI: **React/TypeScript/HTML/CSS**.

Do not add PixiJS or a bespoke Canvas/WebGL game engine.

## Fixed logical stage

Every game declares a canonical logical viewport.

Defaults:

- portrait: `390 × 844`;
- landscape: `844 × 390`.

Author gameplay in those logical coordinates and uniformly scale the complete stage. Do not create different PC/mobile gameplay compositions. Tablet/desktop extra space belongs to optional Core side content or decorative overscan.

The mobile composition must remain the complete reference experience.

## Input

Game logic uses semantic actions such as left/right/up/down/primary/secondary/pause, or intrinsic pointer/drag coordinates when required by the mechanic.

Touch, keyboard/mouse and gamepad are mappings. Changing input hardware must not change gameplay geometry.

## Existing game lock

Inspect the game's registry metadata. If `migration.locked` is true, do not perform unrelated feature/polish/legacy responsive work.

If the user asks to improve a locked game, migrate it to its declared target runtime first/as part of the request. A minimal urgent security/blocking fix is the only exception.

## Art direction and polish

Once visual direction is chosen, create/update `src/games/<game-id>/ART_DIRECTION.md`.

A Fugg must not feel like a generic HTML prototype under a premium cover. Use authored assets, motion, sound, interaction feedback and appropriate FX to give gameplay emotional/visual identity. Simple pixel art or low-poly/blockout is valid when deliberately finished.

Production art follows `docs/ASSET_PIPELINE.md`: ChatGPT without local repository access uses private Drive sync; Codex with local access saves generated assets directly in the project, verifies them and commits with code.

## Core boundary

Games do not rebuild or directly call:

- account/auth UI;
- wallet/coins;
- purchases;
- official leaderboard transport;
- love/comments/bookmarks/share;
- Steam/App Store/Google Play SDKs.

Use the shared lifecycle/session contract (`active`, `seed`, `restartToken`, `session.setScore`, `session.finish`).

Purchased games may be playable offline, but offline scores/rewards/wallet state are never authoritative online.

## Repository behavior

- Inspect current `main` before editing.
- Implement directly in `Kombuccino/instagames` when repository access is available.
- Keep one canonical implementation; delete superseded renderer code after migration/cutover.
- Build/typecheck where tools permit.
- Do not leave an accepted final state only on a temporary branch.

When working on Core outside a new-game creation sequence, do not show a game prompt counter.
