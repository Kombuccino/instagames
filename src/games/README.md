# Games — local definitions and migration rules

## Work in the game's folder

Each game exports its catalog entry from `definition.ts` as `gameDefinition: InstagameDefinition`. This is where its title, instructions, release version/date, component, logical viewport and migration states belong. A separate `welcome.ts` may hold its cover choices. Keep existing art/status/manifests/changelogs and game-specific audio bindings beside the game.

`src/core/gameRegistry.tsx` only imports and orders these definitions. Do not edit Core to bump one game's version or change its rules/cover. Shared helpers in `src/core/gameDefinitionDefaults.ts` are platform defaults, not a place for per-game data.

TetraMindFck keeps its existing source folder `calc-drop` and public id `tetramindfck`. Do not rename identifiers or move assets as a side effect of this organization. Asset paths continue to follow `docs/ASSET_PIPELINE.md`; shared audio catalogs and engines are not duplicated per game.

Before editing and again before delivery, follow `docs/REPOSITORY_WORKFLOW.md`. Agents perform scope review and remote synchronization themselves. A multi-file commit is fine; accidentally committing another session's unfinished work is not. No permanent branch per game is required.

## Migration lock remains independent

Games are in the engine migration program defined by:

- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/GAME_MIGRATION_PLAN.md`

Inspect the game's current `definition.ts`. If `migration.locked: true`, do **not** modify that game's production implementation for normal feature work, polish or legacy responsive fixes.

Allowed changes are only:

1. work that directly migrates the game toward its declared `migration.targetRuntime` and canonical logical stage;
2. a minimal urgent security or blocking-regression fix.

If a user asks for a normal improvement to a locked game, migrate it first/as part of that request rather than adding another layer of legacy DOM/CSS/Canvas code.

When migration is complete, delete the superseded rendering implementation, set `runtime` to the new engine, set `migration.state` to `current`, and set `migration.locked` to `false` in its own definition. Cover state is independent; never mark it current merely because the engine migrated.

Current catalog target: Phaser 4 for all existing 2D games. A pure catalog metadata extraction does not lift locks, change rules/art or invent new game releases.
