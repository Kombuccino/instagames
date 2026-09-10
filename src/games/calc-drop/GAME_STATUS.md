# TetraMindFck — Game Status

Updated: 2026-09-10 09:04 Europe/Paris

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
