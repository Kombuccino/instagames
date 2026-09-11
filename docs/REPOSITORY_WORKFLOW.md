# MiniFugg — Repository Workflow

This document defines how production source evolves in Git. Its goal is simple: **one current implementation per responsibility, with Git history carrying the old versions.**

Read this before editing and again before committing/publishing, including in an already-running Codex or ChatGPT session. The agent performs these checks without making the user repeat Git instructions.

## 0. Small-team delivery contract — 11 September 2026

The user normally works on one game, with a few parallel Core/transversal conversations. Keep that workflow: no permanent branch per game, mandatory PR bureaucracy, merge orchestrator or new hosting environment. A request to commit means commit and push to the intended remote branch unless the user explicitly asks for local-only work. Publishing a temporary branch is not publishing the live site; `main` remains the deployable source.

### A. Start or resume a task

1. Inspect the current branch, HEAD, staged/unstaged/untracked files and latest remote `main`. With a local checkout run `npm run repo:check` (or `node scripts/repository-preflight.mjs` without npm dependencies). It fetches `origin/main` and reports state; it does not change working files or the index.
2. Record the starting commit and intended files in the existing task/game follow-up when the work is substantial. Identify any pre-existing edits and commits not yet published. Do not assume they belong to this request.
3. Keep the task scoped. Do not bundle unrelated cleanup into a small game/Core fix. Independent local writing agents must not share the same physical checkout; reuse an isolated worktree/clone when necessary. Do not switch branches underneath another session.
4. A temporary branch is appropriate for a risky multi-file pass or a detached Codex checkout. Reuse it through that pass, then remove it only after its work is safely integrated. No branch per message or permanent branch per game is required.

### B. Save only the authorized changes

Inspect both `git diff` and `git diff --cached`. Stage explicit files or selected hunks, then review `git diff --cached --stat`, `git diff --cached` and `git diff --cached --check` before committing. Do not use blind `git add .`, `git add -A` or `git commit -am` to absorb whatever happens to be present.

A multi-file commit is normal: keep code, necessary configuration/assets and associated documentation together. Never commit a temporarily broken half of an interdependent change to `main`.

Preserve unrelated unfinished work. Do not run blanket stash/reset/clean/restore operations to make the checkout look clean. If unrelated edits remain, keep them in place and integrate/test the authorized commits in a separate clean worktree/clone. Do not silently commit someone else's edits to obtain a green check.

### C. Reconcile with GitHub before delivery

Once scoped work is saved, fetch the latest remote state again. Inspect incoming commits and all outgoing commits, not just the last commit. A normal push also publishes earlier unpushed ancestors: isolate the authorized commits if those ancestors include another unfinished task.

If remote `main` advanced while Codex worked, integrate it on a clean worktree. Preserve both contributions. A normal merge is the default for already-shared history; rebase is an option only for private/unpublished commits owned by this task. Never rewrite another agent's published history. Resolve conflicts by understanding the changes, not by selecting `ours`/`theirs` globally. Even disjoint files can introduce a semantic incompatibility.

When a concurrent change moved a game definition out of the central registry, carry local metadata edits to the new game-owned `definition.ts`; do not recreate the old central object.

Run the relevant tests and `npm run build` on the **combined** state. Immediately before delivery to `main`, run `npm run repo:check -- --publish`. This returns nonzero if the checkout/index is dirty, HEAD detached, a Git operation/conflict unfinished, fetch fails or remote `main` has not been integrated. Fix/isolate the cause; do not bypass it by deleting unrelated files.

Push normally to the explicit intended destination. A concurrent remote update can still occur after the check: if Git rejects the push, fetch, integrate, re-test and retry without forcing. No `--force`, `--force-with-lease` or destructive reset to bypass a delivery conflict on `main` or another shared branch. A conflict between incompatible product intentions requires one short question; ordinary Git synchronization is the agent's job.

### D. ChatGPT / GitHub connector writes

Apply the same rule without pretending the connector has a local checkout:

- read the current branch head and full current contents of each affected file;
- for a single file use its freshly read blob SHA; on stale-SHA rejection, read and reconcile again, not merely replace the SHA on an old full-file payload;
- for interdependent files, create one Git tree/commit based on the inspected head, or use a temporary branch and integrate the complete tested lot;
- advance the destination ref only without force; if the head changes, rebuild/reconcile against the new head and recheck affected code;
- preserve changes outside the task and include current asset-sync commits; never replace the repository tree with a stale full snapshot;
- verify the resulting diff, published commit and CI. Do not claim a local test when only CI ran.

### E. Scope and limitations of the check

`repo:check` is a small read-only working-copy diagnostic, not an orchestrator, automatic merge, Git hook, branch protection or permission grant. It fetches remote metadata but cannot see another machine's uncommitted work or decide whether an edit is authorized. Its success does not certify tests or prevent a later remote race. Agents must still follow the scope/review rules and respect Git's normal push rejection. Temporary WIP branch pushes are distinct from final `main` delivery and still require ordinary remote-branch synchronization and review.

After publication, verify that the intended commit is present on the intended remote branch (it may already have newer descendants). Distinguish local commit, remote publication, CI result and actual application deployment. Do not report "deployed" solely because the push succeeded.

## 1. Git is the version history

Do not keep chronological source copies in production merely to remember previous states.

Bad production patterns:

- `GameV2.tsx`, `GameV3.tsx`, `GameFinal.tsx`;
- `Game.old.tsx`, `Game.backup.tsx`, `GameOptimized.tsx`;
- `game.v4.css`, `game.v5.css`, `game-fix.css` when those files only represent successive iterations;
- two implementations where one simply re-exports the newest numbered implementation.

Normal workflow:

1. edit the canonical source file in place;
2. commit the scoped change;
3. use Git history, a temporary branch or a PR when an older state must remain inspectable;
4. when a replacement becomes canonical, delete the superseded production file in the same cleanup change.

A second implementation is allowed only when both variants intentionally coexist in the product at runtime or when a short-lived migration is explicitly documented.

### Git history is not the player's changelog

Git retains every technical revision; the player-facing game still needs one explicit version, last-update timestamp and readable changelog. On every game delivery to `main`, update `release` in that game's `definition.ts` and the matching `CHANGELOG.md` in the same commit as the change. The Info panel consumes this metadata, not a hardcoded label. See `GAME_CREATION_PIPELINE.md` for incrementing and changelog contents. A pure Core/catalog-file reorganization with no game behavior, art or data change does not invent a new player-facing release for every game.

## 2. File names describe responsibility, not chronology

Splitting a large source file is fine when the split has a stable semantic purpose.

Good examples: `Game.tsx`, `GameScene.ts`, `definition.ts`, `welcome.ts`, `Game.audio.ts`, `Game.physics.ts`, and semantic effect files.

Legacy DOM games may have semantic CSS files, but these are not permission to create a new PC/mobile geometry split; the current engine/layout contracts still apply.

Avoid names whose only meaning is when the file was created: `v2`, `v6`, `new`, `latest`, `final`, `fix2`, `optimized2`, `prompt-5`, etc.

If a temporary experiment needs such a label, keep it on a branch rather than on production `main`.

## 3. One canonical definition and entry point per game

Game-owned catalog data lives in `src/games/<folder>/definition.ts`, exporting `gameDefinition: InstagameDefinition`. It imports the canonical component from that same folder and any game-owned `welcome.ts`.

The definition owns that game's title, instructions, release metadata, orientation/logical viewport and independent engine/cover migration state. `src/core/gameRegistry.tsx` only imports and orders definitions; edit it only to add/remove/reorder catalog entries, not to change one game's version, cover or rules.

`src/core/gameDefinitionDefaults.ts` contains platform-wide defaults/helpers only. Do not put per-game versions or migration states there or mutate shared default objects. Apply a necessary per-game override in its own definition. Do not import the global registry into a game definition or scene.

The public id and folder are not always identical: TetraMindFck has id `tetramindfck` and source folder `calc-drop`. Follow existing paths; do not rename ids, assets or saved-state keys during cleanup.

Prefer a canonical component and scene beside `definition.ts`, `welcome.ts`, `ART_DIRECTION.md`, `ASSET_MANIFEST.md`, `GAME_STATUS.md` and `CHANGELOG.md` when applicable. Keep audio choices/event bindings with the game; shared audio engines/catalogs remain shared. Production asset locations continue to follow `ASSET_PIPELINE.md`, not an ad hoc relocation.

Do not keep a tiny `Example.tsx` whose only role is `export { Example } from './ExampleV7'`. Move the active implementation into the canonical file and delete the numbered predecessors.

Multiple art/cover variants may coexist intentionally; that does not require multiple production implementations.

## 4. Core and game visuals are separate ownership layers

MiniFugg Core and each game's visual universe must not style one another accidentally.

### Game CSS may

- style elements rendered by that game;
- use a unique game prefix such as `.vlad-*`, `.sts-*`, `.hari-*`;
- consume shared layout/type/touch tokens exposed by Core;
- set game-owned custom properties on the game's own root;
- contain as many semantic CSS files as the game reasonably needs.

### Game CSS must not

- target `.mf-*` Core interface selectors;
- target `.game-feed`, `.game-slot`, `.game-card`, `.game-surface` or other platform containers;
- style `body`, `html`, `#root` or `:root` to change platform presentation;
- redefine Core UI variables globally;
- hide, recolor, move or place content above the Core close-box, Cover, Info, Comments, Leaderboard or Game Over UI.

Shared tokens are an API to **consume**, not permission to restyle Core.

Core likewise must not depend on a game's private `.vlad-*`, `.sts-*`, etc. selectors.

`game-surface` is the visual containment boundary. Core overlays remain Core-owned siblings above that surface.

## 5. CSS splits are allowed; cascade archaeology is not

Several CSS files inside one game are acceptable when they correspond to stable concerns such as layout, effects or a special subsystem, within the canonical geometry rules.

Do not accumulate a chronological override stack where each new prompt adds another stylesheet that overrides the previous one. When an override becomes the real design, fold it into the appropriate canonical/semantic stylesheet or rename the stylesheet by its permanent responsibility.

Before finishing a cleanup, remove selectors for DOM that no longer exists when this can be done safely.

## 6. Core has the same source-of-truth rule

For shared platform UI, there must be one production implementation per surface or subsystem.

Do not leave a rejected Cover, splash, discovery preview, status wrapper, runtime or panel beside the canonical version simply because it might be useful later. Git already preserves it.

Developer-only editors/labs are the exception, but they must be clearly identifiable as tooling and must not masquerade as an alternative production UI.

## 7. Replacements and experiments

For a risky experiment, use a temporary branch/isolated checkout, then integrate the accepted canonical replacement under section 0. Delete temporary parallel implementations once the replacement is verified.

Do not use production directories as a manual version archive, or delete another active task under the pretext of cleanup.

## 8. Cleanup checklist

Before calling a refactor/iteration finished:

- registry assembles game-owned definitions pointing to canonical components;
- no superseded numbered/`old`/`backup`/`final` implementation remains;
- CSS filenames describe permanent responsibilities rather than prompt/version order;
- game CSS does not target Core selectors or global platform roots;
- dead preview/demo components are removed if nothing imports them;
- docs point to the current canonical files only;
- TypeScript/build and relevant tests pass on the combined delivery state when available;
- only authorized changes/commits are published; unrelated work is preserved;
- the final accepted state is published on `main`, not just saved locally.

## 9. Important distinction: assets and source code

Image/audio asset preservation follows its own documented pipelines and may intentionally retain masters, source material, catalog identities or archived proposals.

This source-code rule is about **competing production implementations**. Do not confuse Git source cleanup with deleting intentionally preserved authored assets or Audio Lab catalog history.

## 10. Verification of the lightweight workflow

`npm run test:repository` exercises the preflight in disposable local repositories (clean/dirty, staged/untracked, concurrent disjoint edits, same-file conflicts, detached HEAD, temporary branch and fetch failure) and verifies the per-game definition structure. It runs in the existing Frontend Build CI. It does not connect the test fixtures to production or install Git hooks.

The 11 September catalog extraction preserves all eight existing definitions, order, component/cover references, game versions and migration values. It does not refactor gameplay, audio, artwork or deployment. No branch-per-game or new hosting/merge service was introduced.

Git reference: https://git-scm.com/docs/git-push and https://git-scm.com/docs/git-merge.
