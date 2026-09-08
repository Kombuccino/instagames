# MiniFugg — Platform Entry Scenes

Living specification for MiniFugg cold-open scenes and the seamless transition into cover discovery.

Read with `docs/PLATFORM_ART_DIRECTION.md`, `docs/DISCOVERY_NAVIGATION.md`, `docs/META_PROGRESSION.md`, `docs/GAME_ENGINE_ARCHITECTURE.md` and `docs/ASSET_PIPELINE.md`.

This system belongs to **MiniFugg Core**, not to any individual game.

## 1. Core idea

MiniFugg may open through a rotating library of short everyday or absurd scenes rather than one permanent splash.

Invariant:

> The player is somewhere, their own arm/hand is visible, they hold a phone, MiniFugg is already alive on that phone, and entering the platform means moving into that screen.

The phone is naturally held/placed in the context, not a floating magical object.

## 2. Visual direction

The main family is stylized low-poly rather than photorealistic.

Prefer:

- simplified/faceted geometry;
- warm authored lighting;
- matte/simple materials;
- readable silhouettes;
- low-detail people/hands;
- environments readable in roughly one second;
- few strong background elements;
- restrained atmospheric motion.

Avoid photoreal lifestyle advertising, cyberpunk clichés, glossy AAA materials, generic game-ad realism and unnecessary geometric complexity.

## 3. Scene families

Examples:

- contemporary Japanese metro/train;
- toilets;
- date/restaurant;
- waiting room;
- bed/night;
- office/meeting;
- café;
- airport/station;
- rarer absurd contexts later.

The scenes express the habit of opening MiniFugg; they do not explain the game catalog.

## 4. First-person point of view

Camera normally represents the player.

Useful cues:

- forearm/hand holding phone;
- knees/shoes/table/seat edge;
- restrained environment context;
- simplified people/objects;
- live phone screen as focal point.

Prefer “I am here” over a third-person protagonist using an app.

## 5. Initial metro scene

Use a contemporary stylized low-poly carriage with a few observed cues: handles/doors/signage, simplified passengers, subtle carriage sway, low-poly player arm/phone and restrained modern lighting.

It should feel specific without tourist/cyberpunk caricature.

### Validated phone boot screen v1 — 2026-09-06

The selected metro-phone boot treatment is the dark navy/black version with floating game-card motifs, warm spotlight, MiniFugg wordmark and red `Tap to play` call-to-action.

Fuggy is deliberately a separate transparent animation layer above that background. The current production loop uses five generated low-poly poses in a ping-pong sequence (`01 → 02 → 03 → 04 → 05 → 04 → 03 → 02`) to create a gentle arms-up hip dance without requiring a 3D rig.

Production runtime root:

`/assets/imported/platform/entry-scenes/metro-moment-v1/phone-screen-v1/`

The approved visual reference and generated frame masters are also preserved in the private Graphic Archive under the metro entry-scene selected assets.

## 6. Stable brand

Scenes rotate; MiniFugg identity does not.

Stable elements include the canonical wordmark/logo, mascot reference, platform typography, icon language, accent logic and entry motion grammar.

Do not redesign the logo per scene.

## 7. Phone screen = live Core

The screen inside the phone should be the real MiniFugg Core surface whenever practical, not a separately painted fake UI.

It may show logo/boot state or the first game cover, then transition into the same live full-screen discovery surface.

## 8. Seamless transition

Default grammar:

1. context appears and reads quickly;
2. phone is already visible/alive;
3. user enters;
4. hand/device approaches while camera subtly meets it;
5. phone screen grows toward the canonical central viewport;
6. device frame/outside scene leaves view;
7. the same live MiniFugg screen becomes the central fullscreen discovery experience.

Do not cut to a generic storefront grid.

### Extended-screen branch — direction du 8 septembre 2026

When the available viewport is wide enough for the extended Core experience, the phone does not leave the frame after its approach. It grows toward the maximum useful height, moves to the right and keeps the player's hand visible. The surrounding metro gives way to a bedroom desk scene; the phone is the continuous object joining both places.

The preferred research direction uses the enlarging phone and hand as a natural foreground mask rather than a literal split screen or digital particle effect: the metro loses focus and exposure behind the device, warm desk light appears, then the bedroom resolves in its wake. Reduced motion uses a short background fade while keeping the phone fixed and readable.

The left side then introduces a physical or semi-physical `MiniFugg Retro Gaming` magazine. It is closed first for roughly 4–5 seconds. Its cover is a fixed low-poly Fuggy composition with the exact MiniFugg-logo masthead and short funny English cover lines; it never selects a catalog game. It then opens almost flat and readable on the desk, with one active page and the rest curled underneath. Three physical tabs directly select `FEATURE`, `COMMENTS` and `RANKING` inside the same fixed page.

The fixed cover has no Like, Favorite, selected-game or player-dependent state. The open spread and phone remain synchronized to the active game.

In the stable state, the phone is an actual gameplay viewport rather than a prop: keep it at the extreme foreground on the right and use 95% of the useful height. Its uninterrupted fictional glass directly uses the canonical `390 × 844` game MASTER. The shell has no camera, notch, sensor, speaker island or large chin, and the holding hand never overlaps gameplay. The open magazine dominates the remaining width. Only a thin border of desk, lamp light and bedroom may remain visible.

The magazine reflows the same live Core data into three reusable English editorial grids: `FEATURE`, `COMMENTS` and `RANKING`. Their visual grammar combines French editorial humour, bold US box-out hierarchy and Japanese density, small captures and clear color markers without copying a specific publication. The physical magazine itself uses the same faceted low-poly language as the room and hand. Handwriting, filler doodles, improvised mascots, dirty paper, artificial ageing, Like stickers and Favorite bookmarks are forbidden. Follow `DA_MAGAZINE.md` before any new magazine artwork or implementation.

## 9. Motion/audio

Use a small number of authored ambient motions: carriage sway, sleepy head nod, hand micro-movement, passing light, fluorescent flicker, steam/rain, etc.

One primary and one secondary ambient motion is usually enough.

Short ambience/music may vary by scene and hand off smoothly to cover/game audio. Entry scenes must not become long unskippable sequences.

All entry audio uses the global Core manager described in `AUDIO_SYSTEM.md`.
The scene requests its track and owns only its handle. Core retains blocked intent,
unlocks on normal player gestures and owns all foreground/background retries.
Do not add a Home-specific context or listener/retry system.

## 10. Runtime production choices

Core UI/login/discovery remains React/HTML/CSS.

Choose the lightest canonical visual method that preserves the intended scene:

- still/pre-rendered raster scene for genuinely static composition;
- simple authored raster layers for minor 2.5D ambience;
- **Three.js** when the scene is genuinely realtime 3D and benefits from low-poly geometry, lighting, camera motion or 3D FX.

Do not grow a new bespoke Canvas/WebGL perspective renderer for entry scenes. `PerspectiveTextureCanvas` and current Canvas experiments are legacy migration references only; migrate/remove their usage when the canonical Three/normal-Core approach replaces them.

The live phone UI remains Core and should be composited/positioned so the canonical phone-to-cover handoff stays geometrically stable.

## 11. Cross-screen invariant

The complete-screen experience preserves the canonical portrait composition. On an extended screen, the authored exception above deliberately places the same phone surface on the right and gives the left side to the magazine. Content, game geometry and data remain shared; only the Core staging changes.

Choose complete or extended presentation from the useful container geometry, not from a desktop/mobile user-agent label. Intermediate widths must fall back to the complete composition instead of squeezing an unreadable magazine beside the phone.

## 12. Scene library / achievements

Launch with a small high-quality set, then unlock additional scenes via meta progression. Avoid immediate repetition; newly unlocked scenes may be forced once before entering normal weighted rotation.

Exact unlock rules live in `docs/META_PROGRESSION.md`.

## 13. Assets

Every production visual asset uses `docs/ASSET_PIPELINE.md` and the platform Drive/import hierarchy. Keep originals intact unless explicit optimization/derivative work is requested.

## 14. Validation boards

Concept/validation should show the whole interaction, not an isolated pretty picture:

1. stable logo/mascot;
2. entry scene;
3. phone approach/handoff;
4. full-screen cover with coin balance;
5. discovery navigation;
6. play transition;
7. details/community state.

The interaction model remains authoritative while visual treatments evolve.

### Extended-screen concept artwork v1 — not yet production-approved

- `/assets/generated/platform/concepts/extended-screen-v1/metro-room-phone-occlusion-concept-v2.png`: preferred metro-to-bedroom midpoint, phone/hand used as the transition mask;
- `/assets/generated/platform/concepts/extended-screen-v1/metro-room-transition-concept-v1.png`: superseded square-dissolve exploration retained for comparison;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-closed-concept-v2.png`: selected cover-state direction, full-height blank phone and exact-logo magazine masthead;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-info-concept-v3.png`: useful phone framing and Dossier structure, rejected final page DA;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-comments-concept-v3.png`: useful Comments content study, rejected final page DA;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-ladder-concept-v3.png`: useful ranking structure, rejected final page DA and obsolete two-page geometry;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-dossier-clean-concept-v4.png`: first clean Dossier candidate following `DA_MAGAZINE.md`, pending user validation;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-open-concept-v2.png`: superseded open-state study that compressed editorial, comments and scores;
- `/assets/generated/platform/concepts/extended-screen-v1/minifugg-retro-gaming-masthead-v1.png`: exact MiniFugg-logo masthead study with separate `RETRO GAMING` descriptor;
- `/assets/generated/platform/concepts/extended-screen-v1/single-page-tetramindfck-info-concept-v9.png`: current single-page physical direction, with stronger low-poly facets and a rounded cover fragment curled underneath;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-open-concept-v1.png`: superseded first open-state study with too much room and insufficient phone scale.

These are composition and atmosphere studies. They are flattened and must not be wired as runtime backgrounds. Production requires separate metro, dissolve, room, desk, magazine, hand/device and live screen ownership.
