# MiniFugg game curation

Every game can be assigned a developer-selected `status` in `src/core/gameRegistry.tsx`.

```ts
status: 'fugg' | 'beta' | 'trash'
```

## Tiers

### `fugg` — 🔥 Fugg

A game we are happy to put in front of a new player without qualification. It is fun, understandable, stable and polished enough to represent MiniFugg.

This is the default feed.

### `beta` — 🧪 Beta

A game with a worthwhile concept or good core loop that still needs work, balancing, polish or reliability improvements.

Players can opt into Beta games from their profile. A Beta with at least **50 loves** may also appear in the normal Fugg feed as a community breakout. The threshold is defined by `BETA_PUBLIC_LOVE_THRESHOLD` in `src/core/GameFeed.tsx`.

### `trash` — 💩 Grosse merde

A game we deliberately keep because the concept, experiment or history may still be interesting, but which is not good enough to recommend.

Trash games are never included in the normal or Beta feed. The player must explicitly choose `Tout, même les grosses merdes` in their profile, or open a direct game URL.

## Player preferences

The profile exposes three feed levels:

- `Fuggs` — Fugg games, plus Beta games that crossed the public-love threshold.
- `+ Beta` — Fugg + every Beta.
- `Tout` — Fugg + Beta + Trash.

The preference is local to the browser for now so it works independently of account/login state.

## Existing games

Legacy games without an explicit `status` are treated as `fugg` so adding the curation system never silently removes existing games from the feed. They should be reviewed and assigned an explicit tier when the developer decides their quality level.

## Principle

Do not delete a weak game only because it is weak. Curation exists so MiniFugg can preserve experiments without making new players wade through broken or unfun games.
