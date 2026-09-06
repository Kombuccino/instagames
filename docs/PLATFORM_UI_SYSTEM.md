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

A new Core screen should be assembled from existing shared primitives and tokens before any new visual styling is invented.

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

If a new screen genuinely needs a new primitive, add that primitive centrally and document it here rather than styling it ad hoc inside the screen.

Target architecture:

- one central Core token/primitives stylesheet, e.g. `src/core/platformUi.css`;
- screen components use semantic shared classes;
- screen-specific CSS is limited to genuinely unique geometry, animation or exceptional composition;
- no duplicate literal font sizes, colors, radii and opacity recipes when a shared token/class already exists.

Existing files such as `styles.css`, `comments.css`, `profileLeaderboard.css`, `platformCover.css` and `platformGameLoop.css` currently contain overlapping legacy styling. They are migration sources, not permission to preserve several parallel design systems forever.

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

The exact implementation values may be adjusted once during consolidation, but the semantic token set should remain stable.

### 3.1 Color tokens

Recommended semantic names:

```css
--mf-ui-bg
--mf-ui-surface
--mf-ui-surface-raised
--mf-ui-text
--mf-ui-text-muted
--mf-ui-text-faint
--mf-ui-line
--mf-ui-accent
--mf-ui-coin
--mf-ui-success
--mf-ui-danger
```

Rules:

- normal text never receives a screen-specific color;
- muted/meta text uses the same opacity/value everywhere;
- separators use one shared hairline color;
- `999`/coin gold is semantic, not decorative;
- Creator styling uses one shared Creator treatment everywhere.

### 3.2 Typography tokens

Use one platform type family and a small stable hierarchy.

Recommended semantic roles:

```css
--mf-ui-type-display   /* rare large score/result display */
--mf-ui-type-h1        /* screen title */
--mf-ui-type-h2        /* major section title */
--mf-ui-type-h3        /* compact uppercase/eyebrow section label */
--mf-ui-type-body      /* ordinary readable UI text */
--mf-ui-type-label     /* button/tab/player label */
--mf-ui-type-meta      /* dates, counts, secondary metadata */
--mf-ui-type-micro     /* only for truly secondary compact data */
```

Do not create `13px` body text in one panel and `11px` body text in another simply because they were authored separately.

Suggested initial hierarchy for the phone Core viewport:

- display: `clamp(44px, 12vw, 64px)`;
- H1: `26px`;
- H2: `17px`;
- H3 / eyebrow: `11px`, uppercase, restrained tracking;
- body: `13px`;
- label: `12px`;
- meta: `10px`;
- micro: `9px`.

These are platform roles, not game typography rules.

### 3.3 Spacing tokens

Use a short spacing scale rather than arbitrary margins:

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

- tiny authored object / cover selector: ~4px;
- standard control / compact panel action: ~8px;
- pill only when the interaction genuinely calls for it (Insert Coin, compact status chip);
- avoid arbitrary 11/13/18/20/24/26px families across different screens.

---

## 4. Shared semantic classes / primitives

The consolidation implementation should expose primitives equivalent to the following.

### Text

```css
.mf-ui-h1
.mf-ui-h2
.mf-ui-h3
.mf-ui-body
.mf-ui-label
.mf-ui-meta
.mf-ui-micro
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

The active underline is a short red hairline centered under the tab label, not a full-width bar offset from the text.

### Identity

```css
.mf-ui-player
.mf-ui-player-name
.mf-ui-avatar
.mf-ui-badge
.mf-ui-badge.is-creator
.mf-ui-badge.is-999
```

There must not be several unrelated nickname font sizes or badge geometries depending on whether the player appears in Comments, Leaderboard, Creator or Profile.

### Lists

```css
.mf-ui-list
.mf-ui-list-row
.mf-ui-list-row.is-current
.mf-ui-list-row.is-pinned
```

Default list rows are separated by spacing and alignment, **not horizontal rules between every row**.

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

## 5. Player identity system

Player identity must look consistent everywhere.

### 5.1 Free player

- simple neutral avatar treatment;
- standard player-name class;
- no badge.

### 5.2 Creator

- may receive a richer avatar treatment;
- one canonical `CREATOR` badge;
- badge appearance is identical in Comments, Leaderboard, Profile and any future social screen.

### 5.3 Lifetime / paid player

- user-facing name is **`999`**;
- one canonical compact `999` badge;
- may receive a richer avatar treatment;
- never use `Paid`, `Fugg+` or another synonym on a different screen.

Badges must remain secondary to the player's name and content.

---

## 6. Heading hierarchy

Use semantic hierarchy rather than styling text locally.

- H1: the screen itself, e.g. `LEADERBOARD`;
- H2: a major section within a long screen, e.g. `HOW TO PLAY`, `CREATOR`;
- H3 / eyebrow: compact metadata/section cue where needed;
- body: description/comment/rule text;
- meta: creation date, update date, timestamps, counts;
- micro: only secondary information that remains optional to comprehension.

A future screen should normally need no new typography design if these roles are sufficient.

---

## 7. Leaderboard UI contract

Leaderboard uses the same shared panel, typography, player identity and tabs as the rest of Core.

### 7.1 Tabs

Leaderboard exposes three product tabs:

- `DAY`;
- `WEEK`;
- `FRIENDS`.

The labels are visually centered with their active red underline centered directly beneath the label.

`FRIENDS` is a real product direction even if the social/friend backend is not yet complete; do not substitute unrelated filters such as genre/platform.

### 7.2 Ranking list

- allow scrolling through the first **100** ranks;
- no horizontal separator lines between players;
- use vertical rhythm/alignment instead;
- rank, avatar, player name/badges and score use shared primitives;
- top positions may receive restrained rank emphasis without changing the entire row vocabulary.

### 7.3 Current player

If the player's row is currently visible in the scroll viewport:

- highlight that row subtly with `.is-current`;
- do not duplicate it as a pinned row.

If the player's row is outside the current visible viewport:

- show a compact pinned personal row at the bottom;
- remove/hide the pinned duplicate as soon as the real row becomes visible again.

If the player is outside the top 100, the pinned row may remain available when backend rank data exists.

Never fabricate a rank.

### 7.4 Back behavior

The top-left arrow is **contextual Back**, not a fixed destination called “Social”.

- leaderboard opened from Info -> return to the same Info panel and preserve its previous scroll position;
- leaderboard opened from Game Over -> return to that Game Over state;
- future entry points return to their actual origin.

This behavior should be implemented as Core navigation history/context rather than duplicated per screen.

### 7.5 Footer

No decorative MiniFugg baseline/tagline at the bottom of the functional leaderboard panel.

---

## 8. Active gameplay shell

Active gameplay stays almost fullscreen.

The single Core close-box/back affordance remains enough by default.

It uses the shared icon-action/touch-target rules but does not introduce persistent Core score, coins, social buttons or title chrome over the game.

---

## 9. End-of-run / Game Over contract

The game stays frozen behind the Core result surface. Never reuse cover artwork.

### Content hierarchy

Minimum content:

1. `GAME OVER` / end-of-run title;
2. final score;
3. personal best;
4. current ranking summary when available;
5. replay action with correct coin cost;
6. leaderboard action when supported;
7. **`RAGE QUIT`** returning to the same cover.

Do **not** place the MiniFugg logo in the result plate.

### Current ranking summary

Show a compact rank result near the score/best data:

- `TOP 5`;
- `TOP 46`;
- `> TOP 100` when the player is outside the top hundred;
- hide the ranking field when no valid leaderboard rank is available.

Use the same rank semantics/data source as Leaderboard; do not calculate a fake position client-side.

`RAGE QUIT` is intentionally playful MiniFugg copy. It is live UI text and therefore remains localizable even if English is the default authored phrase.

---

## 10. CSS consolidation rules

When the current integration is stabilized, perform a deliberate Core CSS consolidation pass.

### Required migration goals

1. Introduce central semantic tokens and primitives before deleting legacy rules.
2. Migrate Cover, Info, Comments, Leaderboard, Game Over, Profile/Creator and future Settings screens to them.
3. Remove duplicate local declarations after all callers are migrated.
4. Keep screen-local CSS only for genuinely unique composition/motion.
5. Do not use CSS selector specificity wars to make old and new systems coexist permanently.
6. Avoid `:has(...)`-based screen theming when a semantic component class can express the same state more clearly.
7. A player identity component/class must render consistently across all social surfaces.
8. A badge gets one semantic class and one treatment globally.
9. A heading role gets one class/token globally.
10. Ordinary body copy gets one shared style globally.

### Review test for every new Core screen

Before adding CSS, ask:

- Is this text already one of the defined typography roles?
- Is this an existing panel/list/tab/action/avatar/badge primitive?
- Is the new value semantic or merely a one-off visual tweak?
- Would changing this shared primitive later update every relevant screen correctly?

If yes, reuse the primitive instead of writing new screen CSS.

---

## 11. Current known migration debt

The repository currently contains overlapping Core styling in several places. Examples include:

- `src/styles.css`: legacy generic sheets, leaderboard, comments, finish state;
- `src/core/comments.css`: a second comments-specific typography/layout system;
- `src/core/commentPlayerIcons.css`: separate avatar treatment;
- `src/core/profileLeaderboard.css`: additional current-player/leaderboard overrides;
- `src/core/platformCover.css`: newer validated Cover/Info/Comments family;
- `src/core/platformGameLoop.css`: newer leaderboard/game-over/gameplay-shell refinements.

This fragmentation explains why small visual differences appear between screens even when they are meant to belong to one system.

Do not solve this by adding another stylesheet with another independent visual vocabulary. Consolidate toward the shared semantic system above.
