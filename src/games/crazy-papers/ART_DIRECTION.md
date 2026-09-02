# CrazyPapers — Art Direction

## Base direction

- Style kit: `pixel-dungeon`, heavily adapted into a bureaucratic desk / document game.
- Explicit reference: the oppressive low-resolution bureaucracy mood of *Papers, Please*.
- Do not copy *Papers, Please* interface layouts, assets, characters, emblems or exact palette. The reference is mood, density, hard pixel edges and administrative drabness.

## Palette

- Wall / office grime: `#504b3d`, `#302d25`
- Desk wood: `#706145`, `#4c402d`
- Neutral paper: `#ded2ae`
- Accounting paper cue: dirty green `#d4dcc1`
- Civil-status paper cue: faded salmon `#dfcabb`
- Planning paper cue: blueprint grey-blue `#bed0d5`
- Ink: `#1d1a14`, `#4b4333`
- Supervisor / error return: dried red `#a13930`, `#a62f27`

Keep colors dirty, matte and printed. No neon, glass, bloom or modern SaaS cards.

## Typography

- Monospace / typewriter-first using system-safe `Courier New`, Courier, monospace.
- Uppercase administrative labels.
- Important document titles and warnings must remain large enough to read on a phone.
- Avoid decorative tiny metadata unless it is purely atmospheric.

## Geometry and texture

- Hard rectangular edges, 2–4px borders, offset pixel-like shadows.
- Paper grain and office-wall texture may use cheap repeating CSS patterns.
- Documents should feel physical and slightly misaligned, but never so rotated that text becomes hard to read.
- Sector stamps are large physical desk controls, not rounded UI buttons.

## Core document language

The player sorts documents into three administrative sectors:

- `COMPTABILITÉ`
- `ÉTAT CIVIL`
- `URBANISME`

Each sector owns four recurring document models. Every generated document is recognizable through up to five independent cue families:

1. document title / genre;
2. sector paper color;
3. document form / page geometry;
4. characteristic content (amounts and VAT, names and civil dates, parcels and square metres, etc.);
5. sector mark / printed symbol.

Difficulty removes cues progressively from five down to one. A document must always preserve at least one independently useful clue; never create a pure guess.

## Physical backlog

- Do not represent workload with a progress bar.
- Pending work must exist as visible stacks of paper on the desk behind the active document.
- New work visibly adds sheets to the stacks.
- Taking the next document visibly reduces the stacks.
- The active document is the dominant readable object in the stage.
- A stamped document exits to the right.
- A wrongly routed document later returns from the left carrying a large red `MAUVAIS SERVICE` mark.
- An error also adds extra work while the supervisor blocks the player briefly, so the paper piles keep growing during the interruption.

## Motion

- Dry, stepped, mechanical motion.
- Correct routing: immediate stamp press and document shoots right.
- Wrong routing: same rightward departure, supervisor interruption, then abrupt left-to-centre return.
- Paper-stack growth should be visible but cheap; no particles or floaty easing.
- Avoid long easing, squash-and-bounce and decorative animation.

## Layout

- Preferred orientation: portrait.
- Use MiniFugg shared `.mf-game-layout`, `.mf-game-hud`, `.mf-game-stage`, `.mf-game-controls` and shared text/touch/gap tokens.
- Core safe zones and the bottom feed swipe gutter must remain unobstructed.
- Root keeps `touch-action: pan-y`; stamp buttons use `touch-action: manipulation`.
