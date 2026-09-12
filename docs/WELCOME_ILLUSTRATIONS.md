# MiniFugg — Welcome / Cover Illustrations

This document defines production covers and the retirement boundary for existing animation systems.

Before a cover pass, follow [GAME_CREATION_PIPELINE.md](GAME_CREATION_PIPELINE.md): recover the game's approved artistic references and rejected directions from `ART_DIRECTION.md` and `GAME_STATUS.md`. Carry those decisions into the static cover without asking the user to repeat them. Check fidelity to actual gameplay and the anti-generic visual criteria before accepting it. Keep progress and remaining choices in the game's status file.

## Current migration status

TetraMindFck's four validated covers now run as static Core raster art. The former Phaser cover host and TetraMindFck layer bundles were retired with this cutover. LineFugg and Vlad's Skewers also use static full-height Core collections; their approved original references remain preserved separately from the `390 × 844` restorations.

The registry tracks this with `migration.cover`. Until a game's cover state is `current`, the cover is considered transitional even when the current artwork itself is useful/beautiful.

### Catalog audit — 12 September 2026

| Game | Approved standalone originals found | Current cover state | Next action |
| --- | ---: | --- | --- |
| TetraMindFck | 4 | `current` | Four static editions active; Japanese master accepted and promoted on 12 September 2026 |
| LineFugg | 4 | `current` | Full-height restorations active and browser-checked on three reference heights; final user review remains distinct |
| Vlad's Skewers | 5 | `current` | Full-height restorations active and browser-checked on three reference heights; final user review remains distinct |
| Train Fighter | 0 | `update-required` | Recover or validate a real original before any cover production |
| Shoot the Shooter | 0 | `update-required` | Recover or validate a real original before any cover production |
| HARI les dents pourries | 0 | `update-required` | Recover or validate a real original before any cover production |
| CrazyPapers | 0 | `update-required` | Four new standalone research sources (pulp, micro, graphic, Japanese) await artistic validation; no runtime import yet |
| DebthOfLife | 0 | `update-required` | Recover or validate a real original before any cover production |

The audit covers repository history and the accessible local `GFX/crea-chatgpt/` archive. A screenshot, gameplay DA or contact-sheet tile is not counted as a standalone approved cover master. Missing originals are reported rather than reconstructed from memory.

## 1. Core ownership

Covers belong to MiniFugg Core/discovery, not to individual gameplay renderers.

Core owns:

- cover selection/unlock state;
- Insert Coin / Change Game;
- Info / Like / Comments / Bookmark / Share;
- coin balance;
- opening the game.

Login/account/platform UI remains React/HTML/CSS.

## 2. Static cover target and animated legacy

### Static cover

A normal authored raster image may be rendered directly by React Core. Do not initialize Phaser merely to display a still image.

### Animated cover — legacy

Do not create new animated covers. Existing Phaser or CSS layered covers remain only until an approved static replacement is available. Preserve their current output during transition, then delete the runtime and layer data no longer referenced.

## 3. Retired legacy cover systems

The retired `FuggWelcome`, `ParallaxLab`, `welcomeTuning` and shared Phaser cover implementation remain available in Git history as migration references. No animated cover runtime remains in production.

Do not restore or replace these systems with another animated cover runtime.

## 4. Visual composition is canonical

A cover has a fixed authored composition just like a game.

The central composition remains the same on phone, tablet and desktop. Mobile uses width-first scaling and may crop HAUT/BAS; PC scales CENTRE to the full height and crops HAUT/BAS. Desktop side space belongs to Core. EXTRA HAUT/BAS exist only outside MASTER on a proportionally taller mobile viewport.

## 5. Cover variants

Games may have multiple collectible/unlockable cover treatments, including regional/cultural variations when appropriate.

During the public Alpha, every cover variant that exists in a game's catalog is unlocked and selectable. Score and achievement thresholds remain catalog metadata for the later progression system but do not lock covers during Alpha.

Typical family:

1. primary edition;
2. alternate art direction/edition;
3. score-unlocked rare variant;
4. foreign/regional edition (for example Japanese/Chinese treatment when artistically justified).

The exact number is a product/art-direction decision, not an engine requirement.

Unlocking/selecting a cover never changes gameplay balance.

## 6. Asset pipeline

Before creating/importing/integrating cover artwork, read `docs/ASSET_PIPELINE.md`.

Codex writes verified assets directly under `public/assets/generated/...`; ChatGPT without local access uses private Drive → GitHub Actions → `public/assets/imported/...`. Preserve PNG/lossless masters and produce WebP lossless runtime derivatives; AVIF is reserved for validated large static art with fallback. Do not create new JPEG.

## 7. Static deliverable

Deliver one approved lossless MASTER `390 × 844`, plus measured runtime derivatives and fallbacks. Do not bake Core controls into the image. Keep the subject and title outside MONNAIE, RAIL and JOUER masks and keep essential content in CENTRE.

## 8. Performance

Load cover files lazily and avoid decoding every catalog cover at startup. A runtime derivative must respect the actual display size and asset budget. Removing cover animation also removes inactive render loops and repeated Phaser instances from discovery.

## 9. Quality bar

A cover sets an emotional promise. The gameplay art direction should feel related enough that entering the game does not create a severe quality drop.

A premium cover is not permission for the game beneath it to remain a generic prototype.
