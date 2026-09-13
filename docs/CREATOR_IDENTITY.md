# MiniFugg — Creator identity

Canonical Core decision from 13 September 2026.

MiniFugg currently has one house creator identity: **Fuggy**. Fuggy is the canonical MiniFugg mascot and is used publicly as the creator name/pseudonym for the games.

## Info panel

The game Info panel shows:

- creator name: `Fuggy`;
- the canonical Fuggy mascot portrait/head;
- the shared Creator badge;
- a short house-creator description.

It does **not** show a `MORE GAMES BY…` catalog grid. The current catalog comes from the same house creator, so duplicating the feed inside every Info sheet adds noise without helping discovery.

Creator identity is Core-owned. A game must not draw or restyle its own creator card. Existing legacy `author` strings in game definitions are not an instruction to expose a second public creator identity.

## Mascot source

All visual use of Fuggy remains subordinate to `docs/FUGGY_MASCOT.md`. Do not regenerate a generic mascot head.

The current creator avatar crops the already-imported canonical-family Fuggy scene asset:

`/assets/imported/platform/entry-scenes/metro-moment-v1/wagon-reader-fuggy.png`

This is a runtime crop only; the source is not altered. A dedicated creator-avatar master may replace that crop later only after explicit visual validation.
