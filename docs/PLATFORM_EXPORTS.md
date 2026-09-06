# MiniFugg — Platform Exports and Distribution

MiniFugg keeps one web-first game codebase and wraps it for distribution. Games must not contain store/OS-specific code.

## 1. Canonical application runtime

- Core UI: React + TypeScript + HTML/CSS.
- 2D gameplay / advanced animated covers: Phaser 4.
- 3D gameplay: Three.js.
- Build tooling: Vite.

The browser build remains the canonical implementation. Distribution shells host the same Core/game runtime rather than forking game logic.

## 2. Target shells

### Web / PWA

Normal Vite build served through the existing web deployment.

### Android / iOS

Target wrapper: **Capacitor**.

Capacitor is a shell/integration layer, not a second implementation of MiniFugg. Native plugins are introduced only for capabilities that actually require them.

### Desktop / Steam

Target wrapper: **Electron**.

Electron is intentionally favored for the desktop/Steam target because bundling a controlled Chromium runtime improves consistency of rendering and web APIs across machines. The larger package size is acceptable for the desktop distribution target and must not affect the normal web/mobile JS bundle.

Packaging choices may be revisited later without changing game source contracts.

## 3. Platform adapter boundary

Core exposes/adapts platform capabilities such as:

- authentication/account linking;
- purchases and entitlement restoration;
- Steam/mobile-store billing;
- achievements;
- cloud save;
- gamepad/platform input details;
- deep links/share;
- lifecycle/backgrounding.

Individual games never import Steamworks, App Store, Google Play, Electron or Capacitor SDKs directly.

## 4. One canonical visual composition

Distribution must not create platform-specific gameplay layouts.

A game's fixed logical stage is uniformly scaled inside the available central host. Browser, Capacitor and Electron builds must display the same authored composition, subject only to uniform scale, render density and control affordances.

Optional wide-screen Core sidecars may exist in desktop/tablet layouts but never alter the canonical game geometry.

## 5. Input portability

Games consume semantic actions or intrinsic pointer gestures. Platform wrappers map:

- touch;
- keyboard/mouse;
- gamepad;
- future platform-specific controllers.

Do not fork gameplay code for control hardware.

## 6. Online/offline model

### Online

Core/server remains authoritative for:

- wallet/coins;
- purchases/entitlements;
- official leaderboard submissions;
- server rewards and competitive state.

### Purchased game offline

A player who owns a game may be allowed to launch that owned game offline.

Offline state is deliberately untrusted:

- local coins/save values can be changed locally without affecting shared economy;
- offline runs do not submit official ladder scores;
- offline runs do not grant official server rewards;
- reconnecting never tells the server to replace its wallet with a local wallet.

Offline ownership can be represented by a locally cached signed entitlement/license with reasonable expiry/refresh policy. This is a convenience boundary, not an attempt at unbreakable DRM.

## 7. Economy ownership

Games never know which store sold access. They receive session/entitlement behavior through Core.

Store receipts and purchase verification are validated by the appropriate Core/backend adapter before server entitlements are changed.

Do not put store secrets or signing private keys in the client bundle.

## 8. Build hygiene for hundreds of games

The catalog must evolve toward lazy loading:

- Core initial bundle should not eagerly contain every game implementation;
- load a game's code/runtime assets when needed;
- share/cache Phaser and Three.js chunks rather than duplicating engine copies per game;
- keep platform wrapper SDKs out of ordinary web chunks unless required.

This is migration infrastructure and may be introduced incrementally, but new architecture must not make eager-bundle scaling worse.

## 9. Store-specific additions

Achievements, rich presence, controller glyphs, cloud saves or storefront metadata are optional adapter features. They must never become dependencies of the canonical game mechanic.

A game that runs in the browser without Steam/mobile services is still the canonical game.
