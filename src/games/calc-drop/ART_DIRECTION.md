# TetraMindFck — Art Direction

## Gameplay direction — approved 2026-09-12

The former neutral gameplay prototype is now superseded by a **retro portable-console / green CRT** direction for the Phaser gameplay surface.

Visual reference accepted by the user in the 2026-09-12 ChatGPT art iteration: cream late-90s handheld body, one dominant green CRT/LCD screen, narrow left status rail, washed phosphor tiles and tactile physical controls. The generated mockup remains **REFERENCE ONLY** because its board state, score, HUD values and controls are baked. Production must reconstruct the system in layers rather than use the flat image as runtime art.

### Gameplay visual contract

- Fixed logical stage `390 × 844`; phone remains the complete composition.
- Warm cream handheld shell, restrained wear, dark green CRT surfaces and a simple crop-safe room ambience above/behind the machine.
- The `10 × 20` board is the dominant surface; no decorative nesting may reduce digit size unnecessarily.
- Main CRT: one frame only. `SCORE` sits above the board inside the display and must accommodate multi-million values.
- Left rail: `LEVEL`, `TARGET`, `NEXT`, `NEXT+1`; preview windows are mini CRTs. The immediate `NEXT` gets a small marker/arrow. Preview layout must handle the four-cell I piece.
- Regular numeric cells `1–9` are not color-coded. They share one muted pale-green CRT/phosphor family, with low brightness and visible scanline influence.
- Operators and bonuses keep the exact same square geometry as numbers; only restrained tint distinguishes them: warm muted multiply, amber divide, alternate cyan/special.
- Every tile is snapped to the exact board grid and rendered as part of the screen, never as glossy plastic bricks placed over it.
- Active piece may receive a small edge lift; ghost remains a low-alpha grid-aligned outline.
- Clear animation keeps the board frozen until the scan ends. Intermediate totals follow calculation order; final result appears outside the row in the calculation direction; only then do cleared rows collapse.
- Controls: four equal main buttons on one low row with minimal consistent gaps — `LEFT`, `RIGHT`, rotate-left, rotate-right. `DOWN` is smaller and centered beneath the movement pair. Buttons stay within CENTRE.
- Functional text is English only. No filler slogans, no instructional microcopy, no repeated branding. One MiniFugg mark maximum in the gameplay artwork.
- Decorative room/background contains no text.

### Production ownership

Authored raster later: crop-safe room ambience, clean shell, shared physical button base and optional CRT glass highlight. Phaser owns all values, labels, grid geometry, cells, previews, score, operators, scanlines, ghost, line-clear FX and button-state movement.

The first integration pass intentionally uses Phaser geometry for the shell/control blockout so composition and readability can be validated before raster production. Once accepted, authored source masters are created losslessly and runtime derivatives use WebP lossless by default. PNG is source/master only; AVIF is reserved for large opaque static art after decode/quality validation.

`ASSET_MANIFEST.md` is the production contract for layer ownership, states, filenames and FX recipes.

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
