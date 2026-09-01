# MiniFugg style kits

These kits are reusable art-direction starting points for game agents. They are deliberately different from one another so MiniFugg games do not collapse into one generic AI aesthetic.

Each kit describes palette, silhouettes, type, texture, motion, reusable objects and anti-patterns. A game may use one kit, customize it, or mix at most two. Fully custom directions are always allowed.

Available kits:

- `pixel-dungeon.md` — roguelikes, tile tactics, dungeon/grid games
- `paper-cut.md` — puzzles, cozy, sorting, food/craft games
- `ink-pulp.md` — weird arcade, dark comedy, comic action
- `toybox.md` — physics, stacking, party/object games
- `sports-broadcast.md` — racing, timing, sports, score chase
- `editorial-grid.md` — numbers, words, logic, abstract strategy

Machine-readable definitions: `src/style-kits/catalog.ts`.

Current reusable asset pack:

- Pixel Dungeon SVG symbol sheet: `/style-kits/pixel-dungeon.svg`

Example usage:

```html
<svg viewBox="0 0 16 16" aria-hidden="true">
  <use href="/style-kits/pixel-dungeon.svg#chest" />
</svg>
```

When a game selects a kit, create `src/games/<game-id>/ART_DIRECTION.md` recording the kit, palette deviations, custom characters/objects and any explicit visual references or things to avoid.
