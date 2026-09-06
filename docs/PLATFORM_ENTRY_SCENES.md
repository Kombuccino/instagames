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

## 9. Motion/audio

Use a small number of authored ambient motions: carriage sway, sleepy head nod, hand micro-movement, passing light, fluorescent flicker, steam/rain, etc.

One primary and one secondary ambient motion is usually enough.

Short ambience/music may vary by scene and hand off smoothly to cover/game audio. Entry scenes must not become long unskippable sequences.

## 10. Runtime production choices

Core UI/login/discovery remains React/HTML/CSS.

Choose the lightest canonical visual method that preserves the intended scene:

- still/pre-rendered raster scene for genuinely static composition;
- simple authored raster layers for minor 2.5D ambience;
- **Three.js** when the scene is genuinely realtime 3D and benefits from low-poly geometry, lighting, camera motion or 3D FX.

Do not grow a new bespoke Canvas/WebGL perspective renderer for entry scenes. `PerspectiveTextureCanvas` and current Canvas experiments are legacy migration references only; migrate/remove their usage when the canonical Three/normal-Core approach replaces them.

The live phone UI remains Core and should be composited/positioned so the canonical phone-to-cover handoff stays geometrically stable.

## 11. Cross-screen invariant

The mobile central composition is the reference. On tablet/desktop, the entry scene may reveal/add decorative environment around that central composition, but the phone/Core handoff target must remain the same canonical center.

Do not reposition the phone and Core controls into a different composition merely because more width exists.

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
