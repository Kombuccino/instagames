# TetraMindFck — Art Direction

## Gameplay direction — approved 2026-09-19

The approved direction remains a **retro portable-console / green CRT**: warm cream handheld body, one dominant green display, narrow left equipment rail, washed phosphor tiles and tactile controls. The 2026-09-19 approval supersedes the former SCORE-led gameplay composition, not the cover or audio directions below.

Exact approved reference: `tetramindfck-gameplay-da-approved-2026-09-19.png`, private Graphic Archive file `1uwp0dczINJlFOX1eMle5xtjXZNLBuxo7`, in `Games/tetramindfck/gameplay-production-2026-09-19` (folder `1cVoRYkEmFleYRc9PVnzdZiM_HFXc3W43`). Original: opaque PNG, 853 × 1844 pixels, SHA-256 `25b66ea0292439a32047cdd7d544ca4e553f1f8855ec68cab156e45c231b9a83`. Preserve these bytes. This flat image is **REFERENCE ONLY**, not a runtime background or a mechanically valid board state.

### Approved gameplay visual contract

- New production stage: `390 × 850` logical units, textures at ×2 (`780 × 1700` pixels for a full-stage export). The approved historical source is not stretched to that ratio. Existing runtime `390 × 844` remains unchanged until the dedicated cutover.
- Explicit vertical anchor: **bottom**. Essential controls and information must fit the bottom `390 × 710` window (`y 140–850` in the new master). Extra height belongs above the console. Do not reduce the whole game horizontally to fit short mobile viewports.
- Warm cream shell, restrained wear, dark green CRT surfaces and a simple crop-safe room ambience above/behind the machine.
- Exact `10 × 20` board, with one common square cell geometry. The engine, not the generated image, owns grid coordinates. Decorative frames and result labels must not consume a board column.
- Main display header: **TARGET**, not SCORE. The target has a wide, readable numeric field. Test `50`, `50000`, `100000`, `170000` and `9999999`, with consistent glyph proportions and spacing; never squash characters horizontally.
- Left rail: **LEVEL**, one small MiniFugg mark in the freed former target location, **NEXT**, **NEXT+1**. No second TARGET panel. LEVEL displays at least two digits (`01`, `03`, `09`, `10`, `99`); do not truncate `100` or cap game progression to fit two characters.
- Preview windows remain mini CRTs. Immediate NEXT has a separate small marker/arrow. Center actual piece bounds and fit a horizontal four-cell I piece.
- Regular number tiles `1–9` share one muted pale-green phosphor family, with restrained scanline influence. No color coding by digit.
- Operators use the same square cell geometry: one warm muted multiplier family, amber dividers, cyan reverse/specials. The inconsistent tints in the mockup are not authoritative.
- **All game numbers are raster glyphs/tiles selected and composed by Phaser.** This includes cell digits, LEVEL, TARGET and calculation results. Do not reintroduce system-font text over the artwork. Values stay live; glyph artwork is reusable and exported with explicit frames, baseline and advance. Use `0–9` for readouts, but do not reintroduce zero-valued gameplay cells.
- Active piece receives only a small edge lift. Ghost is a low-alpha outline at the true collision-derived landing position, not at the illustrative position from the mockup.
- Calculate only full rows. Keep the board frozen while the scan follows operation order, shows intermediate totals and then the final result; only afterwards collapse rows. The nine-fives example in the approved image is not a valid gameplay state.
- Result placement may be adapted to the actual available space. A result outside the right edge is no longer mandatory if it clips or sacrifices the tenth column. Preserve a readable directional association with the calculated row.
- Four equal main buttons on one low row with consistent gaps: LEFT, RIGHT, rotate-left, rotate-right. **The left rotation control is counterclockwise; the right rotation control is clockwise**, with matching labels. The remaining reversed arrows in the flat image must not be copied into production.
- DOWN is smaller and centered below the movement pair. Its full touch target and label remain visible in the bottom-anchored composition.
- Shell title: `TetraMindFck` only; no Calc Drop suffix, registered mark or version copy. English functional labels only, no filler slogans or instructional microcopy.
- One small MiniFugg mark maximum. Use the canonical brand/mascot sources; the incidental generated creature is not a new canonical Fuggy reference. The decorative room contains no text.
- Core owns RETOUR and terminal screens. Reserve the overlay without moving it or baking it into the game artwork.

### Production ownership and first specimens

Authored raster: crop-safe room, clean shell with apertures, clean CRT/glass support where useful, button bases and raster glyph/label atlases. Phaser owns the numerical data, arithmetic, exact grid, sprite selection/position, previews, input, ghost, button states, scan and row-collapse motion. Do not bake live values, controls, paths or board states into a background and then draw them twice.

The 2026-09-19 preparation produced an inventory of 25 elements and three **technical review boards**, archived separately from the clean reference:

- `01-composition.png` — Drive `171vEdyI1uP5KvjBtK6iSTP5S5VtoHHnU`;
- `02-glyphes-commandes.png` — Drive `11zSXtChhQ5RmP1qw3n6enoINIhSvSiLM`;
- `03-calcul-mouvement.png` — Drive `1EnHa2W5LfydmzgFqejMcigi18hCOssV8`.

The cell-digit specimen isolates contours of `1–9` from the exact approved raster. The HUD `0–9` specimen is a newly constructed broad seven-segment proposal, not an exact source extraction. Both are **review specimens**, not approved final assets. PNG and WebP-lossless versions decode to identical RGBA pixels. No runtime references were changed in this preparation pass.

### Proposals still to validate

- A temporary calculation strip inside the main CRT, below and separate from permanent TARGET, outside the grid. This avoids the cramped right-edge callout without inventing a new score HUD.
- Proposed blockout only: square cell `23 × 23` logical units (`46 × 46` artwork pixels), board at `x124 / y206`, size `230 × 460`; TARGET at `116 / 153`, size `248 × 30`; calculation strip at `116 / 184`, size `248 × 20`. These measurements are not yet an accepted replacement master.
- Proposed physical button press: approximately 2 logical units down, 70 ms press / 90 ms release; stable pressed state during hold; reset on pointercancel, blur or deactivation. Reduced motion changes brightness without travel.
- Proposed calculation sequence retains approximately 1.18 seconds as the initial tuning reference; reduced motion shows result then wipe without sweep. Local lock pulse approximately 100 ms and level pulse approximately 180 ms are proposals, not new gameplay timing rules.

Show these proposals in the translation board and a representative mini-slice before the full raster pack. Keep missing sources marked missing. The prepared inventory still needs to be wired into the Production Lab UI; do not claim that publication or Release integration has happened.

### Scope of the TARGET decision

The visible goal is level progression through the current single-clear target, not a cumulative SCORE display. The large example values in the art do not approve a replacement target curve. Existing leaderboard scoring, saved scores and cover-unlock thresholds must be reconciled as a separate product change, not silently deleted in this art pass. Until then, preserve the current runtime rules and metric while preparing the TARGET-led presentation.

`ASSET_MANIFEST.md` records layer ownership, filenames, specimen status and validation gates. `GAME_STATUS.md` records the pending Lab/runtime work. No new full-game approval is inferred from this DA approval.

## Welcome illustration direction

TetraMindFck is the pilot for `docs/WELCOME_ILLUSTRATIONS.md`.

Core idea to communicate:

- tetromino-like pieces falling under pressure;
- arithmetic / mental overload;
- a person or mind breaking, fracturing or exploding;
- expressive human illustration rather than glossy generic AI rendering;
- late-80s / early-90s European game-cover credibility, with alternate editorial/cultural editions.

Approved full-resolution production directions so far:

1. `pulp-euro` — hand-painted / ink-pulp psychological overload;
2. `micro-euro` — believable European micro-computer cover language;
3. `graphic-poster` — authored graphic/poster interpretation.
4. `japanese-edition` — nervous violet/orange commercial manga print.

These exact flat originals are the visual authority for the static-cover migration. The migration is a technical adaptation, not a new art pass: preserve the subject, title, framing, palette, medium and global composition. Only remove non-title copy and extend the existing subject or environment below the original when the `390 × 844` canvas requires it. The extension must read as continuous authored artwork, never as a blank or featureless dark band.

General paper grain, worn ink or paint texture may remain part of an edition's medium. Do not add a simulated old-box frame, distressed perimeter or damaged corners: the artwork must remain full bleed so responsive crops do not reveal a fake physical edge.

The Chinese edition remains a possible later exploration. It is not part of the current production set.

Only promote a cultural edition into the production variant list once a proper standalone full-resolution master has been created and verified through the current asset pipeline. Do not use cropped concept boards as production artwork.

The Japanese direction has been recovered in `GFX/crea-chatgpt/game/ChatGPT Image 5 sept. 2026, 19_27_48 (1).png`, top-row variant 4. It belongs to the same comparative board as the three approved families and is therefore the preferred visual lead: energetic manga drawing, low expressive character, diagonal cascade of pieces, violet/blue printed ground, orange figure and integrated vertical typography. The board crop is not a production master and must not be upscaled or reinterpreted loosely.

On 2026-09-12 the user approved, as style references, the full first row of that board and its `PUB 90s` study. Preserve their differences instead of averaging them into a house look:

- `pulp-euro`: broad painted/inked marks, jagged title, imperfect terrified adult and frontal cranial eruption;
- `micro-euro`: rigid commercial hierarchy, cold blue technical chamber, open-head mechanism and warmer painted anatomy;
- `graphic-poster`: cream stock, reduced black/orange geometry, large negative field and profile used as a symbolic cut shape;
- `japanese`: nervous manga ink, frightened young figure low on a diagonal, orange clothing, indigo/violet field, hard-perspective avalanche and large yellow katakana title;
- `pub-90s`: real micro-magazine page architecture—loud masthead, tilted CRT/screenshot, unequal cover-line scales, rules and four-color ink—not decorative UI pasted on an illustration. Future editorial copy must be English and explicitly listed before generation.

The boards `(2)` through `(6)` of the same `19_27_48` series were also recovered. Their Japanese studies range from magenta/blue frontal manga to cream ink, blue/red psychological collapse and orange/violet manga pulp. They document the breadth of the regional family but do not supersede board `(1)`, top-row variant 4, as the primary composition.

The standalone reconstruction in `GFX/crea-chatgpt/game/tetramindfck/japanese-research/` was explicitly accepted by the user on 2026-09-12. It keeps only the exact localized title `テトラマインドファック`, removes the former side copy, CTA, arrow, MiniFugg mark and physical frame, and continues the orange figure through the expendable lower crop zone. The verified source, master and runtime derivative are now the fourth production edition.

## Static cover migration

TetraMindFck covers are static raster art rendered by Core. The former animated layer bundles and runtime were removed after the original three static editions were accepted. The fourth Japanese edition is also a single static raster. For `pulp-euro` and `micro-euro`, the exact approved flat poster remains the authority rather than any reconstruction from the old layer stack.

## Interaction

The playable CTA is the live Core **JOUER** control. Do not bake `SWIPE TO PLAY`, an arrow or a MiniFugg button/logo into the cover.

The cover art may continue beneath Core controls. Only the title/logo of the game must stay clear of the overlapping bottom JOUER button; no multi-height exclusion mask is required for the other controls.

The welcome screen owns the first forward gesture outside the protected Core gutter:

- swipe up with a finger;
- wheel/trackpad down;
- `ArrowDown`.

That first gesture moves the cover upward and reveals **TetraMindFck itself**. It must not send the player directly to the next feed slot.

The Core bottom swipe gutter remains available as the explicit feed escape path.

## Unlocks

Current pilot thresholds:

- pulp-euro: default;
- micro-euro: 5,000 best score;
- graphic-poster: 15,000 best score;
- japanese-edition: 30,000 best score.

The pilot currently stores best-score unlock state locally. A future platform/profile implementation may sync unlocks across devices.

## Asset rules

Follow `docs/ASSET_PIPELINE.md` exactly. Codex-local production uses `public/assets/generated/...`; the private Drive sync route is reserved for ChatGPT sessions without local repository access. Preserve the approved flat source separately from its master and runtime derivative.

For each final cover, preserve the approved flat source and produce only the static master and verified runtime derivative required by the current Cover contract.

## Music direction

TetraMindFck music is reactive chiptune, not a flattened background track. Preserve a late handheld-console / 8-bit DNA, but allow modern arrangement and layering.

The composition should make the game's arithmetic theme perceptible in the musical structure:

- powers-of-two density increases as the game accelerates;
- prime-number accents such as 2/3/5/7;
- Fibonacci-derived timing or phrases where they remain musical;
- multiplication/division expressed by doubling or halving durations / intervals;
- modulo or small-polyrhythm patterns for mounting cognitive pressure;
- layers enter progressively on musical boundaries;
- tempo rises with game speed but is capped before becoming unreadable;
- escalation is rhythm-first rather than an accumulation of competing melodies;
- the maximum-speed state becomes computational and frantic without losing the core groove.

### Tempo-aware arrangement rule

Increasing the game level is **not** permission to play the exact same parts faster. Every important tempo band may use a different arrangement of the same composition.

- As BPM rises, melodic event density should normally decrease: longer notes, fewer attacks and clearer phrases.
- A part that becomes muddy at the new tempo should be simplified, disabled or replaced by a different layer with the same musical function.
- High-speed arrangements may remove earlier arpeggios / ornamentation entirely and replace them with a slower hook, syncopated bass or more readable rhythmic voice.
- Bass and main percussion remain the physical timing anchor for the player's clicks; they should feel strong and legible rather than merely decorative.
- Extra percussion must create pulse and pressure without turning into broadband noise.
- Level transitions should preserve musical identity while allowing the orchestration to change substantially.

The selected Tetra compositions use a **48-bar long-form cycle** so the music has enough time to breathe even at maximum tempo. The target form is:

1. 8 bars — introduction / establishment;
2. 8 bars — rise;
3. 8 bars — recognizable refrain;
4. 8 bars — descent / breakdown;
5. 8 bars — rebuild;
6. 8 bars — final refrain / lift.

At 170 BPM this is still about 68 seconds; at level-1 tempo it is about 2 minutes 38 seconds. The musical sections must be audible through changes in density, groove and motif, not only by adding more simultaneous tracks.

Both `MF-MUS-0001 Reactive Arithmetic v1` and `MF-MUS-0002 Prime Cascade` are currently selected production arrangements. Runs alternate between them deterministically.

Music begins at level-1 intensity while the welcome cover is visible whenever browser autoplay policy allows it. Sliding the cover away must not restart or interrupt the loop; gameplay continues from the same musical state and then follows the live level.

## Sound-design direction

TetraMindFck is also the reference game for the first shared MiniFugg SFX vocabulary documented in `docs/MUSIC_LAB.md`.

Use the common semantic sounds for:

- move;
- rotate;
- deliberate soft drop;
- landing / locking a piece;
- level-up;
- failure/end.

Tetra applies a slightly lower, tighter accent to those shared sounds instead of replacing their identity.

Game-specific signatures:

- `MF-SFX-0008 Arithmetic Scan` — line calculation;
- `MF-SFX-0009 Times Two` — arithmetic bonus;
- `MF-SFX-0010 Big Number Thump` — unusually large result.

Mixing rules:

- keep movement feedback extremely short and quiet;
- do not sonify every automatic falling tick;
- landing should feel tactile rather than explosive;
- calculation sounds may be more distinctive but must sit behind the music;
- level-up uses the common MiniFugg progression signature;
- avoid piercing high-register beeps and long arcade jingles;
- sound effects should give the blocks physical and mathematical presence without becoming a second soundtrack.

All music and SFX identities stay visible in the shared Audio Lab at `/?usr=moigod&lab=music` and follow the preservation rules in `docs/MUSIC_LAB.md`.
