# MiniFugg — Game Layout System

This document defines how gameplay geometry behaves across phones, tablets, desktop browsers and wrapped applications.

## 1. Core rule

**Gameplay is not responsively reflowed. It is authored once in a fixed logical stage and uniformly scaled.**

The old approach of using viewport-dependent layout tokens/media queries to rearrange critical game elements is legacy and must not be used for migrated/new gameplay.

Default logical stages:

- portrait: `390 × 844`;
- landscape: `844 × 390`.

A game may declare another fixed logical size if needed, but the size is explicit and stable.

## 2. Uniform fit

Given logical size `(LW, LH)` and available central area `(AW, AH)`:

`scale = min(AW / LW, AH / LH)`

Then:

- displayed width = `LW × scale`;
- displayed height = `LH × scale`;
- center the result in the available central area.

Never independently stretch X/Y.

Never use the physical viewport as the simulation coordinate system.

## 3. What stays fixed

Across device sizes, these relationships must remain the same:

- sprite positions relative to each other;
- board/grid/mouth/track proportions;
- hit boxes;
- camera framing;
- authored HUD positions inside the game;
- distances and collision coordinates;
- layer composition.

This is specifically intended to eliminate failures such as HARI/TetraMindFck looking materially different on PC and phone.

## 4. What may adapt

Only the following may change by environment:

- the uniform scale of the canonical stage;
- render pixel density / device pixel ratio;
- control presentation/mapping (touch vs keyboard/mouse/gamepad);
- optional Core sidecars outside the canonical stage;
- decorative overscan outside the canonical stage **but still inside the Core-owned game surface/slot**;
- safe-area padding outside/around the canonical stage when required by device chrome.

The game mechanic must remain complete without sidecars or overscan.

A game must never paint its own decorative overscan into the browser/window gutters outside the game surface. Those gutters and any future sidecars are Core-owned. If Core caps the desktop game feed/surface, the game stays inside that cap; black or platform-owned space outside it is intentional.

## 5. Desktop/tablet extra space

The mobile composition is the reference.

On wide screens, Core may use left/right space for optional:

- leaderboard;
- comments;
- profile/creator info;
- session stats;
- discovery/community context.

Do not enlarge the game non-uniformly just to consume every desktop pixel. Do not move canonical controls into sidebars.

The game's own backdrop may fill or overscan its **game surface** so the authored stage does not look like a narrow object floating inside its slot, but it must stop at the game-surface boundary. It must not turn a portrait Fugg into a browser-wide experience on desktop. For decorative backdrops, `cover` + crop is preferred when preserving visual scale matters: narrow screens may lose non-critical left/right decoration rather than shrinking the backdrop with `contain`. Gameplay geometry still uses the fixed logical stage and uniform FIT.

## 6. Phaser implementation

2D games use Phaser with a fixed logical width/height and aspect-preserving `FIT` scaling centered in the host.

Do not use Phaser `RESIZE` as the normal MiniFugg gameplay policy because it changes the game/canvas world dimensions with the parent.

Coordinates used by game objects, cameras and physics remain logical coordinates.

## 7. Three.js implementation

Three.js games also use a fixed authored logical composition. The renderer may resize its physical backbuffer with the host/device pixel ratio, but camera framing must preserve the intended canonical composition.

For perspective cameras, adapt renderer resolution/aspect deliberately without exposing new playable world merely because a desktop window is wider. Extra 3D overscan may exist decoratively, but gameplay-critical framing remains stable.

## 8. Legacy DOM layout

`.mf-game-layout`, `.mf-game-hud`, `.mf-game-stage`, `.mf-game-controls` and `--mf-*` layout tokens remain available only to keep legacy games functioning during migration and for ordinary Core/HTML UI where appropriate.

They are no longer the canonical strategy for gameplay geometry.

Do not spend migration time perfecting legacy responsive behavior. Replace it with the fixed logical stage.

## 9. Text and touch targets

Text and game controls authored inside the logical stage scale with the stage. Choose logical sizes that remain readable on the smallest supported phone.

Platform/Core HTML controls may use normal accessible CSS sizing and safe-area handling because they are outside the game-world geometry.

## 10. Validation matrix

Before a migrated/new game is marked current, verify at least:

- narrow phone portrait or landscape as appropriate;
- larger modern phone;
- tablet-sized viewport;
- desktop browser with significant unused side space;
- high-DPI device/emulation;
- touch input;
- keyboard/mouse input when supported.

Expected result: screenshots of the canonical stage should align after uniform scaling. Differences should be control affordances, pixel density or optional outside-stage content — not shifted gameplay composition.

### Optional raster density

PhaserGameHost accepts renderPixelRatio (default1, capped at2). This changes backing pixels only. A scene opting in must apply the same density as camera zoom and center on the canonical logical stage; pointer conversion must use that camera. LineFugg freezes density for the mounted session and tests touch at DPR2/3. Do not infer new gameplay dimensions from the backing canvas or reflow the stage.
