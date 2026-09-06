# MiniFugg Visual Style System v1.2

This document exists to prevent every AI-built game from converging on the same generic visual language and to keep visual production compatible with the canonical MiniFugg runtime.

MiniFugg Core is consistent. The games should not all look consistent. The game surface should have a strong independent art direction.

Before creating or modifying gameplay graphics, also read `docs/GAME_ENGINE_ARCHITECTURE.md`, `docs/GAME_LAYOUT_SYSTEM.md`, the game's `ART_DIRECTION.md` when present, and `docs/ASSET_PIPELINE.md` for every production image.

## 1. Anti-default rule

Unless the user explicitly asks for it, do not default to dark navy/black plus purple/cyan gradients, glowing neon blobs, glassmorphism cards everywhere, soft rounded rectangles as the main visual vocabulary, generic futuristic HUDs, excessive bloom, or tiny pale text.

If no art direction has been chosen yet, use a deliberately neutral prototype: flat colors, simple geometry, large readable type, no decorative polish. Do not let the prototype become the house style.

## 2. Visual + orientation preflight

When a new game does not already imply a clear art direction or orientation, expose a compact QCM. Infer answers that are obvious and only ask what is useful.

Q0 — Orientation
A. portrait
B. landscape
C. both
D. decide for me from the mechanic

Q1 — Visual family
A. Pixel Dungeon — chunky tile/sprite world
B. Paper Cut — paper, cardboard, felt, collage
C. Ink Pulp — comic ink, print, grotesque/punk
D. Toybox — chunky colorful toys and physical objects
E. Sports Broadcast — scoreboard, race/sport TV graphics
F. Editorial Grid — clean print/grid/typography-driven
G. Custom

Q2 — Tone
A. cute/friendly
B. absurd/comic
C. dark
D. energetic/arcade
E. elegant/restrained
F. dirty/handmade

Q3 — Density
A. extremely simple
B. balanced
C. dense/lots to inspect

Q4 — Spatial language
A. flat UI/board
B. top-down tiles
C. side view
D. pseudo-3D/isometric
E. full-screen physical objects

Q5 — Motion
A. dry and instant
B. juicy/squash/bounce
C. heavy/physical
D. frantic/chaotic
E. slow/elegant

Q6 — Reuse level
A. existing kit almost as-is
B. kit with custom palette/characters
C. mix at most two kits
D. fully custom

Do not force all questions when the user already answered them implicitly. Prompt 1 should still move the game forward. If answers are missing, build gameplay with neutral temporary art and present only the useful choices in the same response.

## 3. Canonical composition rule for graphics

Gameplay art is authored for the game's **fixed logical stage**, not for a particular phone, browser or monitor.

Default authored stages are:

- portrait: `390 × 844` logical units;
- landscape: `844 × 390` logical units.

The central composition must remain the same on phone, tablet, browser and desktop/store builds. Runtime adaptation is uniform scaling of the whole logical stage, not a redesign of object positions.

When producing sprites, boards, backgrounds, HUD art, illustrated physical objects or layered compositions:

- define their intended position/size relative to the canonical logical stage;
- keep gameplay-critical relationships stable;
- do not create separate PC/mobile compositions merely because the aspect ratio differs;
- do not assume all phones have the same aspect ratio;
- allow decorative backgrounds/overscan to extend beyond the canonical stage when useful;
- keep essential gameplay and readable content inside the canonical stage;
- use extra desktop/tablet width only for optional Core sidecars or non-critical decorative ambience.

If screenshots from different devices are normalized to the same logical stage size, the gameplay composition should align almost exactly.

## 4. Asset-production consequence

For any production image, follow `docs/ASSET_PIPELINE.md`.

Artwork should be delivered in forms that preserve flexibility inside the engine:

- important independent moving objects should normally be separate assets/sprites;
- backgrounds may be larger than the canonical stage when overscan is useful;
- layered covers should keep independently animated subjects/layers separate;
- avoid baking controls or mutable UI text into gameplay art unless explicitly intended;
- preserve source resolution and originals unless optimization is explicitly requested.

Do not recreate important authored raster art procedurally in Phaser/Three.js merely because the engine can draw shapes. Engine-generated graphics are appropriate for dynamic FX, particles, masks, lights, debug/prototype geometry and genuinely procedural elements.

## 5. Style kits

The machine-readable catalog is in `src/style-kits/catalog.ts`. Detailed kits live in `docs/style-kits/`.

A kit defines palette philosophy, geometry and silhouette, typography, texture/material, motion, typical object vocabulary, reusable assets when available, and anti-patterns.

Record the chosen direction inside the game folder as `ART_DIRECTION.md`, including deviations from the base kit. Future agents should read it before changing visuals.

## 6. Readability

Avoid tiny fly-print inside games. Important text should generally be at least 14px equivalent on the canonical phone presentation, primary labels should be much larger, and fewer clear labels are preferable to many tiny ones.

Do not solve a wider screen by shrinking or redistributing the canonical gameplay composition. Wider space belongs outside the central logical stage unless the game explicitly supports a separate canonical orientation.

## 7. Useful defaults by game type

- roguelike / dungeon / tile tactics -> Pixel Dungeon
- puzzle / cozy / sorting / food -> Paper Cut
- dark comedy / weird arcade -> Ink Pulp
- physics / stacking / party / object manipulation -> Toybox
- racing / sports / reflex score chase -> Sports Broadcast
- numbers / logic / word / abstract strategy -> Editorial Grid

These are recommendations, not restrictions. The assistant may propose 2–3 kits when the concept could genuinely go in different directions.
