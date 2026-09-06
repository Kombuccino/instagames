# MiniFugg — Engine Migration Plan

This is the active migration ledger for the existing game catalog.

## Freeze rule

Until a game is marked `current`, its existing implementation is **frozen** except for:

1. work that directly migrates it to the new runtime/layout architecture;
2. a minimal urgent fix for a security issue or a blocking regression.

Do not add features, visual polish or additional legacy CSS/Canvas machinery before migration. If the user asks to improve a locked game, perform the migration as part of that work first.

All current covers are also considered **A METTRE A JOUR** until their cover migration state is explicitly changed to `current`.

## Target architecture

- Core UI: React + TypeScript + HTML/CSS.
- 2D games: Phaser 4.
- Advanced animated covers: Phaser 4.
- 3D low-poly/blockout games: Three.js.
- Fixed canonical logical stage + uniform scaling.
- Semantic input actions mapped to touch, keyboard/mouse and gamepad.
- Server-authoritative online economy and official ladders.

## Existing catalog

| Priority | Game | Current state | Target | Main migration reason |
| ---: | --- | --- | --- | --- |
| 1 | HARI les dents pourries | legacy DOM/CSS | Phaser 2D | canonical test for cross-screen geometry instability |
| 2 | Les Brochettes de Vlad | legacy DOM/CSS | Phaser 2D | sprite-count/performance pressure + major visual polish pass |
| 3 | Train Fighter | legacy DOM/CSS | Phaser 2D | sprite-heavy scrolling/action game; imported raster assets ready to exploit |
| 4 | TetraMindFck | legacy DOM/CSS | Phaser 2D | mobile/desktop geometry drift + current legacy cover/parallax pilot |
| 5 | Shoot the Shooter | legacy DOM/CSS | Phaser 2D | timing/hit-testing/input consistency across screen sizes |
| 6 | DebthOfLife | legacy DOM/CSS | Phaser 2D | runner architecture naturally fits an engine scene/camera |
| 7 | CrazyPapers | legacy DOM/CSS | Phaser 2D | visually document-heavy but benefits from one standard runtime |
| 8 | LineFugg | legacy DOM/CSS | Phaser 2D | mechanically simple; migrate after the shared patterns are proven |

This order is a recommended implementation sequence, not a statement about game quality.

## Per-game migration checklist

A migration is complete only when all of these are true:

1. Freeze the existing mechanic/rules as the behavioral reference.
2. Confirm the game's fixed logical viewport (`390×844` portrait or `844×390` landscape by default).
3. Rebuild the gameplay scene in Phaser without changing the mechanic unless explicitly requested.
4. Put all gameplay positions, hit areas and cameras in logical units.
5. Use uniform aspect-preserving scaling; no critical `vw`/`vh` layout.
6. Map touch/keyboard/mouse/gamepad through semantic actions where relevant.
7. Preserve `active`, `restartToken`, `session.setScore` and `session.finish` behavior.
8. Move sprite-heavy/effect-heavy rendering into Phaser; do not retain a parallel DOM version.
9. Import/finalize production art through `docs/ASSET_PIPELINE.md`.
10. Add the visual polish pass: authored assets, animation, feedback, sound and FX suitable for the game's art direction.
11. Test canonical geometry at representative phone, tablet and desktop sizes.
12. Test touch and desktop controls separately.
13. Update the cover; clear `A METTRE A JOUR` only after the cover is genuinely current.
14. Delete superseded legacy rendering code once the replacement is canonical.
15. Set registry runtime to `phaser-2d`, migration state to `current`, and unlock normal development.

## Cover migration

Static covers may remain raster images rendered by React Core.

A cover that needs authored motion/parallax/FX should move to the shared Phaser cover runtime instead of expanding the legacy `FuggWelcome` CSS/Canvas machinery.

The existing Parallax Lab and legacy cover interpreter remain available only long enough to preserve/take measurements from current work. They are not the target architecture.

## Platform work that should happen alongside the game migrations

1. Keep engine dependencies centralized (`phaser`, `three`).
2. Introduce shared Phaser/Three host helpers only when the first migrated game exercises them; avoid speculative engine-framework layers.
3. Move the catalog toward per-game lazy loading so hundreds of games do not enter the initial JS bundle.
4. Add repeatable geometry/input smoke tests once the first Phaser game establishes the reference harness.
5. Add Capacitor and Electron shells only when store/export work begins; do not burden the normal web build with platform SDKs prematurely.
6. Keep Steam/mobile billing/achievements behind Core adapters.

## Quality gate

A game is not promoted/treated as a finished Fugg merely because the mechanic works.

The gameplay presentation must have enough authored visual/audio character that the jump from its premium cover to the actual game does not feel like a downgrade into a generic HTML prototype. The exact art style can be minimal, pixel-art, paper, low-poly, blocky or otherwise simple; the requirement is deliberate finish, feedback and emotional identity.
