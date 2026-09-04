# MiniFugg — Platform Entry Scenes

Living specification for MiniFugg cold-open scenes and the seamless transition from the physical/world scene into the live MiniFugg interface.

Read together with:

- `docs/PLATFORM_ART_DIRECTION.md` for the platform brand and Core visual language;
- `docs/META_PROGRESSION.md` for achievements and unlock rules;
- `docs/ASSET_PIPELINE.md` for every production visual asset.

This system belongs to **MiniFugg Core**, not to any individual game.

---

## 1. Core idea

MiniFugg should not have one permanent decorative splash image.

The preferred Device Portal direction becomes a **library of short everyday or absurd scenes**. On each return to MiniFugg, the player may enter through a different scene.

The common invariant is:

> **The player is physically somewhere, their own arm/hand is visible, they are holding a phone, MiniFugg is already alive on that phone, and entering the platform means moving into that screen.**

The phone is never a floating magical device. It is held by the player or naturally placed in their immediate physical context.

The scene is only the outside world. The phone screen is the bridge to the actual product.

---

## 2. Why rotating scenes matter

Rotating entry scenes can become a recognizable MiniFugg signature and a small reason to enjoy returning to the platform.

They should create the feeling that MiniFugg can be played in tiny stolen moments anywhere:

- while commuting;
- while waiting;
- while bored;
- while avoiding something else;
- during an awkward social moment;
- in an unexpectedly absurd place.

The scenes should not explain the current game catalog. They express **the habit and pleasure of opening MiniFugg**.

The platform therefore gains an expandable universe without having to invent one giant permanent fantasy world.

---

## 3. First-person point of view is a key rule

For the main Device Portal family, the camera should usually be the player's own point of view.

Visible cues may include:

- forearm / hand holding the phone;
- knees / shoes / table edge / seat;
- a small amount of immediate environment;
- people or objects around the player;
- the live phone screen as the focal point.

The viewer should understand the situation in roughly one second.

Avoid cinematic third-person compositions showing a generic protagonist using MiniFugg. The user should feel **I am here**, not **I am watching a character**.

Hands/arms must stay visually simple and believable. They are framing devices, not hero characters.

---

## 4. Scene design rules

Each scene should be recognizable quickly and remain graphically light.

Prefer:

- one clear location;
- one clear social situation;
- 2–5 major background elements maximum;
- strong silhouette and camera framing;
- large calm areas;
- one or two small animated details;
- believable lighting;
- restrained materials;
- a limited palette appropriate to the place.

Do not fill the scene with game references, easter eggs or catalog objects by default.

The visual interest should come from **situation + framing + light + motion**, not object density.

The scene may be funny, awkward, cool, mundane or slightly inappropriate. It should still feel authored rather than random.

---

## 5. Initial scene families

These are examples, not a fixed catalog.

### Japanese metro

First-person seated or standing view in a contemporary Japanese train.

Recognizable cues:

- train interior / straps / doors / restrained signage;
- passengers partly asleep or looking at their own phones;
- subtle carriage sway;
- one nearby passenger's head slowly nodding with sleep;
- player's hand holding the MiniFugg phone in foreground.

The scene should feel observed and specific, not like a tourist caricature of Japan.

### Toilet

A mundane private moment with the player's knees/legs and one hand holding the phone.

Possible micro-motion:

- fluorescent light flicker;
- extractor fan shadow;
- toilet-paper edge moving slightly;
- tiny mascot appearance in the phone UI.

The humor comes from recognizability, not gross detail.

### Date / restaurant

Player sits across from an attractive date while quietly opening MiniFugg.

The date may look bored, amused, offended or also be checking their own phone.

Keep the scene adult/social rather than romantic-kitsch.

### Family / dinner table

The phone sits just below table level or is held discreetly while a meal/conversation continues around it.

### Waiting room

Doctor, administration, garage, airport, dentist, etc. A perfect "tiny game moment" context.

### Bed / late night

Dark room, phone lighting the hand/blanket, sparse environment, possibly another sleeping person or pet nearby.

### Office / meeting

Phone hidden below a desk while a meeting continues. A projector glow or colleague movement can provide subtle animation.

### Laundromat / station / airport

Strong recognizable environment, repetitive ambient motion, easy to render lightly.

### Car / deliberately inappropriate situation

This may exist as an obviously satirical/absurd scene because MiniFugg can have mischievous adult humor.

Do **not** frame it as advice to use a phone while driving. Prefer a visibly parked/stopped vehicle, a red-light gag, or an impossible exaggerated context that reads as fiction rather than instruction.

### More absurd future scenes

Once the basic everyday language is established, unlockable rare scenes can become much stranger while preserving the same first-person phone grammar.

Examples: jury duty, funeral waiting area, backstage before a concert, spaceship airlock, medieval banquet, submarine, alien customs desk, etc.

These should be rare surprises, not the baseline visual identity.

---

## 6. The logo does not rotate

Scenes can change. The MiniFugg identity does not.

The following remain stable across every entry scene:

- MiniFugg wordmark;
- MiniFugg symbol/mascot mark;
- platform typography;
- Core icon language;
- primary accent logic;
- motion signature for entering the screen.

The logo must not be redesigned to match each environment.

It can be physically integrated differently — reflected in glass, printed on a sticker, displayed on the phone, briefly projected by light — but the mark itself remains the same.

This consistency is essential for marketing, app icon, social media and product recognition.

---

## 7. Phone screen = live product whenever possible

The screen inside the phone should preferably be a **live DOM viewport**, not painted into the scene raster.

It may show:

- MiniFugg logo / minimal boot state;
- the first feed item;
- the first unlocked Fugg cover;
- a game selected from the user's context;
- a lightweight animated MiniFugg idle state.

This allows the opening transition to be genuinely seamless.

The surrounding scene moves away; the same screen becomes fullscreen.

Do not fake a detailed MiniFugg interface inside generated artwork if the real interface can be composited there instead.

---

## 8. Seamless transition grammar

Default transition:

1. Scene appears.
2. User recognizes the context.
3. Phone is already visible and alive.
4. MiniFugg logo/brand cue is readable.
5. User swipes / enters.
6. Player's hand raises or brings the phone closer while camera subtly meets it.
7. Phone screen scales toward viewport edges.
8. Device frame and external scene pass outside the viewport.
9. Live MiniFugg UI remains in place and becomes fullscreen.
10. Core controls/social/navigation resolve into their normal production positions.

There should be **no cut to a separate interface** at step 9.

The transition is the product signature.

---

## 9. Motion inside the scene

Scenes should feel alive but should not behave like looping animated wallpapers.

Good ambient motion examples:

- train sway;
- sleepy head nod;
- hand micro-movement / breathing;
- passing light through a window;
- fluorescent flicker;
- rain on glass;
- steam from food/drink;
- fan rotation shadow;
- elevator floor light;
- reflection moving across the phone;
- subtle vehicle vibration while stationary;
- pet ear/tail movement.

Usually **one primary + one secondary motion** is enough.

Avoid particles, floating icons and constant decorative motion unless the particular scene genuinely contains them.

---

## 10. Music and sound

Each entry scene can carry a very short musical/ambient identity.

Desired behavior:

- small MiniFugg brand motif remains recognizable;
- scene may alter instrumentation, ambience or rhythm;
- Japanese metro may use carriage ambience + a restrained version of the motif;
- toilet may have a dry fluorescent/vent ambience;
- night/bed scene may use a softer minimal version;
- rare absurd scenes can have more surprising arrangements.

The scene audio should hand off smoothly to the feed/game audio rather than stopping with a hard cut.

Do not build a long unskippable intro song. Entry scenes are short.

Any authored music/SFX must follow `docs/MUSIC_LAB.md`.

---

## 11. Scene library and repetition

Launch with only a small high-quality set.

Recommended initial target:

- 2 or 3 scenes available by default;
- additional scenes unlocked through platform/game achievements;
- random or weighted choice among unlocked scenes;
- avoid immediate repetition of the last shown scene;
- optional rare-scene weighting;
- optional seasonal/event scenes later.

The platform should be designed so new scenes can be added over time without changing the brand system.

A scene is content, not a new UI skin.

---

## 12. Unlocking scenes

Entry scenes are ideal meta rewards because they are visible outside any single game and reward exploration of MiniFugg as a platform.

Examples:

- play 5 different games → unlock a new everyday scene;
- finish 3 different Fugg games → unlock another;
- earn achievements in several genres → unlock a stranger scene;
- reach a platform discovery milestone → unlock a rare scene;
- special/seasonal achievement → temporary or permanent special scene.

The exact achievement system is defined in `docs/META_PROGRESSION.md`.

Avoid making every scene depend on grind. Some should unlock from curiosity, variety or funny one-off goals.

---

## 13. Technical production target

Do not require heavy realtime 3D for every cold-open.

Preferred lightweight approach:

- pre-rendered 3D / 2.5D base scene;
- a few raster depth layers where useful;
- transparent foreground arm/hand/device layers if needed;
- live DOM phone viewport;
- transforms for camera/device approach;
- tiny independent layer motion;
- optional very short lightweight video only when raster layers cannot reproduce the needed ambient motion efficiently.

The same scene should not load multiple megabytes of unnecessary texture just to create a 2-second impression.

Every production image follows `docs/ASSET_PIPELINE.md` and its per-game/platform folder conventions.

---

## 14. Modern, not retro

These entry scenes belong to the **platform**, so they should generally feel contemporary even when an individual Fugg cover is retro.

Do not apply fake VHS, distressed paper, arcade fonts or 1980s color grading as a permanent treatment.

A scene may naturally contain old architecture or an old object, but the camera, materials, lighting, typography and Core UI remain contemporary.

The contrast is valuable:

- modern MiniFugg platform;
- highly varied/possibly retro collectible covers;
- independent in-game art directions.

---

## 15. Visual research requirement

When researching the Device Portal system, do not search only for "game splash screens".

Also study:

- first-person product photography / POV commercials;
- contemporary handheld/device advertising;
- editorial 3D everyday scenes;
- subtle first-person game intros;
- transit photography and observed social scenes;
- film/title-sequence transitions into screens;
- motion-design handoffs from physical object to UI;
- modern brand systems that remain recognizable across changing campaign photography.

Evaluate references by whether they can support **many different scenes with one stable brand**, not whether one frame is beautiful.

---

## 16. First production prototype

For the first real Device Portal test, use a **Japanese metro** scene because it tests nearly everything important:

- immediately recognizable real-world setting;
- people around the user without needing them to be the focus;
- natural ambient motion;
- clear reason to be holding a phone;
- modern lighting/materials;
- room for MiniFugg identity without a fantasy environment;
- strong transition from handheld phone to fullscreen feed.

Prototype it as a **system board**, not as one hero picture:

1. cold-open frame;
2. same scene with live MiniFugg phone screen;
3. mid-transition frame as phone approaches;
4. fullscreen feed after handoff;
5. in-game Core frame;
6. comments/profile sheet using the same brand system.

Only after this works should the scene be turned into final production assets.