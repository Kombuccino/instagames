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

- subtle parallax between 2–3 planes;
- `SWIPE TO PLAY` arrow gently rises / pulses;
- one or two local animated motifs: smoke, light flicker, floating object, glow, reflection, particles;
- optional very slow breathing light / vignette.

Avoid full-screen perpetual motion and expensive video when a few transforms can create life.

### Preferred implementation

Use lightweight runtime effects first:

- CSS `transform` / `opacity`;
- pointer/device tilt parallax only when it remains comfortable and optional;
- lightweight JS / requestAnimationFrame only for effects that need it;
- pause effects when the game slot is not active;
- respect `prefers-reduced-motion`.

Do not block the MiniFugg vertical feed gesture. The welcome surface must preserve the Core swipe escape contract.

## 7. Asset strategy

### Master

Keep the original generated/final art untouched and lossless. Never silently resize/recompress the production original.

Accepted importer formats are PNG, JPEG and WebP. The canonical pipeline is documented in `docs/ASSET_PIPELINE.md`.

### Runtime

The importer currently preserves the source file; optimization can be added as a separate explicit pipeline step later.

For final web optimization, preferred targets are WebP or AVIF where the deployment pipeline supports them. Until the asset pipeline explicitly supports AVIF input, upload a supported master (normally PNG/WebP) and do not bypass the pipeline.

Typical portrait artwork target: around 9:16, with important title/CTA content kept away from crop-sensitive edges.

## 8. Canonical asset pipeline

For every MiniFugg production image:

1. create/finalize the art;
2. give it a unique ASCII production filename;
3. upload the original to the private Google Drive `Fugg` inbox;
4. wait for / verify GitHub Actions import;
5. verify the file exists in `public/assets/imported/`;
6. reference it only as `/assets/imported/<filename>` in the app.

Never use a public Drive link, FTP, manual binary GitHub upload, or base64 chunking while this pipeline is available.

## 9. TetraMindFck pilot

TetraMindFck is the first production pilot for this system.

Gameplay concept that the welcome art must represent:

- falling tetromino-like pieces;
- arithmetic / mental overload;
- a person or mind under pressure, fracturing, exploding or being overwhelmed;
- the game name is **TetraMindFck**, never `Calc Drop` on marketing art.

Existing approved direction experiments:

- expressive hand-painted / pulp poster with a mind exploding;
- retro European micro-computer cover;
- graphic / Eastern-European poster treatment.

Foreign-edition candidates to explore include Japanese and Chinese treatments.

### Initial unlock proposal

Keep values easy to tune in registry/config rather than hard-code them in artwork:

- variant 1: unlocked by default;
- variant 2: score milestone 5,000;
- variant 3: score milestone 15,000;
- variant 4: score milestone 30,000.

Additional rare editions can use higher thresholds or achievements later.

## 10. Global MiniFugg home

The global MiniFugg home should eventually use the same authored philosophy rather than a generic glossy AI landing page.

Plan for several rotating home interpretations, for example:

- strange European workshop / editorial illustration;
- retro game-magazine ad;
- graphic poster edition;
- international edition.

These are platform-level visuals, not tied to one game's unlock score.

## 11. Production order

1. Finish TetraMindFck art candidates.
2. Import approved masters through Drive -> GitHub.
3. Add a reusable Fugg welcome-screen component.
4. Add simple Fugg unlock persistence based on best score.
5. Add subtle parallax / micro-motion.
6. Add generic Bêta and Caca status intros.
7. Apply the system to the next Fugg games.
8. Rework the global MiniFugg home using the same authored approach.
