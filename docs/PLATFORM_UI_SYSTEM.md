# MiniFugg — Platform UI System

This document is the normative visual/CSS contract for shared MiniFugg Core interfaces.

Its purpose is to prevent every new panel from inventing a slightly different typography scale, player-name treatment, badge family, separator rhythm, button radius, avatar size or heading hierarchy.

Read together with:

- `docs/PLATFORM_UI_BASELINE.md` for the canonical visual reference;
- `docs/PLATFORM_VISUAL_VALIDATION.md` for explicitly approved screens/states;
- `docs/GAMEPLAY_SHELL.md` for active-game, leaderboard and end-of-run behavior;
- `docs/DISCOVERY_NAVIGATION.md` for cover/feed interactions.

This contract applies to **MiniFugg Core UI**, not to the independent art direction inside each game.

---

## 1. Core rule: one UI language, many screens

A new Core screen must be assembled from existing shared primitives and tokens before any new visual styling is invented.

Do not create one unrelated CSS vocabulary per screen.

In particular, do not create local variants for:

- ordinary body text;
- player nicknames;
- metadata text;
- level-1 / level-2 / level-3 headings;
- tabs;
- avatars;
- Creator / 999 badges;
- standard icon buttons;
- list rows;
- standard panels;
- text fields;
- primary / secondary actions.

A new style is justified only when its **visual identity or function is genuinely different**. Semantic function is allowed to justify a separate primitive when future behavior may diverge even if the current appearance is similar. Example: a one-line helper and a long game description may start with similar typography but are different semantic roles and may legitimately evolve separately. Conversely, a game description and a developer description are ordinary descriptive body copy and should share the same style unless the product explicitly changes that rule.

If a new screen genuinely needs a new primitive, add that primitive centrally and document it here rather than styling it ad hoc inside the screen.

Current architecture:

- `src/core/platformUi.css` owns shared Core tokens and primitives;
- screen components use semantic shared classes or temporary centrally-defined compatibility selectors;
- screen-specific CSS is limited to genuinely unique geometry, animation, authored objects or exceptional composition;
- no duplicate literal font sizes, colors, radii and opacity recipes when a shared token/class already exists.

---

## 2. Canonical visual character

Shared Core UI uses the validated MiniFugg platform language:

- graphite / near-black base;
- warm white primary text;
- restrained grey secondary text;
- thin hairlines only when structurally useful;
- rare red accent for selection/focus/brand rhythm;
- gold only for coin / `999` / reward semantics;
- flat editorial surfaces rather than glossy gaming dashboards;
- little or no glow except the already validated Insert Coin / replay coin affordance;
- minimal rounded-card usage;
- no glassmorphism card soup;
- no purple/cyan default palette;
- no decorative baseline/tagline at the bottom of functional panels.

---

## 3. Shared design tokens

The semantic token set lives in `src/core/platformUi.css`.

### 3.1 Color tokens

```css
--mf-ui-bg
--mf-ui-surface
--mf-ui-surface-raised
--mf-ui-text
--mf-ui-text-muted
--mf-ui-text-faint
--mf-ui-line
--mf-ui-line-strong
--mf-ui-accent
--mf-ui-coin
--mf-ui-success
--mf-ui-danger
```

Rules:

- normal text never receives a screen-specific color;
- muted/meta text uses the same token everywhere;
- separators use shared hairline colors;
- `999`/coin gold is semantic, not decorative;
- Creator styling uses one shared Creator treatment everywhere.

### 3.2 Typography tokens

Use one platform type family and a small stable hierarchy.

```css
--mf-ui-type-display   /* rare large score/result display */
--mf-ui-type-h1        /* screen title */
--mf-ui-type-h2        /* major section title */
--mf-ui-type-h3        /* compact uppercase/eyebrow section label */
--mf-ui-type-body      /* ordinary readable descriptive UI text */
--mf-ui-type-label     /* tabs, actions and small identity labels */
--mf-ui-type-meta      /* dates, counts, secondary metadata */
--mf-ui-type-micro     /* only truly secondary compact data */
```

Current phone hierarchy:

- display: `clamp(44px, 12vw, 64px)`;
- H1: `26px`;
- H2: `17px`;
- H3 / eyebrow: `11px`;
- body: `13px`;
- label: `12px`;
- meta: `10px`;
- micro: `9px`.

These are platform roles, not game typography rules.

### 3.3 Spacing tokens

```css
--mf-ui-space-1: 4px;
--mf-ui-space-2: 8px;
--mf-ui-space-3: 12px;
--mf-ui-space-4: 16px;
--mf-ui-space-5: 24px;
--mf-ui-space-6: 32px;
```

### 3.4 Radius tokens

Keep the radius vocabulary intentionally small:

- authored tiny object / cover selector: `--mf-ui-radius-xs`;
- standard control / compact panel action: `--mf-ui-radius-sm`;
- pill only when the interaction genuinely calls for it, e.g. badge or Insert Coin-derived treatment;
- do not invent arbitrary radius families per screen.

---

## 4. Shared semantic classes / primitives

### Text

```css
.mf-ui-h1
.mf-ui-h2
.mf-ui-h3
.mf-ui-body
.mf-ui-label
.mf-ui-meta
.mf-ui-micro
.mf-ui-display
```

### Screen / panel

```css
.mf-ui-screen
.mf-ui-panel
.mf-ui-panel-header
.mf-ui-scroll
.mf-ui-section
```

### Tabs

```css
.mf-ui-tabs
.mf-ui-tab
.mf-ui-tab.is-active
```

The active underline is one short red hairline centered directly under the active label.

### Identity

```css
.mf-ui-player
.mf-ui-player-name
.mf-ui-avatar
.mf-ui-badge
.mf-ui-badge.is-creator
.mf-ui-badge.is-999
```

**A player nickname has one canonical small-UI treatment everywhere.** Comments, Leaderboard, Creator/Profile references and future social surfaces must not silently choose different font sizes/weights just because they are different components.

### Lists

```css
.mf-ui-list
.mf-ui-list-row
.mf-ui-list-row.is-current
.mf-ui-list-row.is-pinned
```

Default list rows are separated by spacing and alignment, not horizontal rules between every row.

### Actions / fields

```css
.mf-ui-action
.mf-ui-action.is-primary
.mf-ui-action.is-secondary
.mf-ui-icon-action
.mf-ui-field
```

Do not invent a new button radius, text weight or hover recipe for every screen.

---

## 5. Semantic distinction test

Reuse is based on meaning as well as appearance.

Before creating a new class, classify the element:

1. **Same meaning + same appearance** -> same primitive/class.
2. **Different meaning + same appearance today** -> it may receive a separate semantic class only if there is a credible reason for the roles to evolve independently; both should initially inherit common tokens.
3. **Same meaning + desired different appearance on one screen** -> normally reject the local difference and fix the shared primitive instead.
4. **Different interaction/composition** -> screen-local CSS is allowed for the unique geometry/behavior, while its typography/colors/identity still reuse shared primitives.

Examples:

- game description + developer description -> shared descriptive body role;
- player nickname in Comments + player nickname in Leaderboard -> exact same player-name role;
- comment timestamp + game update date -> shared meta role;
- creator portrait in a profile hero + tiny comment avatar -> different functional sizes are legitimate, but both use the same avatar identity treatment;
- Insert Coin / replay coin cartouche -> legitimate exceptional authored action;
- borderless social icons over cover artwork -> legitimate cover-specific composition;
- comment reply indentation/tree line -> legitimate comments-specific geometry.

---

## 6. Player identity system

Player identity must look consistent everywhere.

### 6.1 Free player

- simple neutral avatar treatment;
- standard player-name class;
- no badge.

### 6.2 Creator

- may receive a richer avatar treatment;
- one canonical `CREATOR` badge;
- badge appearance is identical in Comments, Leaderboard, Profile and any future social screen.

### 6.3 Lifetime / paid player

- user-facing badge name is **`999`**;
- one canonical compact `999` badge;
- may receive a richer avatar treatment;
- never use `Paid`, `Fugg+` or another synonym on a different screen.

Badges remain secondary to the player's name and content.

---

## 7. Heading hierarchy

Use semantic hierarchy rather than styling text locally.

- H1: screen/page title;
- H2: major section within a long screen;
- H3 / eyebrow: compact section cue;
- body: description/comment/rule text;
- label: tab/action/player identity label;
- meta: creation date, update date, timestamps, counts;
- micro: optional secondary information only;
- display: exceptional large result/score value.

A future screen should normally require no new typography design if these roles are sufficient.

---

## 8. Leaderboard UI contract

Leaderboard uses the same shared panel, typography, player identity and tabs as the rest of Core.

### Tabs

Product target:

- `DAY`;
- `WEEK`;
- `FRIENDS`.

The labels are centered and the active red underline is centered directly beneath the label.

`FRIENDS` is a real product direction even if its backend is not yet implemented.

### Ranking list

- allow scrolling through the first 100 ranks;
- no horizontal separator lines between players;
- use vertical rhythm/alignment instead;
- rank, avatar, player name/badges and score use shared primitives;
- top positions may receive restrained rank emphasis without creating a different row component.

### Current player

If the player's row is visible:

- highlight it subtly with `.is-current`;
- do not duplicate it as a pinned row.

If it is outside the current scroll viewport:

- show a compact pinned personal row;
- hide the pinned duplicate as soon as the real row becomes visible.

If the player is outside the top 100, the pinned row may remain when backend rank data exists. Never fabricate a rank.

### Back behavior

Back is contextual:

- Leaderboard from Info -> return to same Info panel / previous scroll position;
- Leaderboard from Game Over -> return to Game Over;
- future entry points return to their actual origin.

No decorative MiniFugg baseline/tagline at the bottom.

---

## 9. Active gameplay and Game Over

Active gameplay stays almost fullscreen. The small close-box edge control is a deliberately unique gameplay-shell affordance, but normal typography/icon rules remain shared.

Game Over:

- frozen game remains behind the Core result surface;
- never reuse cover art;
- no MiniFugg logo in the result plate;
- final score, best and ranking summary use shared typography;
- replay reuses the exceptional Insert Coin tactile vocabulary;
- Leaderboard uses the normal action primitive;
- `RAGE QUIT` is the intended live/localizable quit copy;
- ranking summary may show `TOP 5`, `TOP 46`, `> TOP 100` only when backed by real rank data.

---

## 10. Consolidation status — 2026-09-06

The first active CSS consolidation pass is complete.

### Active bundle

`src/main.tsx` now loads only the shared/current Core stack relevant to the live app:

- `src/styles.css` — global reset, feed/frame geometry only;
- `src/core/platformUi.css` — **central shared Core tokens and primitives**;
- `src/core/orientation.css`;
- `src/core/gameLayout.css`;
- `src/core/platformGameLoop.css` — only unique gameplay/leaderboard/result composition.

`PlatformCoverShell.tsx` loads `platformCover.css` locally because Cover/Info/Comments have real component-specific geometry. That file now delegates normal typography, player identity, badges, fields, generic actions and colors to `platformUi.css`.

### Removed from the active global CSS stack

The live V2 app no longer globally imports:

- `coreIcons.css`;
- `actionDock.css`;
- `curationBadges.css`;
- `comments.css`;
- `commentPlayerIcons.css`;
- `profileLeaderboard.css`;
- `desktopDock.css`.

These files may remain temporarily in the repository while the legacy `GameRuntime.tsx` is retained, but they are not a second design system for new work and must not be imported by new Core screens.

### `styles.css`

Legacy generic panel/comments/leaderboard/game-over styling was removed from `src/styles.css`. It is now limited to global document/feed/game-surface framing.

### `platformCover.css`

Now keeps only genuinely Cover/Info/Comments-specific concerns, including:

- full-cover artwork geometry;
- borderless overlay rail;
- authored pixel coins / Insert Coin;
- full-panel transition geometry;
- cover selector / locked-cover treatment;
- Info section layout;
- creator grid layout;
- comment thread/reply/composer geometry.

It does **not** own a parallel normal typography/badge/player-name system anymore.

### `platformGameLoop.css`

Now keeps only runtime-specific concerns:

- close-box edge affordance;
- gameplay feed-lock behavior;
- full leaderboard composition;
- leaderboard list geometry;
- frozen-game result overlay;
- exceptional replay cartouche treatment.

Normal text/actions/colors come from `platformUi.css`.

### Compatibility selectors

Some current V2 JSX still uses component-era names such as `.mf-comment-meta strong`. During this migration, `platformUi.css` centrally maps those selectors onto the semantic system. New components should prefer `.mf-ui-*` classes directly. Compatibility aliases should be removed gradually when the corresponding JSX is cleaned up; do not recreate local equivalents.

---

## 11. Rules for every future Core screen

Before adding CSS, ask:

- Is this text already one of the defined semantic typography roles?
- Is this person already represented by the shared player-name/avatar/badge system?
- Is this an existing panel/list/tab/action/field primitive?
- Is the proposed new value semantic or merely a one-off visual tweak?
- Would changing a shared primitive later correctly update every relevant screen?

If yes, reuse the primitive.

Create screen-local CSS only for genuinely different:

- geometry/layout;
- interaction behavior;
- animation;
- authored visual object;
- exceptional product affordance.

Do not use selector-specificity wars or another stylesheet to create a parallel MiniFugg UI language.
