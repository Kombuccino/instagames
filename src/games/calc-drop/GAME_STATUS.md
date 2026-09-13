# TetraMindFck — Game Status

Updated: 2026-09-13 Europe/Paris

## Calage final des quatre covers — 2026-09-13

- L’export `minifugg-cover-calibration/v1` validé par l’utilisateur est appliqué : fenêtres à `y 37.6`, `48.8`, `51.2` et `90.4`, soit les positions CSS `20.7%`, `26.8%`, `28.1%` et `49.7%`.
- Les quatre masters PNG et WebP lossless restent octet pour octet inchangés. Core superpose seulement le bandeau-titre exact du même raster au fond recadré ; aucun personnage, bloc, trait, couleur ou lettrage n’est généré de nouveau.
- Contrôle visuel effectué sur A54 Brave, MASTER et desktop pour les quatre éditions : sujet remonté au-dessus de JOUER, titre entier, raccord fondu imperceptible, aucune cover animée ni erreur console.

## Gameplay CRT art integration — 2026-09-12

- User approved the retro handheld / green CRT gameplay direction after iterative correction of the grid, previews, controls and tile treatment.
- The accepted visual contract is now canonical in `ART_DIRECTION.md`; production ownership and format rules are in `ASSET_MANIFEST.md`.
- Runtime raster rule confirmed by the user: PNG is source/master only; WebP lossless is the normal runtime derivative, AVIF only for validated large opaque static art with fallback.
- First representative Phaser mini-slice is now on `main`: cream handheld shell blockout, one dominant CRT, English-only `LEVEL / TARGET / NEXT / NEXT+1 / SCORE`, monochrome phosphor number tiles, restrained operator accents, grid-aligned previews and the revised control geometry.
- The four main controls are one aligned low row with tight spacing; `DOWN` is smaller underneath the movement pair.
- `NEXT` receives a directional marker and preview centering now uses actual piece bounds, so a four-cell I piece fits correctly.
- `SCORE` is a wide top-of-CRT display with dynamic font sizing for long multi-million values.
- The line-clear sequence remains board-frozen until its arithmetic scan is complete and now uses the CRT palette.
- No new gameplay raster asset is referenced yet. This is deliberate: shell/button/background raster production waits for visual validation of the mini-slice, avoiding contaminated flattened UI assets.
- Migration remains `in-progress` / locked until build/typecheck and representative phone/desktop gameplay validation pass; legacy `CalcDrop.tsx` / `CalcDrop.css` therefore remain temporarily as historical fallback code.

## Cover fit correction — 2026-09-12

- User review found that the previously top-cropped PC display hid substantial parts of several approved characters once the larger Core coin console was integrated.
- All four static editions now preserve their complete `390 × 844` poster in the wider PC `390 × 662` frame; `StaticCoverArt` supplies the diffused exterior fill.
- The Core console itself spans the full frame width and no longer uses a 390 CSS-pixel cap on desktop.
- Pulp, micro-computer, graphic-poster and Japanese editions were checked with the console; title and dominant face remain readable. Phone `390 × 844`, paid launch and return were also verified without console errors.

## Current phase

Gameplay Phaser migration + gameplay art production mini-slice.

## Current rules

- Portrait game, fixed logical stage `390 × 844`.
- Falling 7-bag tetromino sequence; each block carries a digit or arithmetic operator.
- Numeric blocks are `1` to `9` only; `0` is no longer generated.
- Operator blocks keep the current overall frequency, with an exact `2:1` split: two multipliers for one divider.
- Completed horizontal rows are evaluated in their calculation direction and then removed.
- `⇄` reverses a row calculation. Multi-line clears can inject stronger bonuses into the next piece.
- Lock delay is 3 ticks; holding down can consume the remaining lock ticks.
- Level progression is a **one-clear objective**, not cumulative progress:
  - level 1 target: `50`;
  - level 2 target: `100`;
  - then `200`, `300`, `400`… in steps of 100;
  - the value compared to the target is the **sum of all line scores in that single clear**;
  - one sufficiently large clear may cross several targets at once.
- Total run score remains the cumulative sum of all cleared-line scores for the leaderboard.

## Runtime / migration

- Phaser 4 scene introduced on 2026-09-10 as `TetraMindFckScene.ts`.
- React host now mounts the shared `PhaserGameHost`; Core audio remains authoritative and the reactive music receives the Phaser level directly.
- Legacy `CalcDrop.tsx` / `CalcDrop.css` are superseded but retained temporarily until the Phaser cutover is validated.
- Migration must remain `in-progress` / locked until typecheck, build and representative gameplay checks pass.

## Validation / remaining

- Validate the new CRT mini-slice at phone width and desktop CENTRE-height framing before generating final shell/button raster assets.
- Typecheck/build and representative phone/desktop play validation remain required before marking the migration `current` and deleting the legacy renderer.
- Verify especially: controls, 7-bag previews including I-piece width, O-piece token rotation, reverse calculation, simultaneous line clear animation, 3-tick lock, bonus injection, total-clear target skipping, `1–9` generation, `2:1` operator split, long score display, game-over/restart and reactive music level changes.
- After mini-slice acceptance: produce clean source masters and WebP-lossless runtime derivatives for the shell/button/background family through the documented asset pipeline, then replace temporary Phaser structural geometry without changing gameplay positions.

## Cover size regression correction — 2026-09-12

- The `contain` presentation introduced in 0.6.1 was rejected because it visibly shrank the covers and added exterior margins.
- All four editions return to their approved top-anchored `cover` presentation; the Core console remains an overlay over expendable BAS.

## Static cover pilot — 2026-09-12

- Base Git: `cc19fbd903ba2e9324c3789be195a3f68c6ba129`.
- Scope: the three exact approved flat TetraMindFck posters; no gameplay or cover reinterpretation.
- `pulp-euro` and `micro-euro` now point to static Core images instead of their Phaser layer stacks in the pilot worktree. `graphic-poster` uses the same static path.
- Non-title copy, arrows, `SWIPE TO PLAY` and MiniFugg signatures were removed through localized image edits. Pixels outside the declared masks stay sourced from the originals.
- First lower-extension attempt rejected by the user: `pulp-euro` became a featureless black coat band; `micro-euro` stopped on an empty floor and retained a fake damaged-box border; `graphic-poster` retained distressed edges.
- Correction pass: `pulp-euro` now continues the torso and painted coat with restrained block fragments; `micro-euro` continues the torso and low green-grid environment; `micro-euro` and `graphic-poster` no longer have simulated frames or damaged corners. General paper/ink texture remains inside the images.
- The approved composition is pixel-preserved outside localized lower/perimeter blend masks. Display stays top-anchored and may crop only the bottom.
- Build passed. Browser validation passed for all three static editions at `360 × 611`, full MASTER `390 × 844` and PC `1280 × 720`: runtime assets decode at `780 × 1688`, zero animated-cover canvas/host, zero console errors, title clear above the overlapping Core JOUER button.
- User validation: all three corrected covers explicitly accepted on 2026-09-12; the distinct pulp, micro-computer and graphic-poster character must be preserved as the quality reference for later cover work.
- The missing Japanese direction was recovered in `GFX/crea-chatgpt/game/ChatGPT Image 5 sept. 2026, 19_27_48 (1).png`, variant 4. No standalone full-resolution original was found, so it remains a reference candidate rather than a production fourth cover.
- Production cutover complete in the delivery branch: Core uses the three static covers, and the inactive Phaser cover runtime plus superseded TetraMindFck layer files are removed.

## Japanese cover and style recovery — 2026-09-12

- Base inspected: `5b62f5926c2bdbe34bc8034d97f4c7dcae356199` on `origin/main`.
- User validation: all four first-row directions on `ChatGPT Image 5 sept. 2026, 19_27_48 (1).png`, plus its `PUB 90s` magazine study, are approved as style references. This does not validate their obsolete CTA, logos, slogans or French copy.
- Five additional Japanese studies were recovered from boards `(2)` through `(6)` and isolated as reference-only crops beside the primary violet/orange tile under local `GFX/crea-chatgpt/game/tetramindfck/japanese-research/`.
- Built-in ImageGen received only the isolated primary tile and a closed title-only brief. One standalone source, exact `390 × 844` master candidate and lossless `780 × 1688` WebP candidate were generated and technically checked.
- Agent visual check: the candidate preserves the violet/orange commercial-manga language, diagonal block avalanche, alarmed low character, exact `テトラマインドファック` title and continuous lower clothing; no CTA, logo, side copy, frame or blank lower band remains.
- User acceptance: the exact standalone Japanese master was explicitly accepted on 2026-09-12.
- Production promotion: its byte-identical verified source, `390 × 844` PNG master and `780 × 1688` lossless WebP derivative are copied into `public/assets/generated/tetramindfck/welcome/variants/`; `welcome.ts` exposes it as the fourth static, top-anchored edition with the planned `30,000` progression threshold.
- Browser control: the four-cover collection passed on `360 × 611`, `390 × 844` and `1280 × 720`. All four assets decode as lossless `780 × 1688` WebP, stay top-anchored and static, create no cover canvas, fill the frame continuously and keep JOUER over the expendable lower zone; the twelve screenshots contain no title/logo conflict under the button.
- Remaining archive action only: the private Graphic Archive copy is pending because this local pass has no archive connection; the source and approved master remain locally preserved.
