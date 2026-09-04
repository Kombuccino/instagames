# MiniFugg — Meta Progression & Achievements

Living specification for platform-level achievements, cross-game progression and cosmetic/content unlocks.

MiniFugg should feel like a small game platform, not only a feed of disconnected games.

Achievements provide persistent structure across games while keeping each individual game lightweight.

Read together with:

- `docs/PLATFORM_ART_DIRECTION.md`;
- `docs/PLATFORM_ENTRY_SCENES.md`;
- `docs/WELCOME_ILLUSTRATIONS.md`.

---

## 1. Product role

Achievements should reward:

- curiosity;
- variety;
- mastery;
- discovery;
- funny/specific behavior;
- participation in the MiniFugg ecosystem.

They should **not** turn MiniFugg into a grind-heavy retention machine.

Avoid designing the system around anxiety, mandatory daily streaks or endless progress bars.

The best MiniFugg achievement often feels like:

> "Oh, that's funny — I did that."

rather than:

> "I need 8,412 more points."

---

## 2. Two achievement layers

### Game achievements

Specific to one game.

Examples:

- reach a particular score;
- finish without making a certain mistake;
- trigger a rare mechanic;
- discover an unusual strategy;
- complete an intentionally absurd challenge.

The game reports achievement events/results through Core. It should not implement its own platform achievement UI.

### Meta achievements

Cross-game/platform achievements.

Examples:

- play 5 different MiniFugg games;
- finish 3 different Fugg games;
- earn one achievement in 5 different games;
- play games from several gameplay/art families;
- comment on a game and later replay it;
- unlock several collectible welcome covers;
- discover a hidden/rare Caca game;
- complete a platform-wide themed challenge.

Meta achievements are especially useful for unlocking platform content such as entry scenes.

---

## 3. Reward types

Achievements may unlock:

- new platform entry scenes;
- rare entry-scene variants;
- profile badges;
- mascot expressions/poses;
- small profile cosmetics;
- collectible Fugg cover variants when appropriate;
- special platform sound/music stings;
- future non-pay-to-win cosmetic items.

Avoid rewards that alter competitive game balance.

A reward can also simply be the achievement itself when the title/icon is funny or prestigious enough.

---

## 4. Entry scenes as a major meta reward

Rotating cold-open scenes are a particularly good persistent reward because they belong to MiniFugg as a whole rather than to one game.

Recommended launch logic:

- 2–3 scenes available immediately;
- several scenes tied to simple discovery achievements;
- a few rare scenes tied to harder or stranger achievements;
- optional seasonal/event scenes later.

Examples:

- `FIRST_FIVE` — play 5 different games → unlock Japanese metro;
- `FUGG_TRIPLET` — finish 3 different Fugg games → unlock late-night bed scene;
- `CURIOUS_BASTARD` — try Fugg + Beta + Caca → unlock waiting-room oddity;
- `MANY_WORLDS` — earn achievements in 5 different games → unlock a rare surreal scene.

Names above are provisional examples, not final copy.

---

## 5. Achievement design principles

Prefer achievements with personality.

Good categories:

- **progress** — clear skill/score milestone;
- **discovery** — find/try something;
- **constraint** — succeed while avoiding/limiting something;
- **style** — succeed in a distinctive way;
- **absurd** — funny edge case;
- **meta** — explore MiniFugg broadly;
- **social** — lightweight participation, never spammy.

Avoid achievements that encourage harassment, spam, dangerous real-world behavior or excessive repetitive play.

---

## 6. Visibility

The player should be able to see:

- recently earned achievements;
- total unlocked / total available where useful;
- achievement details per game;
- meta achievements;
- rewards unlocked from achievements.

Do not dump a giant trophy dashboard in the default gameplay flow.

Achievement UI belongs in profile/platform surfaces and lightweight toast/reward moments.

---

## 7. Unlock presentation

When an achievement unlocks something significant, the reward should feel tangible.

For example, a new entry scene can be presented as:

- achievement toast;
- small scene thumbnail/card;
- `NEW ENTRY SCENE UNLOCKED`;
- next launch optionally guarantees the new scene once before returning to weighted rotation.

This makes the reward understandable without requiring the user to search settings.

---

## 8. Stable IDs

Every production achievement should have a stable ASCII id.

Suggested convention:

- game achievement: `<game-id>:<achievement-id>`
- meta achievement: `meta:<achievement-id>`

Examples:

- `tetramindfck:score-5000`
- `train-fighter:no-collision-run`
- `meta:play-5-games`

Do not use translated display names as identifiers.

---

## 9. Suggested data shape

Conceptual model:

```ts
{
  id: 'meta:play-5-games',
  title: 'Five tiny worlds',
  description: 'Play five different MiniFugg games.',
  scope: 'meta',
  hidden: false,
  reward: {
    type: 'entry-scene',
    id: 'jp-metro'
  }
}
```

Progress/state belongs to platform data, not game-local UI state.

The exact backend/storage implementation can evolve independently from this product contract.

---

## 10. Core integration rule

Games should expose events/results to Core rather than directly mutating user achievement state.

Core owns:

- evaluation/persistence;
- unlock state;
- notification UI;
- profile/trophy display;
- reward availability;
- cross-game progress.

This keeps the 10-prompt game creation process focused on gameplay rather than reimplementing platform systems.

---

## 11. Initial implementation strategy

Do not build hundreds of achievements at once.

Recommended first production slice:

1. stable achievement registry in Core;
2. persistent earned-state model;
3. one or two simple per-game achievements for a pilot game;
4. three meta achievements;
5. entry-scene reward type;
6. compact unlock toast;
7. profile surface listing achievements/rewards.

Use this small system to test whether achievements feel playful and valuable before expanding the catalog.

---

## 12. Relationship to collectible Fugg covers

Fugg cover unlocks and achievements can coexist.

Score thresholds may still directly unlock cover variants, but some future special covers may be achievement rewards.

Keep the distinction clear:

- **cover unlocks** primarily enrich one game;
- **meta rewards** enrich the overall MiniFugg account/platform experience.

Do not make every reward an achievement just because the system exists.