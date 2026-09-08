# MiniFugg — Game Engine Architecture

This document is normative. Read it before creating, migrating or structurally modifying a MiniFugg game, cover or gameplay renderer.

## 1. One platform, three rendering responsibilities

MiniFugg deliberately standardizes the runtime instead of choosing a different technology for every game.

| Responsibility | Canonical technology |
| --- | --- |
| Core UI, account, login, discovery, Info, Comments, shop, leaderboard | React + TypeScript + HTML/CSS |
| 2D gameplay | Phaser 4 |
| Static covers | React Core + raster art |
| Genuine 3D gameplay | Three.js |

Do not add PixiJS as a parallel production runtime. Do not start new raw Canvas/WebGL/WebGPU rendering systems for gameplay without an explicit Core architecture decision.

Existing DOM/CSS and custom Canvas implementations are legacy during migration. Preserve them only until their canonical replacement is complete; do not extend them with new rendering infrastructure.

## 2. The canonical logical stage is non-negotiable

A MiniFugg game is authored in a fixed logical coordinate system. Physical pixels, browser size and device resolution do not change gameplay geometry.

Default logical stages:

- portrait: **390 × 844 logical units**;
- landscape: **844 × 390 logical units**.

A game may declare another fixed logical size when the mechanic genuinely requires it, but it must still have one explicit authored coordinate system per supported orientation.

The runtime scales the stage uniformly. Mobile uses the full useful width; desktop/big screen scales from CENTRE's full useful height. Conceptually:

`scale = mobile ? availableWidth / 390 : availableHeight / 662`

The MASTER is `390 × 844`. CENTRE (`y 91→753`) is guaranteed. On mobile, only HAUT/BAS may be cropped; on a proportionally taller viewport, EXTRA HAUT/BAS may exist outside MASTER. On desktop CENTRE fills the height and HAUT/BAS are cropped; remaining space is lateral Core space.

Positions, distances, hit boxes, cameras and authored layer relationships stay in logical units.

Forbidden as a primary gameplay-layout strategy:

- placing critical objects with `vw` / `vh`;
- moving gameplay elements to different positions merely because the browser is wider;
- separate arbitrary PC and phone compositions;
- stretching the logical stage independently on X and Y;
- using device pixel ratio as gameplay geometry.

Device pixel ratio may increase render resolution/quality, but never changes logical coordinates.

## 3. Large screens use sidecars, not a different game

The mobile composition is the reference experience.

On a tablet or desktop, the canonical central game/cover remains unchanged except for uniform scale. Space that remains outside it may be used by Core for optional non-critical sidecars such as:

- leaderboard;
- comments/community;
- creator/profile information;
- session statistics;
- decorative ambience.

A sidecar must never be required to understand or play the game. Removing both sidecars must leave the canonical mobile experience complete.

Do not produce game-owned lateral overscan. Optional Core sidecars or ambience may use the remaining desktop width.

## 4. Phaser is the standard 2D runtime

New 2D gameplay uses Phaser 4 unless a documented exception is approved by Core.

Use Phaser for:

- sprites and sprite sheets;
- scene lifecycle;
- cameras;
- input;
- animations;
- particles and FX;
- timers;
- collision/physics where useful;
- texture loading and reuse;
- consistent logical scaling.

The Phaser world keeps fixed logical geometry. The host applies the MiniFugg width-first mobile / CENTRE-height desktop camera and crop contract without mutating gameplay coordinates. A universal `FIT` that shrinks the 390-wide game on short mobile viewports is legacy behavior to replace.

All new covers are static raster art displayed by Core. Existing `PhaserCoverHost` covers may run only until a validated static replacement is active; then remove their layers and runtime code.

### 4.1 Shared Phaser host pattern

LineFugg is the first canonical implementation of the shared 2D host boundary.

`src/core/runtime/PhaserGameHost.tsx` is intentionally small. In the current implementation it owns creation/destruction of `Phaser.Game`, fixed logical dimensions, legacy `Phaser.Scale.FIT`, centered output, pause/resume from `active`, and scene restart from `restartToken`. The platform blockout pass must replace only its display/camera policy with the approved width-first mobile / CENTRE-height PC contract while preserving logical geometry.

The game-specific Phaser `Scene` owns all gameplay rendering, hit-testing, pointer coordinates, animations/feedback and scene listeners in logical units. It reports outward only through the existing MiniFugg session contract (`session.setScore`, `session.finish`).

Do not move game-world UI back into DOM/CSS merely for responsive layout. Do not grow the host into a speculative engine framework: add shared capabilities only when another real migrated game demonstrates the same need.

## 5. Three.js is the standard 3D runtime

Use Three.js only when the game is intentionally 3D.

MiniFugg 3D is expected to favor:

- low-poly/blockout geometry;
- simple materials;
- few or very simple textures;
- authored lighting;
- shadows where affordable;
- particles/post FX only within mobile budgets;
- strong silhouettes and readable composition.

Three.js games use the same MiniFugg session, input, scaling/container, account and distribution boundaries as 2D games. A 3D game must not create its own platform/account/store layer.

## 6. React remains Core

Do not move login, accounts, shop, comments, leaderboard, settings or ordinary Core UI into Phaser/Three.js.

Core owns:

- identity/authentication;
- entitlements;
- coins and purchases;
- official score submission and ladders;
- discovery;
- social features;
- platform/store adapters;
- shared dialogs and panels.

The engine owns only the scene and game-specific interaction.

## 7. Input is semantic, not device-specific

Gameplay logic should consume actions such as:

- `left`
- `right`
- `up`
- `down`
- `primary`
- `secondary`
- `pause`

Core/runtime adapters map available hardware to those actions:

- touch/pointer on phones/tablets;
- keyboard/mouse on desktop;
- gamepad on desktop/store builds.

A different control device may change visible controls or affordances. It must not change the game-world geometry.

## 8. Runtime lifecycle

Audio is Core-owned across React, Phaser and Three.js: read `AUDIO_SYSTEM.md`.
Phaser hosts use `audio: { noAudio: true }`. Games request music/SFX through the
shared facade and must not create, suspend or close local audio contexts.

Every game still obeys `GameComponentProps` and the shared MiniFugg session contract.

When `active` becomes false, expensive engine work and audio must pause. On unmount, destroy engine instances and release listeners/resources. `restartToken` restarts a run. Finished runs report through `session.finish(...)`.

Do not let an inactive cover or neighboring game keep a full rendering loop active unnecessarily.

## 9. Assets and polish

A game engine is not a substitute for art direction.

A Fugg-quality game should use authored assets, motion, sound and feedback appropriate to its visual universe. Production images still use `docs/ASSET_PIPELINE.md`.

Do not recreate important raster artwork procedurally merely because Phaser/Three.js makes it possible. Conversely, use engine FX for effects that are genuinely dynamic: particles, lighting, shake, distortion, transitions, masks and similar runtime behavior.

## 10. Distribution boundary

Game code must remain distribution-agnostic.

- Web is the canonical runtime.
- Mobile store shells target Capacitor.
- Desktop/Steam shells target Electron.
- Store SDKs, billing, achievements and platform APIs live behind MiniFugg Core adapters.

Games never import Steam, Android or iOS SDKs directly.

## 11. Security and offline play

Online economy and official competitive state are server-authoritative.

A purchased game may be playable offline. Offline state is deliberately untrusted:

- local coins/save values may be modified by the owner;
- offline scores are never submitted to official ladders;
- offline runs do not grant official server rewards;
- a later online session never replaces the server wallet with a client-reported wallet.

Do not build invasive DRM around local gameplay. Protect shared economy and competition instead.

## 12. Legacy migration rule

Until an existing game is migrated, its current implementation may continue to run for reference/testing. While marked `migration.state = 'required'` or `'in-progress'`:

- do not add new gameplay features;
- do not do aesthetic polish unrelated to migration;
- do not add new CSS/Canvas rendering hacks;
- allow only migration work or a minimal urgent security/blocking regression fix.

When the new implementation becomes canonical, delete superseded production rendering code in the same cleanup. Git history is the archive.
