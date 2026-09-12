# TetraMindFck — Game Status

Updated: 2026-09-12 Europe/Paris

## Current phase

Gameplay migration + GD refinement.

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

- Preserve the existing gameplay visual language from `ART_DIRECTION.md`; no gameplay DA redesign was requested in this pass.
- Typecheck/build and representative phone/desktop play validation remain required before marking the migration `current` and deleting the legacy renderer.
- Verify especially: controls, 7-bag previews, O-piece token rotation, reverse calculation, simultaneous line clear animation, 3-tick lock, bonus injection, total-clear target skipping, `1–9` generation, `2:1` operator split, game-over/restart and reactive music level changes.

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
