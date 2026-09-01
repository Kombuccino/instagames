# Pixel Dungeon

Best for roguelikes, dungeon crawlers, tile tactics and grid action.

## Visual rules
- Work on a visible tile logic: usually 16px or 24px base units.
- Hard pixel edges, chunky silhouettes, very little antialiasing.
- Warm dark stone/wood base with parchment highlights and restrained danger/accent colors.
- No glass cards, no purple neon, no smooth gradient blobs.
- Characters and pickups must read from silhouette before detail.

## Motion
- Snapped tile movement.
- Tiny 1–3 frame anticipation/impact accents.
- Short hit-stop or screen nudge rather than long easing.
- Torch/fire can animate continuously but cheaply.

## Reusable vocabulary
Floor, wall, door, chest, coin, potion, spikes, slime, skeleton, sword, shield, heart, key, stairs and torch.

A starter SVG symbol sheet is available at `/style-kits/pixel-dungeon.svg`.

## Good customizations
Change biome palette, enemies, hero, tile size and props while preserving the chunky tile language.
