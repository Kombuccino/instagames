# Train Fighter — Art Direction

## Base direction

- Style kit: **Toybox**.
- Tone: cute/friendly + energetic arcade.
- Density: balanced. The rails, enemies and loot must be readable instantly on a small portrait phone.
- Spatial language: pseudo-3D toy railway viewed from above/front, with the player's locomotive low in frame and hazards travelling toward it.
- Motion: juicy, bouncy, slightly physical. Wheels spin, enemy trains rattle, pickups bob, lane changes snap with a small overshoot.

## Palette

Warm, bright painted-toy colors rather than neon UI:

- ink / outlines: `#262323`
- cream: `#fff4d0`
- player blue: `#48a4df`
- player red: `#ef5848`
- toy yellow: `#ffd64a`
- forest greens: `#76c96a`, `#4f9f50`
- canyon sand/red: `#e5a75f`, `#b96c43`
- mountain greens/greys: `#82aa87`, `#547762`
- snow/aurora blues: `#d9edf2`, `#597fb7`

## Typography

Use chunky system-rounded / toy-label typography. Large values and short labels only. Avoid thin condensed UI text and micro labels.

## Material / texture

Everything should feel like painted wood, plastic, foam or chunky metal toys. Use strong dark outlines, restrained inset shadows, simple highlights and visible physical depth. Do not use glassmorphism, cyberpunk glows or glossy futuristic panels.

## Characters / props

### Player locomotive

- Blue/red/yellow toy locomotive.
- Friendly face in the cab.
- Two articulated cartoon arms.
- Equipped weapon appears in both hands.
- Wagons trail physically behind and are the player's life total. Show the closest three and collapse deeper wagons into a `+N` indicator.

### Enemy locomotives

- Small angry toy trains travelling toward the player.
- Different body colors by tier.
- Angry face, little arms, visible tier pips.
- They should look threatening but funny, never grim or militaristic.

### Pickups

Oversized physical tokens: coins, wagon blocks, weapon crates/icons, shield bubble, turbo lightning.

## Biomes

1. **Mossy Forest** — saturated greens, toy trees, soft blue sky.
2. **Red Canyon** — sand, terracotta rocks, chunky cactus-like props.
3. **Cloud Mountain** — muted alpine greens, large triangular peaks.
4. **Aurora Pass** — icy blue ground, darker sky, snowy props.

The railway remains the visual constant while scenery/palette changes strongly enough that progression feels like travelling.

## Station

A cream/red striped toy railway station panel, deliberately physical and cheerful. It pauses the run between biomes and offers only direct upgrades: wagon, weapon, armor, then departure.

## Avoid

- generic dark AI-game backgrounds;
- purple/cyan neon gradients as the main palette;
- glass cards;
- tiny HUDs;
- realistic locomotives;
- military weapons/gore;
- excessive particles that hide rails or pickups;
- moving the primary LEFT/RIGHT gameplay controls into the Core bottom swipe gutter.
