# MiniFugg Visual Style System v1.1

This document exists to prevent every AI-built game from converging on the same generic visual language.

MiniFugg Core is consistent. The games should not all look consistent. The shared shell owns title, creator, social actions and score. The game surface should have a strong independent art direction.

## 1. Anti-default rule

Unless the user explicitly asks for it, do not default to dark navy/black plus purple/cyan gradients, glowing neon blobs, glassmorphism cards everywhere, soft rounded rectangles as the main visual vocabulary, generic futuristic HUDs, excessive bloom, or tiny pale text.

If no art direction has been chosen yet, use a deliberately neutral prototype: flat colors, simple geometry, large readable type, no decorative polish. Do not let the prototype become the house style.

## 2. Visual + layout preflight

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

Do not force all questions when the user already answered them implicitly. For orientation especially, infer obvious geometry: falling blocks are usually portrait; horizontal conveyor/racing/timing mechanics often benefit from landscape.

Prompt 1 should still move the game forward. If answers are missing, build gameplay with neutral temporary art and present the useful QCM choices in the same response. Apply the chosen direction on the next prompt. If the user explicitly wants to decide art direction before coding, then wait for those answers.

See `docs/ORIENTATION_LAYOUT.md` for the orientation contract.

## 3. Style kits

The machine-readable catalog is in `src/style-kits/catalog.ts`. Detailed kits live in `docs/style-kits/`.

A kit defines palette philosophy, geometry and silhouette, typography, texture/material, motion, typical object vocabulary, reusable assets when available, and anti-patterns.

Record the chosen direction inside the game folder as `ART_DIRECTION.md`, including deviations from the base kit. Future agents should read it before changing visuals.

## 4. Core safe zones

MiniFugg exposes global CSS variables:

```css
--minifugg-core-top-reserved
--minifugg-core-bottom-reserved
--minifugg-core-left-reserved
--minifugg-core-right-reserved
--minifugg-swipe-gutter
```

Portrait mainly reserves top + bottom. Landscape phone moves the action dock to the right, so the right reservation becomes important and the bottom reservation becomes much smaller.

Backgrounds, particles and non-interactive decoration may extend behind Core chrome. Essential gameplay must not. Do not put critical buttons, readable instructions, important touch targets, drag endpoints, inventory, timers or other essential HUD under these zones.

```css
.my-game-safe-ui {
  position: absolute;
  top: var(--minifugg-core-top-reserved);
  right: var(--minifugg-core-right-reserved);
  bottom: var(--minifugg-core-bottom-reserved);
  left: var(--minifugg-core-left-reserved);
}
```

A full-screen canvas may fill the viewport, but meaningful interactive bounds should account for these insets.

## 5. Readability

Avoid tiny fly-print inside games too. Important text should generally be at least 14px equivalent on a phone, primary labels should be much larger, and fewer clear labels are preferable to many tiny ones.

Landscape is not an excuse to shrink text: use the extra width to reorganize information instead of making the portrait layout smaller.

## 6. Useful defaults by game type

- roguelike / dungeon / tile tactics -> Pixel Dungeon
- puzzle / cozy / sorting / food -> Paper Cut
- dark comedy / weird arcade -> Ink Pulp
- physics / stacking / party / object manipulation -> Toybox
- racing / sports / reflex score chase -> Sports Broadcast
- numbers / logic / word / abstract strategy -> Editorial Grid

These are recommendations, not restrictions. The assistant may propose 2–3 kits when the concept could go in different directions.
