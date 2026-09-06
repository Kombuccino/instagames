# MiniFugg — Repository Workflow

This document defines how production source evolves in Git. Its goal is simple: **one current implementation per responsibility, with Git history carrying the old versions.**

Read this before structural cleanup, refactors, large UI changes or iterative game polish.

## 1. Git is the version history

Do not keep chronological source copies in production merely to remember previous states.

Bad production patterns:

- `GameV2.tsx`, `GameV3.tsx`, `GameFinal.tsx`;
- `Game.old.tsx`, `Game.backup.tsx`, `GameOptimized.tsx`;
- `game.v4.css`, `game.v5.css`, `game-fix.css` when those files only represent successive iterations;
- two implementations where one simply re-exports the newest numbered implementation.

Normal workflow:

1. edit the canonical source file in place;
2. commit the change;
3. use Git history, a temporary branch or a PR when an older state must remain inspectable;
4. when a replacement becomes canonical, delete the superseded production file in the same cleanup change.

A second implementation is allowed only when both variants intentionally coexist in the product at runtime or when a short-lived migration is explicitly documented.

## 2. File names describe responsibility, not chronology

Splitting a large source file is fine when the split has a stable semantic purpose.

Good examples:

- `Game.tsx`;
- `Game.css`;
- `Game.mobile.css`;
- `Game.landscape.css`;
- `Game.effects.css`;
- `Game.audio.ts`;
- `Game.physics.ts`.

Avoid names whose only meaning is when the file was created: `v2`, `v6`, `new`, `latest`, `final`, `fix2`, `optimized2`, `prompt-5`, etc.

If a temporary experiment needs such a label, keep it on a branch rather than on production `main`.

## 3. One canonical entry point per game

A game registry entry imports the canonical component from `src/games/<game-id>/`.

Prefer:

```text
src/games/example/Example.tsx
src/games/example/Example.css
```

Do not keep a tiny `Example.tsx` whose only role is `export { Example } from './ExampleV7'`. Move the active implementation into the canonical file and delete the numbered predecessors.

The same rule applies to game-specific art-direction/configuration files unless multiple variants genuinely coexist.

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

Several CSS files inside one game are acceptable when they correspond to stable concerns such as layout, effects, responsive behavior or a special subsystem.

Do not accumulate a chronological override stack where each new prompt adds another stylesheet that overrides the previous one. When an override becomes the real design, fold it into the appropriate canonical/semantic stylesheet or rename the stylesheet by its permanent responsibility.

Before finishing a cleanup, remove selectors for DOM that no longer exists when this can be done safely.

## 6. Core has the same source-of-truth rule

For shared platform UI, there must be one production implementation per surface or subsystem.

Do not leave a rejected Cover, splash, discovery preview, status wrapper, runtime or panel beside the canonical version simply because it might be useful later. Git already preserves it.

Developer-only editors/labs are the exception, but they must be clearly identifiable as tooling and must not masquerade as an alternative production UI.

## 7. Replacements and experiments

For a risky experiment:

- create a branch or commit;
- experiment there;
- once accepted, update the canonical production file;
- delete temporary parallel implementations before merging to `main`.

Do not use production directories as a manual version archive.

## 8. Cleanup checklist

Before calling a refactor/iteration finished:

- registry imports the canonical game entry point;
- no superseded numbered/`old`/`backup`/`final` implementation remains;
- CSS filenames describe permanent responsibilities rather than prompt/version order;
- game CSS does not target Core selectors or global platform roots;
- dead preview/demo components are removed if nothing imports them;
- docs point to the current canonical files only;
- TypeScript/build checks pass when available;
- the final accepted state is on `main`.

## 9. Important distinction: assets and source code

Image/audio asset preservation follows its own documented pipelines and may intentionally retain masters, source material, catalog identities or archived proposals.

This source-code rule is about **competing production implementations**. Do not confuse Git source cleanup with deleting intentionally preserved authored assets or Audio Lab catalog history.