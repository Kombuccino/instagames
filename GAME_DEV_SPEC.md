# MiniFugg Game Development Specification

Version 2.0 — canonical engine/runtime contract.

Read with `AGENTS.md`, `docs/GAME_ENGINE_ARCHITECTURE.md`, `docs/GAME_LAYOUT_SYSTEM.md`, `docs/INPUT_GESTURES.md`, `docs/ORIENTATION_LAYOUT.md` and `docs/GAME_MIGRATION_PLAN.md`. For approved gameplay-art implementation also read `docs/GAME_ART_PRODUCTION_PIPELINE.md`; for image transport/import read `docs/ASSET_PIPELINE.md`.

## 1. Product goal

MiniFugg is a mobile-first catalog of small authored games. A game should be quick to understand, fast to start and visually distinctive, while remaining portable across browser, mobile-store and desktop/store builds.

The platform should eventually support hundreds of games without turning into hundreds of incompatible technical stacks.

## 2. Standard stack

### Core

React + TypeScript + HTML/CSS owns platform UI, discovery, accounts, social, economy and store/platform adapters.

### 2D gameplay

Phaser 4 is the default and expected runtime for all new 2D games and all existing catalog migrations.

### 3D gameplay

Three.js is reserved for intentionally 3D games, typically low-poly/blockout with simple materials, lighting and restrained FX.

### Not part of the standard

Do not add PixiJS or a second 2D engine. Do not build new raw Canvas/WebGL gameplay frameworks. Existing DOM/CSS/Canvas games remain usable only as migration references until replaced.

## 3. Canonical logical viewport

Every game declares a fixed logical viewport in the registry.

Defaults:

- portrait: `390 × 844`;
- landscape: `844 × 390`.

The full game world/UI composition is authored against this coordinate system. A physical screen only changes the uniform display scale.

A phone, tablet, desktop browser, Electron window and mobile WebView must preserve the same internal positions/proportions.

Wide screens may receive optional Core sidebars or decorative overscan outside the canonical stage. They do not cause the central game to reflow.

## 4. Registry contract

Every real game declares at least:

- `id`;
- `title`;
- `status`;
- `orientation`;
- `runtime`;
- `logicalViewport`;
- `migration`;
- `component`;
- `features` / instructions as relevant.

During the current migration program, existing games use `runtime: 'legacy-dom'` and are locked until converted to `phaser-2d`.

## 5. Lifecycle contract

Game React hosts receive:

- `active`;
- `seed`;
- `restartToken`;
- `session`.

Rules:

- pause expensive rendering/audio when inactive;
- release listeners and engine resources on unmount;
- restart deterministically enough for intended gameplay when `restartToken` changes;
- report live score with `session.setScore` when useful;
- finish exactly once per run with `session.finish`.

The game must not own platform navigation, wallet or leaderboard transport.

## 6. Input contract

Prefer semantic actions:

- `left`, `right`, `up`, `down`;
- `primary`, `secondary`;
- `pause`.

Use pointer coordinates/drag only when the mechanic intrinsically requires them.

Map touch, keyboard/mouse and gamepad onto gameplay actions separately. Control presentation may vary; game-world geometry does not.

Core's visible close-box remains outside the game capture layer and always exits back to the same cover.

## 7. Art and asset contract

Every game should have an `ART_DIRECTION.md` once its visual direction is established.

Production images must use `docs/ASSET_PIPELINE.md`.

When implementing an approved DA/mockup, first perform the production decomposition in `docs/GAME_ART_PRODUCTION_PIPELINE.md`. A flattened concept image is a visual reference unless it contains only genuinely static decoration. It must not be used as a convenience background when it already contains fake grid, score, controls, paths or other live state.

Every visible function has one owner: authored asset, engine-owned dynamic layer, or Core. Mutable gameplay state is never baked beneath a second live copy.

A finished Fugg must not rely on generic CSS/engine geometry as a substitute for promised authored art. Engine primitives are appropriate for procedural effects, dynamic geometry, debug geometry and deliberately geometric styles.

Visual quality should include, as appropriate:

- authored sprite/shape language;
- production layer decomposition;
- reusable structural surfaces;
- explicit control/component state families;
- secondary animation;
- impact/interaction feedback;
- transitions;
- sound design;
- particles/lighting/shake/FX;
- coherent typography/HUD.

The objective is that gameplay carries emotional identity comparable to the cover, even when the style is intentionally simple.

## 8. Performance contract

Mobile is the performance reference.

For Phaser/Three games:

- pool frequently created objects when useful;
- reuse textures/materials;
- avoid unbounded particles/entities;
- destroy listeners/resources cleanly;
- keep texture sizes appropriate to actual display needs;
- pause inactive scenes;
- avoid expensive full-screen post FX unless measured on phones.

Do not optimize by reducing the canonical geometry differently on each platform. Reduce asset/effect cost instead.

## 9. Economy and official score boundary

Games never maintain MiniFugg wallet balances or implement store purchases.

Online official state is Core/server-owned.

Purchased games may run offline. Offline local values may be modified by the owner and are not trusted:

- no official leaderboard submission;
- no official rewards;
- no local-wallet upload into the server wallet.

Gameplay must remain fun without embedding anti-tamper complexity into each game.

## 10. Distribution contract

A game cannot import vendor/store SDKs directly.

The same game source must remain packageable for:

- web/PWA;
- static/portal builds when appropriate;
- Android/iOS through the MiniFugg mobile shell target;
- desktop/Steam through the MiniFugg desktop shell target.

Platform capabilities are Core adapters.

## 11. Existing-game migration lock

If `migration.locked` is true, normal changes to that game are prohibited until migration.

Allowed:

- direct engine/layout migration;
- asset integration that is part of that migration;
- migration-associated visual polish;
- minimal urgent security/blocking fix.

Not allowed:

- adding another legacy responsive fix;
- adding more DOM sprites to a sprite-heavy game;
- creating a new custom Canvas helper to avoid the engine migration;
- unrelated feature creep.

## 12. 10-prompt creation rule

When the user explicitly creates a new real game, creation/implementation/debug/polish must fit in 10 user prompts. Core/runtime infrastructure does not consume that budget.

Prompt 1 should normally produce a playable implementation. Make strong reasonable decisions rather than wasting the budget on avoidable clarification.

New 2D games begin on Phaser rather than creating a disposable DOM prototype that will immediately need migration.

## 13. Definition of done for a new/migrated game

A game is technically current when:

- it uses the declared canonical runtime;
- logical geometry is stable across phone/tablet/desktop;
- touch and desktop controls work;
- lifecycle cleanup is correct;
- Core close/score/restart behavior works;
- production assets follow the pipeline;
- approved art has been decomposed into clean runtime layers rather than a duplicated flattened mockup;
- representative gameplay states have been visually checked;
- old production renderer is deleted after cutover;
- build/typecheck pass.

A game is Fugg-quality only when its visual/audio presentation is also deliberately finished, not merely functional.
