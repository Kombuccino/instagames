# TetraMindFck — Game Status

Updated: 2026-09-19 Europe/Paris

## Gameplay DA approved; production preparation started — 2026-09-19

- User approved the exact latest cream-handheld / green-CRT reference and authorized the next production step.
- Approved presentation: wide TARGET instead of SCORE, LEVEL on at least two digits, no second TARGET in the rail, one small MiniFugg mark, NEXT / NEXT+1, bottom anchoring, exact square 10×20 board and four equal main controls. Numeric values must be displayed with reusable raster glyphs/tiles, not a substituted system font.
- New-production specification: 390×850 logical units, ×2 exports 780×1700 pixels, guaranteed bottom window y140–850. The exact 853×1844 reference is preserved, not stretched. The current 390×844 runtime is not migrated by this documentation pass.
- Exact approved PNG archived privately as Drive `1uwp0dczINJlFOX1eMle5xtjXZNLBuxo7`, under `Games/tetramindfck/gameplay-production-2026-09-19` (folder `1cVoRYkEmFleYRc9PVnzdZiM_HFXc3W43`). SHA-256 `25b66ea0292439a32047cdd7d544ca4e553f1f8855ec68cab156e45c231b9a83`.
- Produced and visually inspected three separate technical review boards: composition/ownership (`171vEdyI1uP5KvjBtK6iSTP5S5VtoHHnU`), glyphs/command states (`11zSXtChhQ5RmP1qw3n6enoINIhSvSiLM`) and full-row calculation storyboard (`1EnHa2W5LfydmzgFqejMcigi18hCOssV8`). Each is 2340×2000 pixels, not a stage texture.
- Private preparation package `tetramindfck-production-preparation.zip`, Drive `129nDDEw_OXC2UI4T9MLCvsJ6zZ4JiHu_`, contains the original, three boards, offline HTML viewer, 25-element inventory, two raster glyph specimens, frame metadata, preparation script and file verification.
- First cell specimen: actual 1–9 contours isolated from the approved raster. HUD specimen: proposed broad seven-segment 0–9 artwork. Both remain candidates, not final accepted atlases. PNG/WebP decode checks passed, including identical RGBA pixels, alpha, single-frame and VP8L lossless payload.
- New proposal requiring review: a temporary calculation strip inside the main CRT, distinct from permanent TARGET and outside the board. The old requirement to force every result to the right may be relaxed, as the user allowed; never consume the tenth column.
- Remaining illustrative errors in the reference are not production rules: only full rows calculate; geometry must be exact; ghost comes from collision; left rotation must be counterclockwise and right rotation clockwise; category tints must be consistent.
- Example targets 50000 / 100000 / 170000 are capacity tests, not an approved replacement progression curve. The HUD decision does not silently migrate leaderboard persistence or cover-unlock scoring.
- `ART_DIRECTION.md` and `ASSET_MANIFEST.md` now record the approved contract, actual deliverables, proposals and missing work. No gameplay code, covers, audio, migration lock or player release version changes in this preparation pass.
- **Production Lab status: inventory prepared, UI synchronization still pending.** Do not claim that these boards or 25 nodes already appear in the Lab. No fake Release screenshot or final clean-shell/button source has been produced.
- **Validation scope:** image/file checks only. Typecheck, build, actual gameplay, viewport runtime and deployment checks were not run for this pass. No new public asset path was registered.

### Immediate continuation

Wire the inventory into the Tetra Production Lab plan, keeping missing source images explicit and private archive references private. Review the proposed calculation strip, glyph specimens and state storyboard. Then produce clean sources and integrate a representative slice with actual phone-size raster digits, full 10×20 geometry, horizontal-I previews, LEVEL 09/10/99/100, large TARGET values, both rotation directions and bottom anchoring with RETOUR. Only extend the pack after comparison against the accepted material reference. Preserve existing gameplay and scoring rules unless their change is explicitly resolved.

## Calage final des quatre covers — 2026-09-13

- L’export `minifugg-cover-calibration/v1` validé par l’utilisateur est appliqué : fenêtres à `y 37.6`, `48.8`, `51.2` et `90.4`, soit les positions CSS `20.7%`, `26.8%`, `28.1%` et `49.7%`.
- Les quatre masters PNG et WebP lossless restent octet pour octet inchangés. Core superpose seulement le bandeau-titre exact du même raster au fond recadré ; aucun personnage, bloc, trait, couleur ou lettrage n’est généré de nouveau.
- Contrôle visuel effectué sur A54 Brave, MASTER et desktop pour les quatre éditions : sujet remonté au-dessus de JOUER, titre entier, raccord fondu imperceptible, aucune cover animée ni erreur console.

## Historical gameplay CRT art integration — 2026-09-12

This is the record of the former mini-slice, not the current TARGET-led art contract approved on 2026-09-19.

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

Gameplay art production preparation / translation review. Phaser migration remains in-progress and locked; the updated DA is not yet integrated. Production Lab UI synchronization is pending.

## Current runtime rules — unchanged by the art preparation

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
- Total run score remains the cumulative sum of all cleared-line scores for the leaderboard; reconcile this metric separately from removing the SCORE readout in the future gameplay art.

## Runtime / migration

- Phaser 4 scene introduced on 2026-09-10 as `TetraMindFckScene.ts`.
- React host now mounts the shared `PhaserGameHost`; Core audio remains authoritative and the reactive music receives the Phaser level directly.
- Legacy `CalcDrop.tsx` / `CalcDrop.css` are superseded but retained temporarily until the Phaser cutover is validated.
- Migration must remain `in-progress` / locked until typecheck, build and representative gameplay checks pass.

## Validation / remaining

- Follow the 2026-09-19 translation gates in `ASSET_MANIFEST.md` before full raster production. Validate bottom anchoring and TARGET-led composition, not the superseded SCORE-led reference.
- Typecheck/build and representative phone/desktop play validation remain required before marking the migration `current` and deleting the legacy renderer.
- Verify especially: controls, 7-bag previews including I-piece width, O-piece token rotation, reverse calculation, simultaneous line-clear animation, 3-tick lock, bonus injection, total-clear target skipping, `1–9` generation, `2:1` operator split, long target/result display, level overflow beyond two digits, game-over/restart and reactive music level changes.
- After translation/mini-slice acceptance: produce clean source masters and WebP-lossless runtime derivatives for the shell/button/background/glyph family through the documented asset pipeline, then replace temporary structural geometry without changing gameplay rules.

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
