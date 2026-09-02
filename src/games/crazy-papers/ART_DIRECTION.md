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
- Human-resources paper cue: old yellow `#dad39e`
- Legal paper cue: dusty mauve-grey `#cbc4d0`
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
- Five stamps use a `3 + 2` portrait layout so they stay large and readable instead of becoming five tiny equal-width buttons.

## Core document language

The player sorts documents into five administrative sectors:

- `COMPTABILITÉ`
- `ÉTAT CIVIL`
- `URBANISME`
- `RESSOURCES HUMAINES`
- `AFFAIRES JURIDIQUES`

Each sector owns four recurring document models, for twenty core models total. Models unlock progressively across early levels instead of exposing the whole vocabulary at once.

Every generated document is recognizable through up to five independent cue families:

1. document title / genre;
2. sector paper color;
3. document form / page geometry;
4. characteristic content (amounts and VAT, names and civil dates, parcels and square metres, matricules and absences, articles and clauses, etc.);
5. sector mark / printed symbol.

Difficulty removes cues by level from five down to one. A document must always preserve at least one independently useful clue; never create a pure guess.

## Career / level structure

- A level is a finite administrative workload, not an endless uniform stream.
- The desk starts with a visible pile and additional mail continues to arrive while the level is active.
- If the player empties the visible pile before scheduled mail has arrived, the next pending document must arrive almost immediately: never leave a fast keyboard player staring at an empty desk.
- Once the entire workload has arrived and every sheet is cleared, show a short promotion card and load the next level automatically.
- Every level grants a more senior absurd administrative grade.
- Higher levels have larger workloads, faster arrivals, more unlocked document models and fewer visible cues.

## Surprise events

Surprises change pressure but must never make classification unfair:

- `LIASSE DU COURRIER`: three extra documents are dropped onto the desk.
- `DOSSIER URGENT`: one visibly urgent document jumps to the front of the queue, but follows normal classification rules.
- `PHOTOCOPIEUSE FOLLE`: the just-seen document family reappears in duplicate with fresh cue combinations.

Use short physical banners and paper effects. Surprises should be intermittent, not constant noise.

## Physical backlog

- Do not replace workload with a progress bar.
- Pending work must exist as visible stacks of paper on the desk behind the active document.
- New work visibly adds sheets to the stacks.
- Taking the next document visibly reduces the stacks.
- The active document is the dominant readable object in the stage.
- A stamped document exits to the right.
- A wrongly routed document later returns from the left carrying a large red `MAUVAIS SERVICE` mark.
- An error also adds extra work while the supervisor blocks the player briefly, so the paper piles keep growing during the interruption.

## Motion

- Dry, stepped, mechanical motion.
- Correct routing: immediate stamp press and document shoots right quickly.
- Wrong routing: same rightward departure, supervisor interruption, then abrupt left-to-centre return.
- Promotions and surprise banners use short snapped animations only.
- Paper-stack growth should be visible but cheap; no particles or floaty easing.
- Avoid long easing, squash-and-bounce and decorative animation.

## Layout

- Preferred orientation: portrait.
- Use MiniFugg shared `.mf-game-layout`, `.mf-game-hud`, `.mf-game-stage`, `.mf-game-controls` and shared text/touch/gap tokens.
- Core safe zones and the bottom feed swipe gutter must remain unobstructed.
- Root keeps `touch-action: pan-y`; stamp buttons use `touch-action: manipulation`.
