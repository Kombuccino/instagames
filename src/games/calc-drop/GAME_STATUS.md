# TetraMindFck — Game Status

Updated: 2026-09-10 09:01 Europe/Paris

## Current phase

Gameplay migration + GD refinement.

## Current rules

- Portrait game, fixed logical stage `390 × 844`.
- Falling 7-bag tetromino sequence; each block carries a digit or arithmetic operator.
- Completed horizontal rows are evaluated in their calculation direction and then removed.
- `⇄` reverses a row calculation. Multi-line clears can inject stronger bonuses into the next piece.
- Lock delay is 3 ticks; holding down can consume the remaining lock ticks.
- Level progression is now a **one-clear objective**, not cumulative progress:
  - level 1 target: `50`;
  - level 2 target: `100`;
  - then `200`, `300`, `400`… in steps of 100;
  - the value compared to the target is the **sum of every line score in that single clear**;
  - one sufficiently large clear may cross several targets at once.
- Total run score remains the cumulative sum of all cleared-line scores for the leaderboard.

## Runtime / migration

- Phaser 4 scene introduced on 2026-09-10 as `TetraMindFckScene.ts`.
- React host now mounts the shared `PhaserGameHost` and Core audio remains authoritative.
- Legacy `CalcDrop.tsx` / `CalcDrop.css` are superseded and should be removed once the Phaser cutover is validated.
- Registry migration metadata still needs to be switched to `phaser-2d/current` in the same delivery pass.

## Validation / remaining

- Preserve the existing gameplay visual language from `ART_DIRECTION.md`; no gameplay DA redesign was requested in this pass.
- Typecheck/build and representative phone/desktop play validation remain required before calling the migration fully current.
- Verify especially: controls, 7-bag previews, O-piece token rotation, reverse calculation, simultaneous line clear animation, 3-tick lock, bonus injection, target skipping on a large clear, game-over/restart, and reactive music level changes.
