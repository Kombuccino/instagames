# MiniFugg — Welcome Illustrations System

Living production specification for game welcome screens and the global MiniFugg home. Update this file when the art direction or product rules change.

## 1. Product intent

MiniFugg games are deliberately tiny, but a finished game can be introduced like a lost premium game from another era: beautiful illustrated cover art, stronger and more ambitious than the actual in-game graphics.

The contrast is intentional. The welcome screen sells the fantasy; the game then reveals its real, simpler visual language.

Primary CTA on game covers:

**SWIPE TO PLAY ↑**

Never use `Tap to start` for this system.

## 2. Curation status rule

Creative collectible welcome art is reserved for games with `status: 'fugg'`.

### FUGG

A finished/curated game gets the full collectible system:

- minimum 4 illustrated variants;
- variants may use different artistic and cultural interpretations;
- unlock progressively through score / achievements / progression;
- unlocked variants remain available;
- selection may be random among unlocked variants or manually selectable later.

### BÊTA

A beta does **not** get the premium 4-cover system.

Use a simpler generic beta intro:

- small representative cover / thumbnail;
- very visible `BÊTA` status;
- explain that the game is playable but unfinished;
- explicitly ask players for comments and bug reports;
- CTA can still be `SWIPE TO PLAY ↑`.

Suggested tone: constructive and inviting, not apologetic.

### CACA (`status: 'trash'` in code)

A Caca game also gets a generic status intro instead of collectible artwork.

The intro should communicate:

- `CACA` / `BOÎTE À CACA` clearly;
- experimental, broken, weird or abandoned state;
- play at your own risk;
- it may never leave the box.

Tone can be funny and self-aware.

The source-code status remains `trash` for compatibility unless explicitly migrated later; UI copy should use **CACA**.

## 3. Standard Fugg variant set

Each Fugg should launch with at least four official variants.

1. **Hero / narrative illustration** — strong character or dramatic story moment.
2. **European retro / micro-computer cover** — believable late-80s/early-90s commercial game packaging language.
3. **Graphic poster / editorial interpretation** — more conceptual, authored and composition-driven.
4. **Foreign edition / cultural reinterpretation** — e.g. Japanese, Chinese, Korean, Eastern-European, etc.

The fourth slot may have multiple candidates in production. Only one needs to ship as the default fourth official variant; extra cultural editions can become rare bonus unlocks later.

## 4. Anti-AI visual rules

Avoid the generic AI look:

- no mandatory neon/synthwave background;
- no repeated identical mockup frame across every game;
- no glossy plastic 3D finish by default;
- no cinematic bloom everywhere;
- no automatic centered hero + floating objects + giant title template;
- do not over-fill images merely to demonstrate detail.

Prefer visible human decisions:

- clear medium (ink, gouache, acrylic, collage, print, etc.);
- imperfect texture;
- limited / intentional palette;
- asymmetric or editorial compositions when appropriate;
- designed typography;
- believable print artifacts and grain;
- strong negative space when useful.

European late-80s / early-90s illustrated game advertising is a useful base language, but not a single mandatory style.

## 5. Cultural editions

Cultural variants must feel like plausible local editorial reinterpretations, not tourist caricatures.

Examples:

- Japanese edition: energetic layout, stronger vertical rhythm, manga/editorial influence where appropriate;
- Chinese edition: alternative hierarchy, symbolic composition or print language appropriate to the concept;
- Korean edition: potentially sharper, modern/technical energy;
- Eastern-European edition: graphic/poster-oriented, conceptual, reduced palette.

Do not imitate a named living artist. Use broad historical / editorial visual languages.

## 6. Motion language

Welcome illustrations are primarily static art with restrained motion.

Default motion tier:

- real multi-plane parallax;
- `SWIPE TO PLAY` rises with the cover when entering the game;
- one or two local animated motifs from the actual artwork;
- optional very slow breathing light / vignette.

Avoid full-screen perpetual motion and expensive video when a few transforms can create life.

### 6.1 Mandatory parallax production bundle

For a Fugg cover with motion, **the visible moving elements must be generated/exported as real raster assets**. Do not fake important graphical elements with CSS shapes or generic JS particles.

Every finished parallax cover should normally include:

1. **flat master poster** — the approved full illustration, kept untouched for archive/reference;
2. **background layer** — scenery / painted environment without the main subject;
3. **midground layer** — explosion, props, smoke, tetrominos or other art that can move independently;
4. **foreground/subject layer** — character or dominant object, ideally transparent;
5. **overlay layer** — title, logo and `SWIPE TO PLAY ↑`, ideally transparent and moving very little.

The exact number may vary if the composition needs more/fewer layers, but there must be enough actual artwork to make depth visible. All layers should be generated at the same canvas size and alignment whenever possible so they stack without manual reconstruction.

### 6.2 Runtime implementation

Use the generated layers with lightweight transforms:

- background: smallest displacement;
- midground: medium displacement;
- foreground: strongest displacement;
- title/CTA: almost fixed;
- subtle raster-layer drift is allowed on mobile where there is no pointer hover;
- optional light/vignette may remain CSS because it is an effect, not replacement artwork;
- pause effects when the game slot is not active;
- respect `prefers-reduced-motion`.

The Core bottom swipe gutter remains an escape route. Outside that protected gutter, the welcome cover owns the **first forward navigation gesture**:

- finger swipe up → cover moves up and reveals the current game;
- mouse wheel down → cover moves up and reveals the current game;
- `ArrowDown` → cover moves up and reveals the current game.

That first gesture must never jump directly to the following game in the feed.

## 7. Asset strategy

### Master

Keep the original generated/final art untouched and lossless. Never silently resize/recompress the production original.

Accepted importer formats are PNG, JPEG and WebP. The canonical pipeline is documented in `docs/ASSET_PIPELINE.md`.

For parallax bundles, preserve transparent PNG masters for layers that need alpha.

### Runtime

Runtime derivatives may be WebP when quality/weight is acceptable. The original masters must still be preserved.

Typical portrait artwork target: around 9:16, with important title/CTA content kept away from crop-sensitive edges.

Current TetraMindFck tests show that same-resolution WebP derivatives can reduce multi-megabyte PNG masters to a few hundred kilobytes per layer/cover while preserving the intended visual quality.

## 8. Canonical asset pipeline

For every MiniFugg production image or parallax layer:

1. create/finalize the art;
2. give it a unique ASCII production filename;
3. upload the original to the private Google Drive `Fugg` inbox;
4. optionally create a runtime WebP derivative while keeping the master untouched;
5. upload the runtime derivative through the same Drive inbox;
6. wait for / verify GitHub Actions import;
7. verify every referenced file exists in `public/assets/imported/`;
8. reference it only as `/assets/imported/<filename>` in the app.

Never use a public Drive link, FTP, manual binary GitHub upload, or base64 chunking while this pipeline is available.

## 9. TetraMindFck pilot

TetraMindFck is the first production pilot for this system.

Gameplay concept that the welcome art must represent:

- falling tetromino-like pieces;
- arithmetic / mental overload;
- a person or mind under pressure, fracturing, exploding or being overwhelmed;
- the game name is **TetraMindFck**, never `Calc Drop` on marketing art.

Approved full-resolution directions:

- expressive hand-painted / pulp poster with a mind exploding;
- retro European micro-computer cover;
- graphic / Eastern-European poster treatment.

Foreign-edition style candidates already explored in concept boards:

- Japanese edition;
- Chinese edition.

Do **not** crop those concept boards into production art. A cultural edition must be regenerated/finalized as its own standalone full-resolution master before entering the Drive pipeline.

### TetraMindFck variant 1 parallax bundle

The first pulp cover is the reference implementation for future covers. Its production layers are:

- `tetramindfck-welcome-v1-parallax-bg.*`
- `tetramindfck-welcome-v1-parallax-burst.*`
- `tetramindfck-welcome-v1-parallax-subject.*`
- `tetramindfck-welcome-v1-parallax-title.*`

PNG masters are preserved; WebP counterparts are used at runtime after repository verification.

### Initial unlock thresholds

The pilot currently uses best-run score milestones:

- variant 1: unlocked by default;
- variant 2: 5,000;
- variant 3: 15,000;
- variant 4: target 30,000 once the cultural master is approved.

Unlocked state is currently persisted locally as a pilot. Cross-device/profile unlock persistence can move into the platform data model later.

## 10. Global MiniFugg home

The global MiniFugg home should eventually use the same authored philosophy rather than a generic glossy AI landing page.

Plan for several rotating home interpretations, for example:

- strange European workshop / editorial illustration;
- retro game-magazine ad;
- graphic poster edition;
- international edition.

These are platform-level visuals, not tied to one game's unlock score.

## 11. Production checklist for every new Fugg cover

Before calling a cover finished:

- standalone flat master approved;
- parallax decomposition planned before integration;
- real raster background generated;
- real raster midground/FX generated where useful;
- real raster subject/foreground generated where useful;
- real raster title/CTA overlay generated where useful;
- all layers share compatible dimensions/alignment;
- PNG masters kept untouched;
- runtime WebP derivatives produced if useful;
- every file uploaded through private Drive `Fugg`;
- every runtime path verified in `public/assets/imported/`;
- first swipe/wheel/ArrowDown opens the current game instead of scrolling to the next feed item;
- bottom Core swipe gutter remains free;
- reduced-motion behavior tested.

## 12. Current implementation state

Implemented on `main`:

- reusable `src/core/FuggWelcome.tsx` welcome layer;
- support for real raster `background / midground / foreground / overlay` assets;
- layered pointer parallax and subtle raster drift;
- cover exit animation that physically moves the cover upward before revealing gameplay;
- first wheel-down gesture is intercepted by the cover and opens the current game;
- `ArrowDown`, Enter and Space can enter from the cover;
- local touch swipe surface keeps the Core bottom swipe gutter free;
- TetraMindFck pauses gameplay until the welcome is dismissed;
- unlocked TetraMindFck covers rotate deterministically from the feed seed;
- best-run score persists locally for unlocks;
- generic BÊTA and CACA intro gates are wired to the games carrying those curation statuses.

The TetraMindFck pulp cover is the reference implementation for real parallax bundles. Variants 2 and 3 still use their flat posters until their own layer bundles are produced.
