# Existing games — migration lock

All games currently under `src/games/` are in the engine migration program defined by:

- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/GAME_MIGRATION_PLAN.md`

## Mandatory rule

If a registry entry has `migration.locked: true`, do **not** modify that game's production implementation for normal feature work, polish or legacy responsive fixes.

Allowed changes are only:

1. work that directly migrates the game toward its declared `migration.targetRuntime` and canonical logical stage;
2. a minimal urgent security or blocking-regression fix.

If a user asks for a normal improvement to a locked game, migrate it first/as part of that request rather than adding another layer of legacy DOM/CSS/Canvas code.

When migration is complete, delete the superseded rendering implementation, set `runtime` to the new engine, set `migration.state` to `current`, and set `migration.locked` to `false`.

Current catalog target: Phaser 4 for all existing 2D games.
