# Instagames

A vertical, roulette-driven feed of tiny games designed to be playable instantly.

## Core principles

- Swipe up/down to jump into another game.
- The feed order is shuffled in batches, with no immediate repeat between batches.
- Only the active game and its immediate neighbours are mounted.
- Games talk to the shell through a tiny runtime contract (`GameComponentProps`).
- Real games are built separately under the project's **10 prompts per game** rule.

The three entries currently in `src/games/demo` are runtime smoke tests, not official 10-prompt games.

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

## Add a game

Create a React component that accepts `GameComponentProps`:

```tsx
import type { GameComponentProps } from '../../core/types'

export function MyGame({ active, seed, session }: GameComponentProps) {
  // Pause loops/audio when active === false.
  // Use seed for deterministic per-run variation if useful.
  // Report the current score with session.setScore(...).
  return <div>...</div>
}
```

Then register it in `src/core/gameRegistry.tsx`:

```tsx
{
  id: 'my-game',
  title: 'My Game',
  description: 'One-line gameplay hook',
  author: 'creator',
  component: MyGame,
}
```

## Deployment

A multi-stage `Dockerfile` builds the Vite app and serves it from Nginx on port 80. Dokploy can deploy the repository directly from `main` using that Dockerfile.
