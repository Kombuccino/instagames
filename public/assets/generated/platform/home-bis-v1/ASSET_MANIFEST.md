# Home bis v1 — editorial showcase captures

Created 8 September 2026 for the isolated extended-screen layout lab.

| File | Source | Status |
| --- | --- | --- |
| `tetramindfck-showcase.png` | deterministic local TetraMindFck run | Prototype capture; must be replaced by the canonical advanced showcase state when Tetra is migrated. |
| `vlads-skewers-showcase.png` | current Vlad ragdoll/impact validation run | Representative advanced gameplay capture. |
| `linefugg-showcase.png` | validated LineFugg three-line run | Representative advanced gameplay capture. |

These are compact editorial evidence inside the live magazine layout. They are not cover art and never replace the live game in the phone. Runtime derivatives remain a later optimization step while the Home bis composition is under review.

## Production shell pilot — 12 September 2026

| File | Role | Status |
| --- | --- | --- |
| `production/room-magazine-shell-v1.png` | Lossless source for the clean low-poly room, desk and blank physical magazine shell | Generated and visually checked in the live Home bis; awaiting user artistic acceptance. |
| `production/room-magazine-shell-v1.webp` | Lossless runtime derivative with PNG fallback | Integrated and technically checked, 1672 × 941. |
| `production/canonical-hand-cutout-v2.png` | Lossless source derived from the canonical five-finger entry hand and adapted to the 390 × 844 phone, with the phone removed | Integrated and visually checked in the live Home bis; awaiting user artistic acceptance. |
| `production/canonical-hand-cutout-v2.webp` | Lossless runtime derivative with PNG fallback | Integrated and technically checked, 941 × 1672 with real alpha. |

The magazine text, screenshots, tabs and game data remain live React content. The phone surface remains the real Core cover/game host. The production plate contains no text or live state. Browser validation covered Feature, Ranking, page changes, Cover → Phaser gameplay → Cover, a 1280 × 720 desktop viewport and a compact 1024 × 768 desktop viewport. No console error was observed. The compact viewport is usable but visually dense and remains a product decision point.

The first hand cutout required non-uniform stretching to reach both sides of the phone and was superseded after user concern. The second cutout uses a grip authored around the 390 × 844 opening: four fingers stay outside the left bezel, the thumb stays outside the right bezel and the gameplay surface remains unobstructed. Two generator attempts painted a checkerboard instead of alpha; the accepted file candidate was therefore cleaned deterministically into a real transparency mask before integration.
