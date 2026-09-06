# MiniFugg / Instagames

A mobile-first catalog/feed of small authored games designed to start instantly and remain portable across web, mobile and desktop/store shells.

## Canonical architecture

- Core UI/platform: React + TypeScript + HTML/CSS.
- 2D games and advanced animated covers: Phaser 4.
- Genuine 3D low-poly/blockout games: Three.js.
- Fixed logical game stage + uniform scaling across devices.
- Shared session contract between game and Core.
- Server-authoritative online economy/official ladders.

Read first:

- `AGENTS.md`
- `GAME_DEV_SPEC.md`
- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/GAME_MIGRATION_PLAN.md`

## Existing catalog migration

All games that predate the engine standard are currently marked `legacy-dom` and locked for migration in `src/core/gameRegistry.tsx`.

Do not extend their old DOM/CSS/Canvas rendering. Migrate them to Phaser as part of the next substantive work on each game. All current covers are also marked **A METTRE A JOUR**.

## Local development

```bash
npm install
npm run dev
```

Production check:

```bash
npm run typecheck
npm run build
```

## New game

New real games follow the project's **10 prompts per game** rule.

2D games start on Phaser. 3D is Three.js only when the mechanic is intentionally 3D. The React component registered with Core acts as the game host/lifecycle bridge rather than rebuilding the game scene with responsive DOM layout.

Every game declares:

- `orientation`;
- `runtime`;
- fixed `logicalViewport`;
- `migration` state;
- shared lifecycle/session behavior.

Production images use `docs/ASSET_PIPELINE.md`.

## Distribution targets

- Web/PWA: canonical Vite build.
- Android/iOS: Capacitor target shell.
- Desktop/Steam: Electron target shell.

Games never import store/OS SDKs directly; Core adapters own platform-specific integration.

## Deployment

The multi-stage `Dockerfile` builds the Vite app and serves it from Nginx on port 80. Dokploy deploys the repository from `main`.
