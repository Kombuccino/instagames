# MiniFugg — Codex Project Handoff

Status: **2026-09-06 — active platform/runtime transition**

This file is an onboarding and historical handoff for Codex or any other coding agent taking over `Kombuccino/instagames`.

It is intentionally detailed. MiniFugg has evolved quickly, and many choices that made sense for the first prototypes are now legacy. The project is currently moving from a collection of mostly React/DOM/CSS mini-games and custom rendering helpers toward a much more standardized platform architecture based on **React Core + Phaser 4 for 2D + Three.js for genuine 3D**.

## Authority rule

This file explains **context, intent, history and current transition state**. It is not a replacement for normative specifications.

Always read `AGENTS.md` first. If anything in this narrative conflicts with a newer normative document, the newer normative document wins.

Most important references are linked by repository path throughout this file.

---

# 1. What MiniFugg is trying to become

MiniFugg is a mobile-first platform/catalog of many very small authored games (“Fuggs”). The long-term ambition is not eight games: it is potentially **hundreds of games** sharing one platform, one discovery experience, one account/economy layer, one distribution strategy and a deliberately high visual/audio quality bar.

The user is not expected to hand-code or manually maintain these games. The workflow is intentionally AI-heavy: ChatGPT/Codex/other agents should be able to design, implement, refactor, migrate, polish and ship games with minimal manual intervention from the user.

This creates several non-negotiable product goals:

1. **Creating a new game must remain extremely fast and simple.** A real new game is expected to be created and finished in at most 10 user prompts. See `AGENTS.md`, `GAME_DEV_SPEC.md` and `PROJECT_GAME_PROMPT.md`.
2. **The platform must not become an unmaintainable zoo of technologies.** We deliberately standardize runtimes and shared boundaries.
3. **A game must look and feel essentially the same on phone, tablet, browser desktop and future packaged builds.** Different controls are expected; different game geometry is not.
4. **The visual bar must be much higher than a generic “HTML5 mini-game”.** The user accepts simple mechanics, pixel art, paper art, low-poly/blockout, retro styles, etc., but wants authored character, emotion, polish, sound, motion and a strong bridge between cover art and gameplay.
5. **MiniFugg must remain portable.** The same canonical web implementation should be distributable through the browser, Android/iOS stores and desktop/Steam without rewriting each game.
6. **Shared economy and official competition must be secure enough to matter.** Client-side/offline cheating is acceptable when it only affects an owned local game; it must never corrupt online coins, entitlements, rewards or ladders.
7. **The architecture must still be understandable by future AI agents.** Repetition, parallel engines, duplicated V2/V3 files and clever one-off hacks are actively discouraged.

For the platform/economy contract, read `docs/PLATFORM_ECONOMY.md`.
For distribution, read `docs/PLATFORM_EXPORTS.md`.
For engine rules, read `docs/GAME_ENGINE_ARCHITECTURE.md`.

---

# 2. Where the project came from

MiniFugg began as a fast web prototype: React + TypeScript + CSS, with each tiny game implemented mostly as normal DOM elements and CSS transforms/animations.

That approach was useful early because it allowed very fast iteration on:

- grids;
- text-heavy mechanics;
- buttons;
- document interfaces;
- simple drag/tap interactions;
- platform UI;
- rapid game prototyping.

The Core also evolved quickly around the games: discovery/feed navigation, cover screens, Info/Comments, economy UI, login/home scenes, game-over shell, leaderboards, music labs and asset tooling.

Over time, this produced several recurring problems.

## 2.1 Geometry drift between devices

Games such as HARI and TetraMindFck exposed the limits of layouts based on viewport-dependent CSS (`vw`, `vh`, screen-specific offsets, media-query reflow, DOM measurement, etc.).

A phone, desktop or tablet could display the same mechanic with slightly different proportions, object positions or available space. This is unacceptable for MiniFugg.

The user’s expectation is now explicit:

> If screenshots from phone, tablet and desktop are normalized back to the same logical game size, the gameplay composition should almost perfectly overlap.

The fix is not “more responsive CSS”. The fix is a fixed authored logical stage that is uniformly scaled.

Read:

- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/GAME_LAYOUT_SYSTEM.md`
- `docs/ORIENTATION_LAYOUT.md`

## 2.2 DOM/CSS became awkward for sprite-heavy/action games

Games such as Les Brochettes de Vlad, Train Fighter, Shoot the Shooter and runner/action concepts exposed other issues:

- many DOM nodes/sprites;
- frequent transforms;
- hit-testing mismatches;
- drag bounds that behaved badly near edges;
- performance/freezes as element counts increased;
- complex perspective/deformation needs;
- increasing amounts of custom CSS and special-case rendering code.

The platform also started creating custom Canvas helpers, for example the perspective texture renderer used by the metro entry scene. These helpers were useful prototypes, but continuing that direction would effectively make MiniFugg maintain its own half-game-engine.

That is not the desired future.

## 2.3 Covers became more sophisticated than the runtime beneath them

TetraMindFck’s layered/parallax cover work proved that covers can be unusually rich and emotionally strong. It also exposed a mismatch: a premium cover can easily promise more than a simple DOM/CSS gameplay scene delivers.

The user’s quality expectation is now:

> A cover must not feel like a beautiful advertisement for a disappointing little web prototype underneath.

Gameplay art, audio, FX and cover presentation must be designed as one universe.

Read:

- `docs/WELCOME_ILLUSTRATIONS.md`
- `docs/PARALLAX_LAB.md`
- `docs/GAME_ART_PRODUCTION_PIPELINE.md`
- `docs/STYLE_SYSTEM.md`

---

# 3. The architecture decision that replaced the earlier “anything web goes” approach

The runtime decision is now fixed unless Core explicitly reopens it.

| Responsibility | Canonical technology |
| --- | --- |
| Core/platform UI | React + TypeScript + HTML/CSS |
| 2D gameplay | Phaser 4 |
| Advanced animated covers | Phaser 4 |
| Genuine 3D gameplay | Three.js |
| Build tooling | Vite |

Current engine dependencies are declared in `package.json`.

## 3.1 Why Phaser rather than continuing raw DOM/Canvas or adding PixiJS

PixiJS is a very capable renderer, but MiniFugg would then need to build and maintain more of its own game framework: scene lifecycle, input conventions, camera helpers, collisions/physics choices, asset lifecycle, etc.

Phaser already provides enough of this structure to reduce custom plumbing while remaining flexible enough for the visual style of MiniFugg games.

This matters because:

- many games will be created by AI;
- there may eventually be hundreds of them;
- predictable APIs reduce implementation divergence;
- maintaining a proprietary engine is not the product goal.

Do **not** add PixiJS as another production runtime.

Do **not** start new custom raw Canvas/WebGL/WebGPU gameplay systems unless the architecture decision is explicitly reopened.

Existing custom Canvas code is migration source/reference only and should disappear when its canonical replacement is validated.

Read `docs/GAME_ENGINE_ARCHITECTURE.md`.

## 3.2 Why Three.js for 3D

The expected MiniFugg 3D aesthetic is usually not AAA textured realism. The user expects things closer to:

- low-poly;
- blockout;
- Minecraft/Roblox-like simplicity;
- simple materials;
- strong silhouettes;
- authored lighting;
- shadows/particles/post-FX where affordable;
- few or very simple textures.

Three.js is therefore the standard 3D runtime. A larger full 3D engine is not needed by default.

---

# 4. The most important technical invariant: canonical logical geometry

This is one of the most important decisions in the entire project.

Every game is authored in a fixed logical coordinate system.

Default stages:

- portrait: **390 × 844 logical units**;
- landscape: **844 × 390 logical units**.

The browser/device does not recompute internal geometry. The complete authored game stage is scaled uniformly to fit the available host.

Conceptually:

`scale = min(availableWidth / logicalWidth, availableHeight / logicalHeight)`

Phaser uses the equivalent fixed-size + `FIT` + centered approach.

## 4.1 What is allowed to change by device

- physical rendered pixel count / DPR;
- overall scale;
- control mapping (touch vs mouse/keyboard vs gamepad);
- optional Core content outside the central stage on large screens;
- decorative overscan outside gameplay-critical geometry.

## 4.2 What must not change by device

- grid position;
- player position;
- distances between gameplay objects;
- hit-box geometry;
- board proportions;
- authored HUD positions inside the game;
- camera framing of the canonical game world;
- relative layer positions.

Avoid critical `vw`/`vh` positioning. Do not create a “desktop version” of the gameplay layout merely because more width exists.

## 4.3 Large screens

The phone composition is the complete reference experience.

On a wide monitor or tablet, unused left/right space may host **optional Core sidecars**, for example:

- leaderboard;
- comments/community;
- creator/profile information;
- session statistics;
- decorative ambience.

Removing these sidecars must still leave a complete mobile experience.

Read `docs/GAME_ENGINE_ARCHITECTURE.md` and `docs/GAME_LAYOUT_SYSTEM.md`.

---

# 5. Input portability

Gameplay logic should not be written as “press Space” or “touch this button” unless the mechanic intrinsically requires raw pointer coordinates.

Prefer semantic actions such as:

- left;
- right;
- up;
- down;
- primary;
- secondary;
- pause.

Then map hardware separately:

- touch/pointer on mobile/tablet;
- keyboard/mouse on desktop;
- gamepad on desktop/store builds.

Changing input hardware is allowed to change visible control affordances, but never game-world geometry.

Read `docs/INPUT_GESTURES.md`.

---

# 6. Core and game responsibilities must stay separate

MiniFugg Core is not just another game scene.

Core remains React/HTML/CSS and owns platform concerns such as:

- login/account;
- discovery/navigation;
- game covers;
- Info/Comments/social actions;
- coin balance and purchases;
- entitlement checks;
- official score submission/ladders;
- leaderboards;
- platform/store adapters;
- shared dialogs/panels;
- game-over/replay shell;
- the gameplay exit/close-box control.

Games own only their gameplay world and game-specific HUD/interaction.

## 6.1 Important: the top-left close/return control belongs to Core

A recurring visual mistake has been to include the MiniFugg close/return control inside game mockups/DA.

Do **not** draw or implement that control inside a game.

Core superimposes it over gameplay. A game must only preserve the appropriate upper-left clearance/safe zone so essential information is not hidden beneath it.

The final metaphor is “close the box / return to the same cover”, not a generic game-local pause button.

Read `docs/GAMEPLAY_SHELL.md`.

---

# 7. Current catalog and migration state

The authoritative runtime/migration ledger is `src/core/gameRegistry.tsx` plus `docs/GAME_MIGRATION_PLAN.md`.

As of this handoff:

| Game | Runtime state | Migration note |
| --- | --- | --- |
| **LineFugg** | **Phaser 2D — current** | first canonical Phaser migration pilot; gameplay unlocked; cover still A METTRE A JOUR |
| Les Brochettes de Vlad | legacy DOM/CSS | locked until Phaser migration; sprite/performance + visual quality are major reasons |
| Train Fighter | legacy DOM/CSS | locked; strong candidate for sprite-heavy Phaser migration |
| TetraMindFck | legacy DOM/CSS | locked; geometry drift + legacy premium layered cover |
| Shoot the Shooter | legacy DOM/CSS | locked; input/hit-testing consistency issues |
| DebthOfLife | legacy DOM/CSS | locked; runner architecture naturally fits Phaser |
| CrazyPapers | legacy DOM/CSS | locked; document-heavy mechanic but target runtime remains Phaser for catalog consistency |
| HARI les dents pourries | legacy DOM/CSS | locked; beta-quality prototype, intentionally lower migration priority |

## 7.1 Freeze rule

When `migration.locked === true`:

- do not add normal gameplay features;
- do not add visual polish on top of the legacy renderer;
- do not add more responsive CSS hacks;
- do not add new custom Canvas systems;
- migrate first, except for a minimal urgent blocking/security regression fix.

Once a migrated renderer is canonical, delete the superseded runtime code. Git history is the archive; do not keep production `old`, `v2`, `backup`, etc.

Read `docs/GAME_MIGRATION_PLAN.md` and `src/games/README.md`.

---

# 8. LineFugg is the first canonical migration reference

LineFugg was deliberately chosen as the first Phaser pilot because its grid makes geometry drift immediately visible.

It now establishes the reusable pattern:

- React/Core mounts `src/core/runtime/PhaserGameHost.tsx`;
- Phaser owns the fixed `390×844` game scene;
- `Phaser.Scale.FIT` + centering keeps the geometry stable;
- the Phaser scene owns rendering, hit-testing, pointer coordinates and feedback;
- Core still owns session lifecycle and platform shell;
- `active` pauses/resumes;
- `restartToken` restarts;
- unmount destroys Phaser cleanly.

Do not turn `PhaserGameHost` into a speculative mega-framework. Add shared features only when another real migration proves they are common.

## 8.1 Current LineFugg gameplay/art state

LineFugg has now also moved beyond the old anonymous prototype visually.

Its approved gameplay art direction is documented in:

- `src/games/linefugg/ART_DIRECTION.md`
- `src/games/linefugg/ASSET_MANIFEST.md`

The current universe is an ornate celestial calculation instrument / brass astrolabe / observatory console rather than generic neon sci-fi.

A recent gameplay rule is important: after placing the third line, the run does **not** resolve automatically. The player can still adjust/undo/redraw, then explicitly presses Validate to submit.

The cover remains **A METTRE A JOUR** and should be developed as a later cover-quality pass based on the finished gameplay universe.

LineFugg is therefore the current reference for two different platform lessons:

1. fixed-stage Phaser migration;
2. turning a mechanically complete prototype into a visually authored Fugg through `ART_DIRECTION.md` + `ASSET_MANIFEST.md` + modular asset production.

Read `docs/GAME_ART_PRODUCTION_PIPELINE.md` before copying this production pattern to another game.

---

# 9. Game-art production philosophy

A beautiful approved mockup is **not** automatically a runtime background.

This lesson became important during the LineFugg art pass.

The correct production model is to decompose a DA/master into independently owned layers:

- permanent environment;
- animatable decoration;
- structural gameplay surfaces;
- stateful controls/components;
- engine-owned dynamic gameplay/FX;
- Core-owned platform UI.

Never bake mutable gameplay state into a static background merely because a concept image looks correct in one screenshot.

Examples of things that normally remain dynamic:

- score;
- board numbers/operators;
- selection state;
- paths;
- timers;
- validation state;
- localized gameplay copy.

Every visible element should have one owner: authored raster, engine, or Core.

Read `docs/GAME_ART_PRODUCTION_PIPELINE.md`.

---

# 10. Visual identity: avoid the generic “ChatGPT game” look

The user strongly dislikes visual convergence toward generic AI/default UI aesthetics.

Avoid defaulting to:

- dark navy + purple/cyan neon;
- glowing blobs;
- glassmorphism everywhere;
- generic futuristic HUDs;
- soft interchangeable rounded cards;
- tiny pale text;
- a polished cover over an emotionally empty gameplay scene.

Every game should have an authored universe even when the mechanic itself is abstract.

For a concept such as LineFugg, the DA phase should be allowed to invent not just a color palette but:

- an actual universe;
- tone/emotion;
- material language;
- historical/cultural references;
- motion language;
- sound language;
- potentially a better game name.

The existing visual-style framework lives in `docs/STYLE_SYSTEM.md` and `docs/style-kits/`.

Current style families include things such as Pixel Dungeon, Paper Cut, Ink Pulp, Toybox, Sports Broadcast and Editorial Grid.

The intended future vocabulary is broader than these starter kits. Agents are encouraged to think in richer combinations when appropriate, for example:

- historical periods (1920s, 1950s, 1970s, 1980s, 1990s, early-2000s);
- cultural/regional print/packaging/arcade influences;
- antique scientific instruments;
- pulp publishing;
- retro microcomputing;
- handmade/folk materials;
- industrial equipment;
- vintage toys;
- low-poly dioramas;
- foreign/regional edition aesthetics.

Use references deliberately, not as shallow stereotypes.

MiniFugg Core remains visually coherent, but individual games should not all look like one house skin.

Read `docs/STYLE_SYSTEM.md` and each game’s `ART_DIRECTION.md`.

---

# 11. Image asset pipeline is mandatory

Production images do not get pasted into GitHub manually.

Canonical flow:

`private Google Drive Fugg hierarchy → GitHub Actions sync → public/assets/imported/... → /assets/imported/...`

Read `docs/ASSET_PIPELINE.md` before creating/importing/integrating any MiniFugg production image.

Important rules:

- Drive folder stays private;
- no public Drive runtime links;
- no FTP fallback;
- no manual binary GitHub uploads when the pipeline is available;
- no base64 chunking;
- preserve original bytes/resolution unless optimization is explicitly requested;
- verify the mirrored GitHub file exists before changing code to its `/assets/imported/...` path;
- approved gameplay mockups must be decomposed using `docs/GAME_ART_PRODUCTION_PIPELINE.md` before runtime use.

Per-game production assets should live below `Fugg/<game-id>/...` and mirror under `public/assets/imported/<game-id>/...`.

---

# 12. Covers are a separate migration track from gameplay

Gameplay migration and cover migration are intentionally independent.

A game can be technically `phaser-2d` and unlocked while its cover remains `A METTRE A JOUR`. LineFugg is currently in exactly this state.

All current covers are still considered transitional until `migration.cover` is `current`.

Read `docs/WELCOME_ILLUSTRATIONS.md`.

## 12.1 TetraMindFck is the premium cover migration reference

TetraMindFck contains the most advanced legacy layered/parallax cover work and is considered valuable reference material.

Do **not** throw this work away merely because the renderer is legacy.

The old system contains useful authored information such as:

- layer selection;
- positions/scales/rotations;
- opacity;
- parallax amplitudes;
- motion intent;
- unlock scores;
- existing raster paths.

However, the old `FuggWelcome` / Parallax Lab / CSS-layer renderer is **not** the target architecture.

Read `docs/PARALLAX_LAB.md`.

The intended future is:

- static cover → normal raster rendered by React Core;
- advanced animated cover → shared Phaser cover runtime.

The old Tetra layered cover should be translated into the future runtime rather than expanded with more legacy behavior.

## 12.2 “Open the game box” transition

The desired discovery→game transition should feel like opening a physical game box/package rather than a generic fade or page navigation.

Conceptually:

1. player sees the closed cover;
2. Play is activated;
3. the cover/box reacts as an object;
4. layers/front/lid separate, slide, tilt or otherwise “open” according to the shared MiniFugg transition grammar;
5. gameplay is revealed inside/behind it;
6. the gameplay stage becomes the active view;
7. leaving gameplay reverses the metaphor and returns to the same cover.

This should become shared Core/cover runtime behavior, not a one-off hack per game.

Covers should be developed from the same approved game universe so the cover-to-game quality transition feels coherent.

---

# 13. Recommended creation pipeline for a Fugg

The project is converging on the following practical pipeline.

## Phase 0 — mechanic / prototype

- understand the core loop;
- pick orientation;
- get a playable implementation quickly;
- for a real new game, stay within the 10-prompt rule.

## Phase 1 — technical/canonical foundation

- ensure fixed logical viewport;
- ensure stable multi-device geometry;
- ensure touch/desktop input;
- use canonical runtime (Phaser 2D or Three.js 3D);
- preserve Core lifecycle/session boundaries.

## Phase 2 — art direction exploration

When a game has a mechanic but no universe, do not merely reskin it.

Propose several distinct universes that include:

- tone/emotion;
- material language;
- palette;
- historical/cultural references when useful;
- motion/FX language;
- sound relationship;
- potential naming direction.

Once approved, write/update `src/games/<game-id>/ART_DIRECTION.md`.

## Phase 3 — production decomposition

Create/update `src/games/<game-id>/ASSET_MANIFEST.md`.

Use `docs/GAME_ART_PRODUCTION_PIPELINE.md` to decide what is:

- authored raster;
- separate animatable sprite/layer;
- reusable structural UI surface;
- state sprite;
- Phaser/Three dynamic content;
- Core UI.

## Phase 4 — parallel production after DA approval

Once the DA is stable, three workstreams can begin in parallel:

### A. Gameplay visuals

- produce real assets;
- integrate in Phaser/Three;
- add motion/FX/feedback;
- verify representative states.

### B. Covers

- explore static/premium variants;
- prepare layered assets;
- design opening-box behavior;
- do not final-freeze a cover so early that gameplay later diverges dramatically.

### C. Audio

- music loops;
- SFX;
- ambience;
- UI/gameplay event mapping;
- revise earlier music if the final DA makes it inappropriate.

## Phase 5 — final integration

- gameplay art;
- animation/FX;
- sound;
- music;
- cover;
- cover→game transition;
- Core shell.

## Phase 6 — QA

- normalized geometry across small phone / long phone / tablet / desktop;
- touch + mouse/keyboard + gamepad where relevant;
- performance;
- audio lifecycle;
- no quality cliff from cover to gameplay;
- build/typecheck;
- delete superseded production code/assets.

---

# 14. Audio is currently the next major shared infrastructure problem

At the time this handoff was created, the repository does **not** yet contain a canonical `docs/AUDIO_SYSTEM.md` or a global `AudioManager` implementation.

This is an active transition topic and likely the next Core infrastructure task.

## 14.1 Why audio needs centralization

Current code has evolved through multiple systems, including:

- `src/audio/sfxEngine.ts`;
- `src/audio/symbolicMusicPlayer.ts`;
- `src/music/reactiveGameMusic.ts`;
- game-specific integrations;
- Phaser instances that can otherwise create their own audio layer.

This has produced recurring browser/iOS issues:

- music not restarting after refresh / Ctrl+F5;
- autoplay restrictions;
- suspended WebAudio contexts;
- possible clicks/grit/grésillement during starts/stops;
- lifecycle differences between games/screens;
- risk of multiple independent AudioContexts/masters.

## 14.2 Desired target audio architecture

MiniFugg should have one **Core-owned global audio manager** for the application session.

Target conceptual graph:

`AudioContext → MASTER → MUSIC / SFX / UI / AMBIENCE buses`

Important intended rules:

- one shared Web Audio context instead of a context per game/system;
- Core owns unlock/resume/suspend lifecycle;
- games request semantic playback and do not manipulate their own AudioContext;
- Phaser audio should not become a parallel independent system when Core audio is canonical;
- small fades/crossfades should avoid abrupt click-producing stops;
- requested playback state must be distinguishable from actual browser-permitted playback state;
- first valid user gesture should unlock/resume audio when autoplay is blocked;
- do not promise impossible autoplay after hard refresh on iOS/Safari/Chrome mobile;
- background/foreground and interrupted/suspended contexts must recover gracefully.

Once a real `docs/AUDIO_SYSTEM.md` is added, treat that document as the authority and update this handoff if needed.

`docs/MUSIC_LAB.md` documents the music authoring/lab side of the current system.

---

# 15. Home / entry scene is also in transition

MiniFugg has a stylized entry/home scene before discovery, currently based around a low-poly contemporary metro/train moment, first-person hand/phone framing, Fuggy and a seamless approach into the live MiniFugg phone screen.

Read:

- `docs/PLATFORM_ENTRY_SCENES.md`
- `docs/PLATFORM_ART_DIRECTION.md`
- `docs/FUGGY_MASCOT.md`
- `docs/BRAND_ASSETS.md`

Current implementation still contains custom Canvas-era rendering for perspective movement (for example the perspective texture helper used by the metro scene). This is legacy infrastructure that should not be expanded into another engine.

The likely target is:

- visual/animated home scene → Phaser;
- login/account/form UI → React Core;
- audio → future Core AudioManager;
- phone/discovery UI → live Core UI, not a baked fake screenshot.

The audio manager should ideally be stabilized before doing the full Phaser home rewrite so the new home starts on the correct shared audio architecture.

---

# 16. Platform UI and navigation are Core, not game art

MiniFugg Core itself has already gone through a major navigation/UI redesign around full-screen game covers and cover-centric discovery.

Do not casually redesign the Core while working on a game.

Key references:

- `docs/PLATFORM_VISUAL_VALIDATION.md`
- `docs/PLATFORM_UI_BASELINE.md`
- `docs/PLATFORM_UI_SYSTEM.md`
- `docs/DISCOVERY_NAVIGATION.md`
- `docs/GAMEPLAY_SHELL.md`
- `docs/PLATFORM_ART_DIRECTION.md`

Canonical platform visual references may also be documented in the graphic archive; see `docs/GRAPHIC_ARCHIVE.md`.

Game art should harmonize with Core where they meet, but should retain its own universe inside the gameplay stage.

---

# 17. Fuggy mascot and brand references

Fuggy is the MiniFugg mascot.

The user has approved a canonical mascot direction. A previously generated bad 3D Fuggy attempt was explicitly rejected and must not be treated as reference.

For any work involving the mascot, use the actual canonical references and read:

- `docs/FUGGY_MASCOT.md`
- `docs/BRAND_ASSETS.md`

Do not invent a new mascot interpretation simply because a scene is being redesigned.

---

# 18. Economy, online authority and offline owned games

Read `docs/PLATFORM_ECONOMY.md` for the authoritative product contract.

Current important values/concepts:

- Free account: **40 renewable coins/day**.
- Fugg play: **2 coins**.
- Bêta play: **1 coin**.
- Caca / `trash`: **free**.
- Lifetime: **999 renewable coins/day**, not infinity.
- Durable purchased/gifted coins do not expire.
- Renewable coins are spent before durable coins.

The platform is not intended to be a generic pay-to-win mobile economy. Coins are arcade play tokens.

## 18.1 Server authority

For online/official play, the server is authoritative for:

- wallet;
- daily refresh;
- purchases;
- entitlements;
- official rewards;
- official ladder eligibility.

Never trust a client-reported wallet as authoritative.

## 18.2 Owned game offline play

If the user owns a game, that game may be playable offline.

The security model is intentionally pragmatic:

- local save/coins can be tampered with;
- that is acceptable if it only affects the owner’s local experience;
- offline scores never enter official ladders;
- offline runs never grant official server rewards;
- reconnecting never overwrites server wallet state with local wallet state;
- a signed cached entitlement can prove prior ownership without pretending to be unbreakable DRM.

Do not waste architecture complexity trying to prevent a determined owner from cheating only themselves offline.

Protect shared economy and competition instead.

---

# 19. Distribution targets

Read `docs/PLATFORM_EXPORTS.md`.

The **browser build is canonical**.

Target distribution strategy:

## Browser / PWA

Normal Vite web build.

## Android / iOS

Target wrapper: **Capacitor**.

Use the same Core/game codebase. Native plugins only where actually required.

## Desktop / Steam

Target wrapper: **Electron**.

Electron is intentionally acceptable despite its package size because shipping a controlled Chromium runtime helps keep rendering/web API behavior consistent across desktop machines.

## Store integration boundary

Games must not import:

- Steamworks;
- App Store billing;
- Google Play billing;
- Electron APIs;
- Capacitor APIs.

Core/platform adapters own these integrations.

The same game should remain runnable in the canonical browser environment without store services.

---

# 20. Security principles

The client is attacker-controlled for anything economically/competitively meaningful.

Do not put secrets/private keys/store credentials in browser/game code or the repository.

Validate authoritative actions server-side.

Individual games should not directly call the database or platform billing APIs.

Asset sync security is separately documented in `docs/ASSET_PIPELINE.md`.

Backend/deployment-specific information lives in files such as:

- `docs/API_DEPLOYMENT.md`
- the `api/` project tree.

Do not invent a new security boundary inside each game.

---

# 21. Scaling to hundreds of games

The current catalog is small, but architectural decisions must not assume it will remain small.

Important scalability direction:

- move game implementations toward per-game lazy loading;
- avoid eagerly shipping every game in the initial Core JS bundle;
- lazy-load large game/cover assets;
- share/cache Phaser and Three.js rather than bundling an engine per game;
- do not keep heavy inactive cover/game render loops alive;
- keep platform wrappers/SDKs out of normal web chunks where possible;
- reuse a small number of proven runtime boundaries rather than create per-game mini-frameworks.

`src/core/gameRegistry.tsx` currently remains the authoritative catalog and still has migration history from the small-catalog phase. Future work should improve loading architecture without breaking the registry’s product metadata role.

Read `docs/PLATFORM_EXPORTS.md` and `docs/GAME_MIGRATION_PLAN.md`.

---

# 22. New-game 10-prompt rule

A real new game is expected to be built and finished in a maximum of **10 user prompts**.

When a new game creation sequence starts, responses should show:

`🎮 <Game name> — Prompt N/10 — X prompts remaining`

Do **not** use this countdown for:

- MiniFugg Core work;
- architecture work;
- migration infrastructure;
- documentation;
- export/distribution work;
- refactoring an already-created existing game.

The 10-prompt constraint exists to preserve the magical simplicity of game creation. Do not burn prompts asking questions that can be safely inferred.

Read `AGENTS.md`, `GAME_DEV_SPEC.md`, and `PROJECT_GAME_PROMPT.md`.

---

# 23. Repository discipline

`main` is the deployable source of truth.

Important habits:

- inspect current `main` before editing;
- do not rely on stale conversation assumptions when the repo can answer the question;
- keep one canonical implementation;
- delete superseded production code after validated cutover;
- do not create `V2`, `V3`, `final-final`, backup files as normal workflow;
- use Git history as archive;
- keep user-approved visual references unchanged unless explicitly asked;
- run `npm run typecheck` and/or `npm run build` after meaningful frontend changes;
- do not leave accepted work only on an abandoned branch.

The standard frontend build is defined in `package.json` and CI.

---

# 24. Useful repository map

This is not exhaustive, but it is a practical orientation map.

## Root

- `AGENTS.md` — authoritative agent rules; read first.
- `codex.md` — this historical/context handoff.
- `GAME_DEV_SPEC.md` — game creation/development contract.
- `PROJECT_GAME_PROMPT.md` — reusable project-level game-agent prompt.
- `README.md` — repository/development basics.
- `package.json` — runtime/build dependencies and scripts.

## Core/runtime

- `src/core/gameRegistry.tsx` — game catalog metadata, runtime/migration/cover state.
- `src/core/types.ts` — shared contracts.
- `src/core/runtime/PhaserGameHost.tsx` — canonical minimal React↔Phaser host established by LineFugg.
- `src/core/` — discovery, gameplay shell, platform UI, legacy cover systems and entry scene.

## Games

- `src/games/README.md` — migration lock guidance.
- `src/games/<game-id>/` — game implementation.
- `src/games/<game-id>/ART_DIRECTION.md` — canonical per-game visual direction when approved.
- `src/games/<game-id>/ASSET_MANIFEST.md` — production art decomposition/inventory when present.

## Platform docs

- `docs/PLATFORM_ART_DIRECTION.md`
- `docs/PLATFORM_UI_BASELINE.md`
- `docs/PLATFORM_VISUAL_VALIDATION.md`
- `docs/PLATFORM_UI_SYSTEM.md`
- `docs/DISCOVERY_NAVIGATION.md`
- `docs/GAMEPLAY_SHELL.md`
- `docs/PLATFORM_ENTRY_SCENES.md`
- `docs/PLATFORM_ECONOMY.md`
- `docs/PLATFORM_EXPORTS.md`
- `docs/META_PROGRESSION.md`
- `docs/GAME_CURATION.md`

## Game/runtime docs

- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/GAME_MIGRATION_PLAN.md`
- `docs/GAME_LAYOUT_SYSTEM.md`
- `docs/ORIENTATION_LAYOUT.md`
- `docs/INPUT_GESTURES.md`
- `docs/STYLE_SYSTEM.md`
- `docs/GAME_ART_PRODUCTION_PIPELINE.md`

## Covers / visual assets

- `docs/WELCOME_ILLUSTRATIONS.md`
- `docs/PARALLAX_LAB.md` — legacy/migration reference only.
- `docs/ASSET_PIPELINE.md`
- `docs/GRAPHIC_ARCHIVE.md`
- `docs/BRAND_ASSETS.md`
- `docs/FUGGY_MASCOT.md`

## Audio/music

- `docs/MUSIC_LAB.md`
- `src/audio/`
- `src/music/`
- future canonical `docs/AUDIO_SYSTEM.md` once the global Core audio manager lands.

## Backend/deployment

- `api/`
- `docs/API_DEPLOYMENT.md`
- `Dockerfile`
- `.github/workflows/`

---

# 25. Suggested reading order when taking over a task

## Any task

1. `AGENTS.md`
2. this `codex.md`
3. inspect latest `main`
4. read the most relevant normative docs below.

## Existing game work

1. `docs/GAME_ENGINE_ARCHITECTURE.md`
2. `docs/GAME_MIGRATION_PLAN.md`
3. `docs/GAME_LAYOUT_SYSTEM.md`
4. `docs/INPUT_GESTURES.md`
5. `docs/ORIENTATION_LAYOUT.md`
6. game `ART_DIRECTION.md` if present
7. game `ASSET_MANIFEST.md` if present
8. `docs/GAME_ART_PRODUCTION_PIPELINE.md` for approved DA implementation
9. `docs/ASSET_PIPELINE.md` for any image asset

Check `src/core/gameRegistry.tsx` before modifying the game: if it is migration-locked, migrate instead of extending legacy code.

## Cover work

1. `docs/WELCOME_ILLUSTRATIONS.md`
2. `docs/GAME_ENGINE_ARCHITECTURE.md`
3. `docs/PARALLAX_LAB.md` when translating legacy Tetra data
4. game `ART_DIRECTION.md`
5. `docs/ASSET_PIPELINE.md`

## Core UI/navigation

1. `docs/PLATFORM_VISUAL_VALIDATION.md`
2. `docs/PLATFORM_UI_BASELINE.md`
3. `docs/PLATFORM_UI_SYSTEM.md`
4. `docs/DISCOVERY_NAVIGATION.md`
5. `docs/GAMEPLAY_SHELL.md`
6. `docs/PLATFORM_ART_DIRECTION.md`

## Economy/distribution/security

1. `docs/PLATFORM_ECONOMY.md`
2. `docs/PLATFORM_EXPORTS.md`
3. `docs/API_DEPLOYMENT.md`
4. relevant backend code under `api/`

---

# 26. Immediate transition priorities at the time of this handoff

These are current directional priorities, not immutable backlog tickets. Re-check the repo before acting because parallel project conversations may already have completed some of them.

## Priority A — global Core AudioManager

Current audio architecture is fragmented and has browser/iOS lifecycle issues. The next shared infrastructure target is one Core-owned audio system with reliable first-gesture unlock/resume behavior, buses and clean fades/crossfades.

When implemented, create/update `docs/AUDIO_SYSTEM.md` and make all games consume it rather than creating local AudioContexts.

## Priority B — Home/entry visual migration to Phaser

After audio is stabilized, migrate the animated home/metro entry visuals away from custom Canvas-era helpers toward the canonical Phaser visual runtime, while leaving login/account UI in React Core.

## Priority C — shared premium cover runtime

Build the shared Phaser cover runtime and translate TetraMindFck’s valuable layered cover work into it.

Implement the shared “open the game box” cover→game transition as platform behavior rather than a game-specific trick.

## Priority D — continue game migrations

LineFugg has proven the pattern. Next recommended migrations from the active ledger are:

1. Les Brochettes de Vlad;
2. Train Fighter;
3. TetraMindFck;
4. Shoot the Shooter;
5. DebthOfLife;
6. CrazyPapers;
7. HARI.

Re-check `docs/GAME_MIGRATION_PLAN.md` before acting because this order may evolve.

## Priority E — lazy loading / catalog scale

As the number and visual weight of games grows, move game code and assets toward lazy loading/prefetching so the initial MiniFugg load does not contain the entire catalog.

---

# 27. Things a new agent should specifically NOT do

Do not:

- reintroduce per-device game layouts;
- “fix responsiveness” by scattering more `vw`/`vh` and media-query offsets inside gameplay;
- create a separate PC gameplay composition;
- add PixiJS because it seems convenient for one game;
- create another custom Canvas renderer for gameplay/covers;
- move Core login/comments/shop into Phaser;
- draw the Core close-box button inside game art;
- extend a migration-locked DOM/CSS game instead of migrating it;
- keep old and new production renderers alive after cutover;
- flatten dynamic gameplay/UI into a pretty background image;
- bypass the Drive→GitHub asset pipeline;
- trust client-side wallet or offline score for official state;
- import Steam/App Store/Google Play SDKs directly from a game;
- promise autoplay behavior browsers explicitly refuse;
- allow premium covers to outclass gameplay so badly that entering the game feels like a downgrade;
- let every AI-generated game fall back to the same neon/glassmorphism/default aesthetic.

---

# 28. What “finished MiniFugg quality” means to the user

The user is comfortable with small games and simple mechanics, but not with games that feel disposable or visually generic.

A finished Fugg should usually have:

- a clear mechanic;
- a strong and readable authored composition;
- its own universe/identity;
- coherent art direction;
- meaningful micro-animation and feedback;
- music and SFX that belong to the same universe;
- a cover that makes an emotional promise the game can actually keep;
- stable geometry across devices;
- controls adapted to touch/desktop/gamepad without changing the game world;
- polished transitions into/out of gameplay;
- enough technical discipline that another AI can understand and refactor it later.

“Simple” is welcome.
“Prototype-looking” is not the goal.

---

# 29. Final mental model

The cleanest way to think about the target platform is:

```text
MiniFugg Core (React/TypeScript)
│
├── discovery / covers / account / economy / social / shell
│
├── 2D visual runtime (Phaser 4)
│   ├── games
│   ├── advanced covers
│   └── animated entry/home visuals
│
├── 3D visual runtime (Three.js)
│   └── low-poly/blockout games
│
├── Core audio system (target: one global manager)
│   ├── music
│   ├── SFX
│   ├── UI
│   └── ambience
│
└── Core/backend authority
    ├── account
    ├── coins
    ├── purchases/entitlements
    ├── official ladders
    └── platform/store adapters
```

All of this is authored mobile-first around a canonical fixed stage and then uniformly scaled/wrapped for browser, mobile and desktop distribution.

The purpose of the current transition is not merely “replace CSS with Phaser”.

It is to turn a fast but increasingly inconsistent collection of prototypes into a **repeatable MiniFugg factory**: easy for the user to create with, visually ambitious enough to feel special, technically stable across devices, secure where shared state matters, and maintainable when the catalog is no longer eight games but hundreds.
