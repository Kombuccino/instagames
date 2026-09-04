# MiniFugg Platform Export Architecture

MiniFugg must remain portable. A game is authored once against the MiniFugg runtime and must not need to be rewritten for each distribution platform.

## Core principle

**Games depend on MiniFugg, never on a store or operating system.**

A game must not contain Steam-specific, Google Play-specific, itch.io-specific, Android-specific, iOS-specific or browser-host-specific code. Platform differences belong in Core adapters and export shells.

The same game source should be usable in multiple product shapes:

- the normal MiniFugg scrolling feed;
- a curated MiniFugg pack containing only selected games;
- a standalone single-game build;
- an offline downloadable bundle;
- a desktop/store wrapper;
- a mobile-store wrapper.

Changing the distribution target must not require editing each game.

## Canonical runtime

The canonical gameplay runtime remains the web runtime used by MiniFugg today: React/TypeScript/CSS plus browser capabilities such as Canvas, WebGL and WebAudio.

This is intentional. It lets 2D, Canvas and WebGL/3D games run inside the same MiniFugg contract and also makes them embeddable in native shells without maintaining a second game engine.

Games continue to communicate through the MiniFugg runtime contract (`active`, `seed`, `restartToken`, `session`, and future shared services). Core owns platform UI, player identity, social features, score transport and distribution-specific integrations.

## Export targets

### Web / PWA

The normal Vite build remains the reference build. It may run as the live MiniFugg site or be made installable as a PWA.

### itch.io / HTML5 portals

Produce a static self-contained web build/ZIP. No game should need code changes. Network-dependent Core features may use the normal API when available or an offline/local fallback when not.

### Desktop / Steam

Wrap the same compiled MiniFugg web runtime in a desktop shell (for example a lightweight WebView/native shell or Electron-style shell). Steam-specific capabilities, if used later, must be exposed through a Core platform adapter rather than imported by games.

### Android / Google Play

Wrap the same compiled runtime in a mobile WebView/native shell. Android/store services such as haptics, share sheets, billing, achievements or notifications belong behind Core adapters.

### iOS / other stores

Use the same principle as Android: one game runtime, a platform shell, and Core adapters for native/store capabilities.

The exact wrapper technology is replaceable. MiniFugg games must not care which wrapper is selected.

## Build shapes

The export system should eventually support these build profiles without changing game code:

1. **full-feed** — complete MiniFugg catalog;
2. **curated-pack** — a selected subset (for example only Fugg-rated games);
3. **standalone-game** — one game plus the minimum MiniFugg shell;
4. **offline-pack** — selected games and assets bundled locally, with network features optional;
5. **store-build** — a full or curated build wrapped for desktop/mobile distribution.

The game registry is the source from which these profiles select games. A game should not assume that every other game exists in the current build.

## Platform adapter boundary

Platform-dependent features must converge on a MiniFugg-owned adapter layer. Future examples include:

```ts
export type MiniFuggPlatform = {
  kind: 'web' | 'desktop' | 'android' | 'ios' | 'embedded'
  share?(payload: { title?: string; text?: string; url?: string }): Promise<void>
  haptic?(kind: 'light' | 'medium' | 'heavy'): void
  openExternal?(url: string): Promise<void>
  setAchievement?(id: string): Promise<void>
  cloudSave?<T>(key: string, value: T): Promise<void>
}
```

This is an architectural direction, not a requirement to implement all methods now. A game requesting such a capability must call a MiniFugg service, not a vendor SDK directly.

## Network and persistence

A distributable game must not require the MiniFugg API merely to start and play.

- Gameplay must boot without the backend.
- Core social/leaderboard/profile features may use remote services when available.
- Core should provide local/offline degradation where sensible.
- Store builds may optionally disable services that make no sense for that package.

Games must never call the MiniFugg database directly or implement their own player/account persistence.

## Assets and URLs

Games must not depend on the public MiniFugg hostname or hard-code deployment origins.

- Production assets belong in the repository/export bundle or an explicitly supported Core asset service.
- Build base paths must remain configurable so static ZIPs and wrapped builds can load assets correctly.
- Direct shared-game URLs are a Core routing feature; standalone/offline builds must not require a public URL to launch gameplay.

## Input portability

Games should remain usable through the input modes relevant to their target form without platform-specific forks:

- touch/pointer first for mobile MiniFugg;
- mouse/trackpad where practical;
- keyboard where practical;
- gamepad support can later be normalized by Core for desktop/store builds.

Do not import a Steam, Android or console input SDK inside a game.

## 3D portability

WebGL/Three.js-style 3D games fit this architecture. A 3D game still renders inside the MiniFugg game surface and uses the same runtime/session contract. Desktop and mobile wrappers package the same WebGL build; there should not be a separate native 3D rewrite.

Performance budgets remain important, especially on phones and embedded WebViews.

## Non-negotiable rule for new games

Before accepting a technical shortcut, ask:

> Would this game still run if MiniFugg were packaged tomorrow as a static itch.io ZIP, a Steam desktop app, or an Android store app?

If the answer is no because the game itself depends on one platform, move that dependency into Core or a platform adapter.

## Implementation direction

Platform export infrastructure is Core work and does not consume a game's 10-prompt budget.

When export work begins, prefer one repeatable command/profile per target rather than bespoke manual instructions per game. The intended end state is conceptually:

```text
MiniFugg game source
        ↓
MiniFugg runtime + selected registry
        ↓
portable web build
   ↙       ↓        ↘
 Web    Desktop    Mobile
/itch    /Steam   /stores
```

One source of gameplay truth; multiple distribution shells.
