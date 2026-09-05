# MiniFugg — Platform Entry Scenes

Living specification for MiniFugg cold-open scenes and the seamless transition from the outside-world scene into live MiniFugg cover discovery.

Read together with:

- `docs/PLATFORM_ART_DIRECTION.md` for brand/Core visual language;
- `docs/DISCOVERY_NAVIGATION.md` for the full-screen cover flow after entry;
- `docs/META_PROGRESSION.md` for scene unlocks;
- `docs/ASSET_PIPELINE.md` for every production visual asset.

This system belongs to **MiniFugg Core**, not to any individual game.

---

## 1. Core idea

MiniFugg should not have one permanent decorative splash image.

The preferred entry family is a library of short everyday or absurd scenes. On return, the player may enter through a different scene.

Invariant:

> **The player is somewhere, their own arm/hand is visible, they hold a phone, MiniFugg is already alive on that phone, and entering the platform means moving into that screen.**

The phone is not a floating magical object. It is naturally held by the player or placed in their immediate context.

---

## 2. Visual style is stylized low-poly, not realism

This is now a locked direction for the main scene family.

Do **not** render these scenes as photorealistic lifestyle advertising, pseudo-cinematic photography or literal reality captured inside the app.

Preferred visual language:

- clear low-poly geometry;
- visible simplification/faceting where useful;
- warm, authored lighting;
- matte/simple materials;
- recognizable silhouettes;
- people represented with low detail rather than portrait realism;
- hands/arms simplified in the same visual language;
- environments recognizable in roughly one second;
- 2–5 major background elements rather than dense realism;
- a small amount of atmospheric motion.

The goal is **a stylized little 3D diorama of real life**, not a realistic photograph of real life.

The current strongest reference direction is the warmer low-poly scene exploration: contemporary transport/interior, simplified people, readable hand/phone, soft light, restrained detail.

Avoid:

- realistic skin/hair/face rendering;
- cinematic bokeh as a substitute for design;
- generic game-ad photorealism;
- cyberpunk Tokyo clichés;
- glossy AAA sci-fi materials;
- a Pixar-like mascot treatment;
- excessive props/details merely to prove the scene is 3D.

---

## 3. Why rotating scenes matter

Rotating scenes can become a recognizable MiniFugg signature and a small reason to enjoy returning.

They express tiny stolen moments where someone opens MiniFugg:

- commuting;
- toilets;
- waiting rooms;
- date/restaurant;
- bed at night;
- office/meeting;
- airport/station;
- café;
- more absurd rare contexts later.

The scenes should not explain the game catalog. They express **the habit and pleasure of opening MiniFugg**.

---

## 4. First-person point of view

For the main scene family, camera is normally the player's point of view.

Useful cues:

- forearm/hand holding phone;
- knees/shoes/table/seat edge;
- small amount of environment;
- simplified people/objects around player;
- live phone screen as focal point.

Avoid third-person shots of a generic protagonist using MiniFugg.

The scene should read as **I am here** rather than **I am watching someone use an app**.

---

## 5. Initial prototype scene

### Contemporary Japanese metro/train

Use a stylized low-poly contemporary train scene, not a photorealistic Tokyo commercial.

Recognizable cues may include:

- simple carriage interior;
- handles/doors/signage as graphic geometry;
- passengers simplified into low-detail forms;
- one sleepy head nod;
- subtle carriage sway;
- player's low-poly hand/arm holding the phone;
- restrained modern lighting.

It should feel specific and observed, not tourist/cyberpunk caricature.

Other initial scene families can include toilet, date, waiting room, bed/night, office, café and airport.

---

## 6. The logo does not rotate

Scenes change. MiniFugg identity does not.

Stable elements:

- MiniFugg wordmark;
- symbol/mascot;
- platform typography;
- icon language;
- primary accent logic;
- entry motion signature.

Current logo exploration to continue:

- strong compact geometric wordmark;
- small authored red accent/ear-like triangular detail;
- test both **single-line** and **two-line** lockups while preserving the same visual DNA;
- logo must remain legible in monochrome and at favicon size.

Do not redesign the logo to match each scene.

---

## 7. Phone screen = live product

The important screen/UI inside the low-poly phone should preferably be live DOM/UI rather than painted into the scene raster.

The phone can show:

- MiniFugg boot/logo state;
- the first full-screen game cover;
- a currently selected/unlocked cover.

Do **not** show a generic card/store grid merely because it looks familiar.

After the scene handoff, the product lands on the **full-screen cover discovery model** defined in `docs/DISCOVERY_NAVIGATION.md`.

---

## 8. Seamless transition grammar

Default transition:

1. scene appears;
2. context is understood quickly;
3. phone is already visible/alive;
4. MiniFugg logo/brand cue is readable;
5. user enters;
6. hand raises/brings phone closer while camera subtly meets it;
7. phone screen scales toward viewport edges;
8. device frame + outside scene pass beyond viewport;
9. the same live MiniFugg screen becomes fullscreen;
10. player lands on one full-screen game cover.

There should be no cut to a generic storefront page at step 9.

---

## 9. Motion inside scenes

Scenes should feel alive but not like looping animated wallpapers.

Good motion examples:

- carriage sway;
- sleepy head nod;
- hand micro-movement;
- passing light;
- fluorescent flicker;
- fan shadow;
- steam;
- rain/reflection;
- pet ear/tail;
- subtle camera/body movement.

Usually one primary + one secondary ambient motion is enough.

---

## 10. Music and sound

Each scene may carry a short ambient identity around a recognizable MiniFugg brand motif.

Examples:

- train ambience + restrained motif;
- dry fluorescent/vent ambience in toilets;
- soft minimal night version in bed;
- more surprising arrangements for rare scenes.

Audio should hand off smoothly to cover/game audio.

Do not make entry scenes long or unskippable.

Any authored music/SFX follows `docs/MUSIC_LAB.md`.

---

## 11. Scene library / achievements

Launch with a small high-quality set:

- 2–3 default scenes;
- additional scenes unlocked through achievements;
- weighted/random choice among unlocked scenes;
- avoid immediate repetition;
- rare/seasonal scenes later.

A newly unlocked scene may be forced once on the next launch so the player sees the reward, then joins normal rotation.

Exact meta rules live in `docs/META_PROGRESSION.md`.

---

## 12. Technical production target

Do not require heavy realtime 3D.

Preferred lightweight implementation:

- pre-rendered low-poly / 2.5D scene;
- a few depth layers where useful;
- transparent foreground arm/phone layers if needed;
- live DOM phone viewport;
- transforms for device/camera approach;
- tiny independent layer motion;
- optional short lightweight video only when raster layers cannot reproduce a needed ambient motion efficiently.

Every production image follows `docs/ASSET_PIPELINE.md` and the platform folder hierarchy.

---

## 13. Concept-board requirement

Do not validate the cold-open as an isolated pretty picture.

A useful board should show:

1. logo/mascot, including single-line and two-line tests;
2. low-poly cold-open scene;
3. phone approach/handoff;
4. full-screen Fugg cover with visible coin balance;
5. vertical cover navigation;
6. leftward play/open-box transition;
7. rightward details/community state.

The product interaction model must remain correct even while the visual direction is still exploratory.
