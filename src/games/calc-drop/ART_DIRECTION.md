# TetraMindFck — Art Direction

## Gameplay surface

Preserve the current TetraMindFck gameplay visual language unless a later prompt explicitly asks for an in-game redesign. The welcome-screen work is a separate marketing/editorial layer in front of the game.

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

Foreign-edition candidates being explored:

- Japanese edition;
- Chinese edition.

Only promote a cultural edition into the production variant list once a proper standalone full-resolution master has been created and imported through the Drive asset pipeline. Do not use cropped concept boards as production artwork.

## Motion / parallax

Every TetraMindFck cover intended to use parallax must have **real generated raster layers**. Do not invent important visible parallax objects with CSS geometry or generic JS particles.

Reference decomposition for `pulp-euro`:

- background/environment;
- burst + tetromino objects;
- foreground character;
- title/logo/`SWIPE TO PLAY ↑` overlay.

All layers should share the same canvas size/alignment. PNG masters stay untouched; verified WebP derivatives may be used at runtime.

Runtime motion stays restrained:

- background moves least;
- midground objects move moderately;
- foreground subject moves most;
- title/CTA stays nearly fixed;
- very subtle layer drift may run on touch devices;
- optional light/vignette may be CSS because it is an effect, not substitute artwork.

Motion must pause when the feed slot is inactive and must respect `prefers-reduced-motion`.

## Interaction

Primary CTA: `SWIPE TO PLAY ↑`.

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
- future foreign edition: target 30,000 best score.

The pilot currently stores best-score unlock state locally. A future platform/profile implementation may sync unlocks across devices.

## Asset rules

Follow `docs/ASSET_PIPELINE.md` exactly. Masters are uploaded untouched to the private Drive `Fugg` folder and referenced only after the synced file exists under `public/assets/imported/`.

For each new cover, complete the flat poster **and** the parallax layer bundle before calling the animated welcome version finished.

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
