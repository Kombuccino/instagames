# MiniFugg — Welcome Illustrations System

Living production specification for game cover art and status templates.

Read together with:

- `docs/DISCOVERY_NAVIGATION.md` for the cover-browsing / play / details gesture grammar;
- `docs/WELCOME_ART_STYLES.md` for reusable Fugg cover styles;
- `docs/PARALLAX_LAB.md` for layered cover tuning;
- `docs/ASSET_PIPELINE.md` for image production and import.

This document no longer defines the global platform home/cold-open. Platform entry is defined in `docs/PLATFORM_ART_DIRECTION.md` and `docs/PLATFORM_ENTRY_SCENES.md`.

---

## 1. Product intent

A finished Fugg can be introduced like a tiny game with an absurdly ambitious premium cover: collectible, authored, memorable and often more elaborate than the actual in-game graphics.

The cover is also the primary MiniFugg discovery object. One cover fills the discovery viewport at a time.

The navigation/launch contract is **not** `SWIPE TO PLAY ↑` anymore.

Current Core grammar:

- vertical movement = browse previous/next cover;
- leftward movement = play/open current game;
- rightward movement = details/community.

The visible play CTA must reflect current cost and perform the same action as the leftward gesture.

---

## 2. Curation status rule

Creative collectible welcome art is reserved for games with `status: 'fugg'`.

Do not expose a generic Fugg status badge simply because the internal game is curated.

### Fugg

A finished/curated game gets the premium cover system:

- minimum 4 illustrated variants as a target;
- variants may use different artistic and cultural interpretations;
- variants may unlock through score / achievements / progression;
- parallax/motion may use real separated raster layers;
- default authored cover language is English unless the variant is intentionally localized;
- live MiniFugg UI overlays remain localizable.

### Bêta

A Bêta does **not** get the premium 4-cover system.

Use one reusable MiniFugg Bêta template family with minimal per-game customization:

- game title/logo required;
- optional tiny representative visual if useful;
- reusable background/template;
- live translated explanation that the game is playable but unfinished;
- live translated request for comments / bug reports;
- live `PLAY · 1 COIN` CTA.

Do not bake the explanatory Bêta sentences into the raster artwork.

### Caca (`status: 'trash'` in code)

A Caca game uses one reusable Caca / Boîte à Caca template family instead of premium collectible art.

Per-game customization:

- game title/logo required;
- optional tiny representative visual;
- reusable background/template;
- live translated warning that the game is experimental, broken, weird or abandoned;
- playful copy saying it may never leave the box;
- live `PLAY · FREE` CTA.

The source-code status remains `trash` for compatibility unless explicitly migrated later; UI copy may use **CACA** / **BOÎTE À CACA**.

The humor can be strong but the template should still be intentionally designed.

---

## 3. Internationalization

Separate immutable authored art from mutable/localized product text.

### Fugg artwork

- English is the default language for authored covers.
- A Japanese/Chinese/etc. edition may intentionally contain local language as part of that specific artwork.
- Do not automatically redraw all covers for every UI locale.

### Live UI text

Anything dependent on locale, game status, coin cost or platform state should remain live text whenever practical.

Examples:

- Bêta explanation;
- Caca warning;
- comment/help request;
- play price;
- out-of-coins message;
- accessibility labels;
- details/community labels.

For Bêta/Caca, compose the cover from:

1. template background;
2. per-game title/logo;
3. live translated copy + CTA.

---

## 4. Standard Fugg variant set

Each Fugg should target at least four official variants.

1. **Hero / narrative illustration** — strong character or dramatic story moment.
2. **European retro / micro-computer cover** — believable late-80s/early-90s commercial game packaging language.
3. **Graphic poster / editorial interpretation** — more conceptual, authored and composition-driven.
4. **Foreign edition / cultural reinterpretation** — Japanese, Chinese, Korean, Eastern-European, etc.

Extra cultural editions can become rare bonus unlocks later.

---

## 5. Anti-AI visual rules

Avoid the generic AI look:

- no mandatory neon/synthwave background;
- no repeated identical mockup frame across every game;
- no glossy plastic 3D finish by default;
- no cinematic bloom everywhere;
- no automatic centered hero + floating objects + giant-title template;
- do not over-fill images merely to demonstrate detail.

Prefer visible human decisions:

- clear medium (ink, gouache, acrylic, collage, print, etc.);
- imperfect texture;
- limited / intentional palette;
- asymmetric or editorial compositions when appropriate;
- designed typography;
- believable print artifacts and grain;
- strong negative space when useful.

European late-80s / early-90s illustrated game advertising is a useful language for some variants, not the permanent MiniFugg platform style.

---

## 6. Cultural editions

Cultural variants must feel like plausible local editorial reinterpretations, not tourist caricatures.

Examples:

- Japanese edition: energetic hierarchy, vertical rhythm, local editorial influence where appropriate;
- Chinese edition: alternative hierarchy, symbolic composition or print language appropriate to the concept;
- Korean edition: sharper / modern / technical energy where useful;
- Eastern-European edition: conceptual poster language, reduced palette, stronger graphic abstraction.

Do not imitate a named living artist. Use broad historical/editorial visual languages.

---

## 7. Motion and parallax

Welcome covers are primarily authored static art with restrained motion.

For a Fugg cover claiming parallax, visible moving elements must be real raster assets. Do not fake important cover props with CSS shapes or generic JS particles.

A finished parallax cover should normally include:

1. flat master poster;
2. background layer;
3. midground layer;
4. foreground/subject layer;
5. overlay/title layer.

The exact layer count may vary, but all layers should share compatible dimensions/alignment.

Runtime behavior may include:

- smallest displacement in background;
- medium displacement in midground;
- strongest displacement in foreground;
- title/CTA nearly fixed;
- one or two local motions (`float`, `vibrate`, `breathe`, etc.);
- optional CSS light/vignette because those are effects, not replacement artwork;
- pause when slot is inactive;
- `prefers-reduced-motion` support.

Layer tuning belongs in the desktop Parallax Lab.

---

## 8. Discovery and play transition

The cover is part of the Core discovery system.

Do not intercept vertical browsing to open gameplay.

Current interaction contract is defined in `docs/DISCOVERY_NAVIGATION.md`:

- finger moves upward → previous cover;
- finger moves downward → next cover;
- finger moves left → play/open;
- finger moves right → details/community.

The free-player coin balance remains visible while browsing.

Current prices:

- Fugg = 2 coins;
- Bêta = 1 coin;
- Caca = free.

When play is committed, the cover should behave like a physical game object being opened rather than a generic webpage disappearing.

Promising launch language:

- short metallic coin `clang` for paid plays;
- cover/lid/sleeve moves sideways;
- shallow perspective or box-opening motion;
- actual game is already visible behind/inside;
- transition is short and tactile.

Do not turn every launch into a long cinematic.

---

## 9. Asset strategy

### Master

Keep original generated/final art untouched and lossless. Never silently resize/recompress the production original.

For parallax bundles, preserve transparent PNG masters for alpha layers.

### Runtime

Runtime derivatives may be WebP when quality/weight is acceptable. Original masters remain preserved.

Typical portrait cover target: around 9:16, with important title content kept away from crop-sensitive edges.

### Canonical pipeline

For every production image/layer:

1. read `docs/ASSET_PIPELINE.md`;
2. finalize art and production filename;
3. upload to private Drive `Fugg/<game-id>/...` or documented platform folder;
4. optionally add optimized WebP while preserving master;
5. wait for / verify GitHub Actions import;
6. verify every referenced file exists in `public/assets/imported/...`;
7. reference only `/assets/imported/...` in the app.

Never use public Drive links, FTP, manual binary GitHub upload or base64 chunking while the pipeline is available.

---

## 10. TetraMindFck pilot

TetraMindFck remains the first production pilot for the collectible Fugg cover/parallax system.

Gameplay concept the covers represent:

- falling tetromino-like pieces;
- arithmetic / mental overload;
- a person/mind under pressure;
- game name **TetraMindFck**, never `Calc Drop` on marketing art.

Approved directions include:

- expressive hand-painted / pulp poster;
- retro European micro-computer cover;
- graphic / Eastern-European poster treatment;
- cultural edition candidates such as Japanese/Chinese.

The first pulp cover remains the reference implementation for real parallax bundles.

Its approved layer config is tuned through the Parallax Lab and stored in production code after user validation.

---

## 11. Production checklist

Before calling a Fugg cover finished:

- standalone flat master approved;
- title readable;
- cover art language intentional;
- parallax decomposition planned if motion is promised;
- real raster layers produced as needed;
- all layers share compatible dimensions/alignment;
- PNG masters preserved;
- runtime WebP derivatives produced when useful;
- files uploaded through private Drive `Fugg` hierarchy;
- runtime paths verified in `public/assets/imported/` before code references;
- vertical discovery remains available;
- leftward play/open transition works;
- rightward details gesture remains available;
- coin balance/price UI is live, not baked into art;
- reduced-motion behavior tested.

For Bêta/Caca templates additionally verify:

- title/logo exists for every game;
- status explanation is live/localizable;
- background/template contains no language-dependent sentence that needs runtime translation;
- correct cost is shown (1 coin / free).
