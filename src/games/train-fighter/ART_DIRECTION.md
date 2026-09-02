# Train Fighter — Art Direction v2

## 0. North star

**A tiny post-apocalyptic toy railway that survived the end of the world and decided to have fun anyway.**

Train Fighter must feel like a collectible pixel-art toy set: cute, battered, readable, absurd, kinetic. The world is broken but never depressing. The player should want to protect the locomotive, collect new gear and see the next biome.

The visual shorthand is **post-apo kawaii + chunky pixel art + toy-like silhouettes**. References can evoke the energy of miniature road-warrior machinery and expressive adventure cartoons, but the final shapes, faces, palette and props must stay original.

## 1. Style system

- Base kits: **Pixel Dungeon + Toybox**.
- Pixel Dungeon contributes the hard pixel edges, base-unit discipline, silhouette-first readability and 1–3 frame impact language.
- Toybox contributes chunky volume, painted materials, oversized objects, wobble/bounce and tactile toy proportions.
- Orientation: **portrait**.
- Density: **balanced**. Scenery can be rich at the edges; rails, enemies, loot and decisions remain visually dominant.
- Spatial language: **pseudo-3D / forced-perspective railway**, viewed from above/front. The horizon sits high; rails widen toward the player.
- Motion: juicy but short. No floaty UI easing.

## 2. Pixel grammar

### Native design grid

- Art is authored on a **24 px base logic**.
- Character silhouettes use 2 px and 3 px steps at native sprite scale.
- Runtime scaling must be integer-looking whenever possible and use `image-rendering: pixelated` for raster derivatives.
- No sub-pixel decorative linework.
- No smooth vector-gradient shading inside production sprites.

### Shading rule

Every important object uses a maximum of four value bands:

1. near-black outline;
2. local shadow;
3. base color;
4. small highlight.

Highlights are tiny and directional. Damage is shown with chips, dents, patches and darker pixels rather than realistic grime.

### Outline hierarchy

- hero/enemies: 2–3 px-equivalent dark outer contour;
- pickups/equipment: 2 px-equivalent contour;
- scenery: 1–2 px-equivalent contour and lower contrast;
- distant scenery can lose outlines entirely.

## 3. Master palette

### Global

- `INK` #252628 — primary outline
- `INK_SOFT` #414247 — secondary outline / shadow
- `CREAM` #FFF1C7 — warm light
- `PAPER` #F5DDA4 — dusty neutral
- `RUST` #B96545 — worn metal
- `RUST_DARK` #754434 — deep rust
- `BOLT` #A9B1AA — grey metal
- `BOLT_DARK` #646B68 — metal shadow

### Hero

- `HERO_BLUE` #4C9ED9
- `HERO_BLUE_DARK` #2E6F9A
- `HERO_RED` #E9584C
- `HERO_RED_DARK` #9E3C36
- `HERO_YELLOW` #F4C84A
- `FACE` #FFE6B2

### Positive / loot accents

- `COIN` #FFD354
- `COIN_SHADOW` #C58A2E
- `SHIELD` #74D4DF
- `TURBO` #F8E75A
- `GOOD_GREEN` #6CBF67

### Danger

- `DANGER` #E65145
- `DANGER_DARK` #91352F
- `ENEMY_PURPLE` #805B8F is allowed only as a local enemy material, never as a neon UI system.

## 4. Biome palettes

### 1 — Mossy Forest

Mood: abandoned railway swallowed by playful nature.

- ground #7FAF65
- dark foliage #3F7548
- light foliage #9BCB70
- wood #93623F
- sky #A9D8D1
- accent flowers/sign paint #E9A15A

Props: mossy sleepers, bent signs, vine-wrapped signals, toy pines, abandoned hut, wagon shell used as planter, birds on cables.

### 2 — Red Canyon

Mood: hot rust, junkyard railway, ghost station.

- sand #D79C5D
- light sand #E8C17D
- canyon #B96445
- canyon shadow #77463B
- dry brush #8D8B50
- sky #E8C99B

Props: cactus-like scrap sculptures, telegraph poles, half-buried wheels, corrugated shacks, fuel drums, torn banners.

### 3 — Cloud Mountain

Mood: precarious elevated rail engineering.

- rock #74877B
- rock light #9CA79A
- pine #416B59
- cold metal #6D8585
- cloud #D9E3D8
- sky #9DBDBA

Props: viaducts, tunnel mouths, cable machinery, warning lamps, broken maintenance cranes, little alpine shelters.

### 4 — Aurora Pass

Mood: strange calm at the end of the world.

- snow #E5F1E9
- ice #A9D6D7
- deep ice #608A9B
- night #374F67
- aurora green #78C79D
- salvage accent #E78F5E

Props: frozen signals, snow-capped junk, iced-over station lamps, colored scrap half buried in snow, aurora ribbons kept broad and low-detail.

## 5. Hero locomotive

The hero is the single strongest silhouette in the game.

### Shape

- short, squat locomotive body;
- oversized circular front / nose;
- readable chimney and cab roof;
- two side arms with simple elbow joints;
- two large visible wheels plus one hint of a rear wheel;
- face integrated into the front window / boiler plate;
- slightly asymmetric repairs so it feels loved and used.

### Personality

Default expression: determined smile, curious eyebrows. During combat the eyebrows angle down, mouth compresses. On loot pickup: wide eyes. On wagon loss: tiny shocked mouth. On station arrival: relieved closed-eye smile.

### Damage language

Never gore. Use:

- paint chips;
- loose bolt;
- bent bumper;
- soot puff;
- springy arm recoil;
- briefly flickering headlamp.

## 6. Wagons = health

Wagons are not generic HP icons. They are the physical emotional cost of combat.

- closest three wagons are rendered clearly behind the loco;
- deeper life can collapse into `+N` only in the HUD layer;
- each wagon has a slightly different cargo silhouette or patch pattern;
- when lost, a wagon pops loose, yaws outward and exits with 2–4 debris pixels;
- when gained, a wagon snaps onto the coupler with a satisfying bounce and dust puff.

Primary wagon base: cream/rust with a colored cargo strip so it remains distinct from the hero.

## 7. Enemy families

All enemies remain cute enough to collect as figurines. Their threat comes from silhouette and expression, not realism.

### Punk Runner

Fast, narrow, forward spikes, mohawk chimney, angry eyebrows. Low durability.

### Jaw Raider

Front bumper forms a ridiculous metal jaw. Mid-weight bruiser.

### Tanker Bully

Wide body, tiny wheels, armor plates, low roof. Slow and tough.

### Scrap Goblin

Asymmetric junk-built train with one oversized lamp, dangling chain and mismatched panels. Unpredictable/comedic.

Tier growth should add one major shape cue, not random details: bigger jaw, extra plate, second exhaust, bigger spring arm.

## 8. Equipment family

Equipment must be readable at approximately thumb-nail size on a phone. Each item is oversized relative to the arm.

Production set:

1. `boxing-glove` — bright red padded glove;
2. `big-wrench` — chunky steel wrench with tape grip;
3. `spring-hammer` — square hammer head on visible coil;
4. `buzz-saw` — cartoon toothed disk with yellow guard;
5. `pop-cannon` — stubby pipe cannon made from scrap;
6. `spring-fist` — mechanical fist on red coil.

No realistic firearms. Even ranged weapons look like improvised toys.

## 9. Pickups

Pickups use a high-contrast cream outline halo or backing shape so they never merge with the biome.

- coin: chunky hex/round token with punched rail-wheel mark;
- wagon: miniature wagon block + plus;
- shield: translucent-looking cyan bubble represented with solid pixels, not alpha-heavy glass;
- turbo: yellow lightning bolt inside a red engine badge;
- weapon: red/cream scrap crate with oversized tool silhouette.

All pickups bob by 1–2 native pixels and occasionally flash one highlight pixel.

## 10. Rails and track world

Rails are the gameplay grid and always beat scenery in contrast.

- dark sleepers, warm metal rails, light inner highlight;
- rails widen toward the player;
- current lane can gain a subtle repeated yellow bolt/paint marker, never a glowing neon line;
- junction readability comes from visible rail divergence + a chunky railway arrow sign;
- scenery must never cross the active rail decision line in a way that resembles loot or an enemy.

## 11. Stations

Stations are emotional punctuation: warm, safe, funny.

Visual recipe:

- cream/red striped canopy;
- crooked hand-painted station name;
- warm yellow lamps;
- stacked junk crates and tires;
- small repair robot / vendor silhouette optional;
- clearer geometry and calmer animation than combat scenes.

Station UI should feel like signs physically attached to the platform rather than floating sci-fi cards.

## 12. UI / HUD

The UI is game-specific only where the mechanic requires it; MiniFugg Core still owns common score/social/replay surfaces.

- Use chunky pixel labels and high contrast.
- Large left/right controls should resemble battered railway switch plates.
- Critical icon minimum visual size: roughly `--mf-touch-sm` footprint.
- Buttons use 1 hard shadow step and 1 highlight edge, no glossy gradient.
- Typography direction: square / arcade / bitmap feeling, but browser fallback must remain readable. Never use micro-copy below the shared text hierarchy.
- Respect `.mf-game-layout`, safe zones and bottom swipe gutter.

## 13. Motion / animation language

### Locomotion

- 2-frame body bob;
- wheels rotate / alternate spoke pixels;
- chimney emits small 3-frame soot puffs;
- arms lag one frame behind lane changes.

### Lane change

Snap to lane with a tiny one-step overshoot. Duration should feel like 120–180 ms, not a smooth one-second slide.

### Combat

- 1 frame anticipation;
- 1–2 frame hit-stop;
- impact star + 3–6 bolt pixels;
- enemy squash / tilt;
- optional 1–2 px camera nudge.

### Pickup

- 1-frame scale pop or sprite swap;
- little upward sparkle;
- no confetti cloud that hides the rails.

## 14. Asset architecture

Runtime-ready source sheets live in `src/games/train-fighter/assets/`.

- `train-fighter-sprites.svg` — hero, wagon, enemy families, equipment, pickups and FX/UI symbols.
- `train-fighter-biomes.svg` — biome props, rail signs, station pieces and environmental symbols.
- `train-fighter-styleboard.svg` — visual target board / implementation reference.
- `README.md` — integration rules and SVG `<use>` examples.

See `ASSET_MANIFEST.md` for IDs, intended sizes and implementation notes.

## 15. Hard avoids

- realistic post-apocalypse;
- grey/brown mud everywhere;
- gore;
- hard military aesthetic;
- baby-pastel kawaii;
- generic cyberpunk / neon purple-cyan ambience;
- glassmorphism;
- anti-aliased tiny vector detail pretending to be pixel art;
- text baked into runtime sprites;
- scenery with the same contrast/scale as loot;
- weapon silhouettes too small to understand on mobile;
- random detail accumulation without silhouette purpose.

## 16. Acceptance test

A screenshot at phone width should pass these checks in under two seconds:

1. the player immediately finds the blue/red hero loco;
2. active rails and next junction are obvious;
3. enemy vs loot is unmistakable from silhouette alone;
4. equipped weapon is identifiable without reading text;
5. wagon health is physically visible;
6. biome is identifiable without a label;
7. nothing important competes with MiniFugg Core chrome.
