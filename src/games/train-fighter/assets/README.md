# Train Fighter art assets

These are the source-of-truth art sheets for the game.

## Usage

```tsx
<svg className="tf-sprite tf-sprite--hero" viewBox="0 0 96 96" aria-hidden="true">
  <use href="/src/games/train-fighter/assets/train-fighter-sprites.svg#tf-hero" />
</svg>
```

For Vite production code, prefer importing the file URL so bundling remains stable:

```tsx
import trainSprites from './assets/train-fighter-sprites.svg?url'

<svg viewBox="0 0 96 96" aria-hidden="true">
  <use href={`${trainSprites}#tf-hero`} />
</svg>
```

Environment symbols work the same way with `train-fighter-biomes.svg`.

## Rendering rules

```css
.tf-sprite {
  display: block;
  overflow: visible;
  shape-rendering: crispEdges;
  image-rendering: pixelated;
}
```

Do not apply blur, bloom, smooth drop shadows or fractional scaling transforms to the sprites. If a sprite animates between positions, its resting positions should land on whole CSS pixels whenever practical.

The large `train-fighter-styleboard.svg` is reference-only and should not ship as gameplay art unless deliberately used for a loading/cover surface.
