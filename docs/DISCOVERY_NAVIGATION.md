# MiniFugg — Discovery, Cover Navigation & Play Entry

This document is the product contract for browsing games, entering a game from its cover, and adapting discovery to the player's coin state.

Read together with:

- `docs/PLATFORM_ECONOMY.md` for balances, costs and Free Play;
- `docs/WELCOME_ILLUSTRATIONS.md` for Fugg/Bêta/Caca cover production;
- `docs/PLATFORM_ART_DIRECTION.md` for Core identity;
- `docs/PLATFORM_ENTRY_SCENES.md` for the cold-open before discovery.

This is a **MiniFugg Core** system. Individual games must not reimplement it.

---

## 1. Core discovery model

MiniFugg is **not** a conventional storefront grid, card feed or app-store catalog.

After the platform cold-open, the player lands directly on **one full-screen game cover**. The cover is the primary discovery surface.

Only one game is visually dominant at a time.

Do not replace this with:

- rows of game cards;
- tiled storefronts;
- a generic launcher dashboard;
- several equal-weight covers visible at once.

The cover is the object. Navigation is spatial and gestural.

---

## 2. Spatial gesture grammar

While a game cover is active:

- **finger moves upward** → previous game cover;
- **finger moves downward** → next game cover;
- **finger moves left** → play / open the current game;
- **finger moves right** → details / community for the current game.

This grammar is intentional and should remain stable once production ships.

Desktop equivalents may mirror it when appropriate:

- wheel / vertical trackpad → browse previous/next;
- horizontal trackpad or drag → play/details;
- keyboard arrows may mirror the same directions when they do not conflict with game controls.

The first horizontal play gesture belongs to the cover. Gameplay input begins only after the play-entry transition is complete.

---

## 3. Coin balance must stay visible while browsing

For a normal free player, the current **combined coin balance** remains visible while vertically browsing covers.

It should be compact and persistent rather than repeated inside every cover.

The user should always understand whether a visible game is immediately playable and what it costs.

Lifetime / Free Play users may show `∞` instead of a decrementing balance.

The balance remains one unified player-facing number. Internal daily/durable composition is defined in `docs/PLATFORM_ECONOMY.md`.

---

## 4. Play cost by curation status

Current production rule:

| Internal status | Player-facing treatment | Cost per play |
| --- | --- | ---: |
| `fugg` | finished premium Fugg cover | **2 coins** |
| `beta` | generic Bêta cover template | **1 coin** |
| `trash` | generic Caca cover template | **0 coins / free** |

A replay is another play and uses the same status cost unless a future Core rule explicitly grants a free retry.

Individual games never decide or charge this cost themselves.

Recommended CTA copy:

- Fugg: `PLAY · 2 COINS`
- Bêta: `PLAY · 1 COIN`
- Caca: `PLAY · FREE`
- Lifetime / Free Play: `PLAY · FREE PLAY` or an equivalent concise unlimited-state treatment.

The CTA performs the same action as the leftward play gesture; it is not a separate navigation path.

---

## 5. Coin-aware discovery weighting

Discovery deliberately changes when a free player's usable coin balance reaches zero.

### Balance greater than zero

Default discovery strongly prioritizes finished Fugg games.

Target mix:

- roughly **90% Fugg**;
- roughly **10% Bêta**;
- Caca games normally stay out of the standard weighted rotation while coins remain available.

This is a product target, not a requirement to create obvious deterministic ten-item blocks. Weighting may adapt to catalog size, repetition avoidance and direct links.

### Balance equals zero

The player must still be able to browse and play MiniFugg.

Target mix:

- roughly **50% Caca**;
- roughly **50% Fugg/Bêta combined**.

The paid Fugg/Bêta covers remain visible even though the current balance cannot launch them. This keeps the real catalog discoverable while Caca provides a free fallback playground.

Direct navigation to a specific game always remains possible regardless of weighting.

Lifetime / Free Play users are never treated as out-of-coins.

---

## 6. Curation status is mostly internal

Do not put a generic `FUGG` badge on finished games merely to expose internal curation state.

The visible difference comes from the **cover system itself**:

### Finished Fugg

- full authored / collectible cover treatment;
- may have multiple unlockable cover variants;
- no compulsory visible `FUGG` status badge.

### Bêta

Use one shared Bêta template family.

Per-game customization should be minimal but sufficient:

- game title / logo;
- optionally one small representative visual element if useful;
- translated live copy explaining that the game is playable but unfinished;
- explicit invitation to comment / report problems;
- `PLAY · 1 COIN` CTA.

### Caca

Use one shared Caca / Boîte à Caca template family.

Per-game customization should be minimal:

- game title / logo;
- optionally one small representative visual element;
- translated live copy explaining the experimental / broken / dubious state;
- playful warning that it may never leave the box;
- `PLAY · FREE` CTA.

The humor can be strong, but the template should still look intentionally designed rather than accidentally broken.

---

## 7. Internationalization contract

Separate **art text** from **interface/state text**.

### Cover artwork

- Default authored Fugg cover language is **English**.
- A deliberately localized cultural edition may contain another language as part of that specific artwork.
- Do not automatically regenerate every cover for every UI locale.

### Live UI / mutable copy

Anything that can change by status, locale, price or platform state must remain live UI text whenever practical.

Examples:

- Bêta explanation;
- Caca warning;
- comment/help request;
- coin price CTA;
- out-of-coins explanation;
- community/detail labels;
- accessibility copy.

Do **not** bake these changing sentences into the raster background.

Bêta/Caca templates should therefore be composed as:

1. reusable visual background/template layer;
2. per-game title/logo asset;
3. live translated text and CTA above it.

This is required so MiniFugg can add languages without redrawing every status cover.

---

## 8. Play entry should feel like opening the game object

Playing should not feel like clicking a generic web button.

The cover is treated metaphorically like the front/lid of a game box.

On leftward play gesture or CTA activation:

1. user commits to play;
2. required coin cost is validated by Core;
3. if playable, trigger a short **coin insertion / clang** sound for paid plays;
4. the cover starts to move sideways/open like a lid or sleeve;
5. the actual game is revealed behind/inside it;
6. the cover exits completely;
7. gameplay becomes active.

The exact visual mechanic can be tested. Promising options include:

- lateral sleeve reveal;
- shallow 3D lid hinge;
- cover split / box opening;
- perspective peel with the game already visible underneath.

Keep the transition short, readable and tactile. Do not turn every launch into a long cinematic.

For Caca (`0 coins`), keep the opening ritual but omit the paid-coin debit. A different small free/junk-box sound may be explored later if useful.

Every authored coin/opening SFX must follow `docs/MUSIC_LAB.md`.

---

## 9. Details/community side

The rightward gesture is reserved for game context rather than launching another generic page.

Exact community design is intentionally still open, but the spatial model is fixed:

- center = cover / promise;
- left = play / enter;
- right = details / community;
- vertical = previous / next game.

The details view should remain visually anchored to the current game and should be able to return naturally to its cover.

Do not finalize community information architecture merely to fill a concept board.

---

## 10. Concept-board requirement

Future platform UI concept boards must show the **actual MiniFugg discovery grammar**, not a generic app-store feed.

At minimum show:

1. cold-open / entry scene;
2. full-screen Fugg cover with visible coin balance;
3. vertical transition between two covers;
4. leftward play/open-box transition;
5. actual game revealed behind the cover;
6. rightward details/community state;
7. Bêta template example;
8. Caca template example.

When comparing platform art directions, the information architecture must stay true to this contract. Do not change the product model just to make a familiar-looking mockup.

---

## 11. Current decisions locked

- discovery unit = one full-screen game cover;
- vertical browsing = previous/next cover;
- left = play;
- right = details/community;
- free-player coin balance remains visible during browsing;
- Fugg = 2 coins;
- Bêta = 1 coin;
- Caca = free;
- with coins: strongly Fugg-weighted, ~1 Bêta in 10;
- at zero coins: ~1 Caca in 2, remaining slots Fugg/Bêta;
- no compulsory visible Fugg badge;
- Bêta/Caca use generic reusable cover templates with a per-game title/logo;
- mutable/status text stays live and translatable;
- authored Fugg cover art is English by default unless intentionally localized;
- play transition should evoke inserting a coin and opening a game box.
