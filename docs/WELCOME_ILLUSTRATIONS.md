# MiniFugg — Welcome / Cover Illustrations

This document defines production covers and their animation boundary.

## Current migration status

**ALL CURRENT GAME COVERS: A METTRE A JOUR.**

The registry tracks this with `migration.cover`. Until a game's cover state is `current`, the cover is considered transitional even when the current artwork itself is useful/beautiful.

## 1. Core ownership

Covers belong to MiniFugg Core/discovery, not to individual gameplay renderers.

Core owns:

- cover selection/unlock state;
- Insert Coin / Change Game;
- Info / Like / Comments / Bookmark / Share;
- coin balance;
- opening the game.

Login/account/platform UI remains React/HTML/CSS.

## 2. Static vs advanced animated covers

### Static cover

A normal authored raster image may be rendered directly by React Core. Do not initialize Phaser merely to display a still image.

### Advanced animated cover

If a cover uses multiple authored layers, parallax, particles, masks, distortion, camera moves or significant autonomous motion, the target runtime is the **shared Phaser 4 cover scene**.

Do not expand the legacy CSS/React parallax interpreter or add new custom Canvas effects as a parallel cover engine.

## 3. Existing legacy cover system

The current `FuggWelcome`, `ParallaxLab`, `welcomeTuning` and layered TetraMindFck data are **migration references**, not the future production architecture.

They may remain temporarily so existing work can be inspected and translated. New cover capabilities should be implemented in the Phaser cover runtime instead.

When the Phaser replacement is canonical, remove superseded legacy cover-rendering code rather than keeping two engines alive.

## 4. Visual composition is canonical

A cover has a fixed authored composition just like a game.

The central mobile composition must remain the same on phone, tablet and desktop, scaled uniformly. Desktop side space may receive optional Core content/decorative extensions without changing the cover's internal layer positions.

Animated layer transforms are authored in the cover's logical coordinate system, not in arbitrary viewport `vw`/`vh` positions.

## 5. Cover variants

Games may have multiple collectible/unlockable cover treatments, including regional/cultural variations when appropriate.

Typical family:

1. primary edition;
2. alternate art direction/edition;
3. score-unlocked rare variant;
4. foreign/regional edition (for example Japanese/Chinese treatment when artistically justified).

The exact number is a product/art-direction decision, not an engine requirement.

Unlocking/selecting a cover never changes gameplay balance.

## 6. Asset pipeline

Before creating/importing/integrating cover artwork, read `docs/ASSET_PIPELINE.md`.

Production art follows:

`private Drive → GitHub Actions sync → public/assets/imported/... → /assets/imported/...`

Preserve original production assets unless optimization is explicitly requested. Derived web delivery formats may be introduced through the documented derivative pipeline rather than destroying originals.

## 7. Layer bundles

For advanced covers, prefer real authored raster layers where the visual object is part of the illustration:

- background;
- midground;
- subject/characters;
- foreground;
- title/graphic overlay;
- optional effect mattes.

Runtime effects may add particles, glow, light movement, shake, distortion or atmospheric motion, but should not replace artwork that should have been authored.

## 8. Performance

Cover animation must be cheaper than active gameplay and must stop/pause when the cover is not visible.

Do not run heavy particle systems or multiple active engine instances for neighboring feed items. Load cover assets/runtime lazily where practical.

Respect reduced-motion preferences for non-essential cover motion.

## 9. Quality bar

A cover sets an emotional promise. The gameplay art direction should feel related enough that entering the game does not create a severe quality drop.

A premium cover is not permission for the game beneath it to remain a generic prototype.
