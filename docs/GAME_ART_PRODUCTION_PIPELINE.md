# MiniFugg Game Art Production Pipeline

This document is the canonical procedure for turning an approved game-art direction / gameplay mockup into production-ready MiniFugg assets and runtime rendering.

For the complete creation sequence, decision continuity, visual acceptance and progress tracking, start with [GAME_CREATION_PIPELINE.md](GAME_CREATION_PIPELINE.md) and [Zones MiniFugg](MINIFUGG_ZONES.md). Before each gameplay/cover/animation pass, recover the game's approved `ART_DIRECTION.md` references, rejected directions and asset contracts. Generation must carry these decisions forward; the user should not have to repeat them.

Read it together with `docs/ASSET_PIPELINE.md`. That document defines the two entry routes: direct local files/commit for Codex, private Drive sync for ChatGPT without repository access. This document defines what those image files should be and how to decompose an approved visual reference into a real game.

## 1. An approved DA image is a reference, not automatically a runtime asset

A gameplay concept board, mockup or flattened art-direction image establishes:

- composition;
- material language;
- palette;
- shape language;
- hierarchy;
- atmosphere;
- intended motion/feedback.

It must not be placed directly behind live gameplay merely because it looks close to the desired final screen.

Before runtime integration, reconstruct the approved image as a production layer stack. A flattened DA image may be used at runtime only when its entire content is genuinely static decorative background and contains no baked gameplay/UI state.

## 2. Planche de traduction DA → jeu — validation avant production

Avant de générer les assets ou de reconstruire tout l'écran, produire une ou plusieurs **planches visuelles de production** fondées sur la DA approuvée. Elles sont le contrat visible entre la DA et le jeu réel : elles évitent de découvrir une mauvaise lecture après une intégration entière.

La planche contient, à l'échelle du stage et dans le langage visuel de la DA :

- le master annoté : zones jouables, couches, éléments recadrables, profondeur et UI Core exclue ;
- les éléments à produire/rechercher, avec leur rôle et leur séparation ;
- les états et le storyboard des interactions déterminantes ;
- les études FX/mouvement : repos, montée, impact et retour au calme quand ils existent ;
- une légende brève pour chaque proposition : intention, recette Phaser, déclencheur, coût et priorité.

La planche ne redessine pas le jeu dans un médium étranger. Les effets reprennent palette, matières, contours, échelle de détail et rythme de la DA. Toute idée nouvelle est identifiée comme proposition de l'agent. L'utilisateur valide ou corrige cette planche avant la production complète ; elle est archivée comme référence avec son statut dans `ART_DIRECTION.md` et son chemin est cité dans `ASSET_MANIFEST.md`.

## 3. Single-owner rule

Every visible element has exactly one production owner.

It is either:

- authored raster art;
- engine-rendered dynamic content;
- Core/platform UI.

Never draw the same visual/function in both the background asset and Phaser. Never cover a baked fake button/grid/HUD with the live version as a normal production technique.

If an approved master contains a baked element that must be dynamic, recreate/extract the surrounding art cleanly rather than masking the old element at runtime.

## 4. Never bake mutable information

A static asset must not contain information that can change during a run, including:

- score values;
- board numbers/operators;
- line paths;
- selected cells;
- current line count;
- pip count;
- button enabled/disabled state unless the file itself is an explicit isolated state sprite;
- translated gameplay copy;
- timers/progress;
- player-specific information.

Icons that are universal and intentionally part of an isolated control-state sprite are allowed.

## 5. Mandatory decomposition pass

Before producing final assets, classify the approved DA into five families.

### A. Permanent environment

Examples: sky, walls, landscape, paper texture, machine body, non-moving border decoration.

Normally authored raster art.

### B. Animatable decoration

Examples: planets, armillary rings, clouds, fans, dangling objects, gauges, character parts.

Separate an object/layer when independent motion, parallax, tinting, occlusion or lifecycle control adds value. Do not flatten an obviously animatable hero prop into the background merely for convenience.

### C. Structural gameplay surfaces

Examples: board frame, cell face, parchment row, score plate, control dock, bezel.

These should usually be isolated reusable assets. Dynamic content is rendered on top.

### D. Stateful controls/components

Examples: Undo, Validate, line slot, toggle, lever, card.

Define a state matrix before export. Typical states are:

- disabled;
- idle;
- hover/focus when useful;
- pressed;
- ready/enabled;
- success/error when useful.

Do not invent visually unrelated drawings for each state. States should share one silhouette/material family and vary through illumination, depth, tint, pressure or small mechanical movement.

### E. Dynamic gameplay / FX

Examples: numbers, formulas, paths, aim previews, node glows, particles, live result bubble, selection halo.

Use Phaser when these are fundamentally stateful/procedural. Authored textures may support them, but engine state owns the result. Chaque FX notable a une vignette dans la planche et une recette : asset support éventuel, émetteur/tween/filtre/masque/caméra, déclencheur, durée, limites simultanées et version réduite. Ne jamais promettre une flamme, un laser, une lumière ou un impact sans décider comment il vit réellement dans le moteur.

## 6. Asset-manifest requirement

Once a DA is approved, create/update the game's `ASSET_MANIFEST.md` before runtime cutover.

For every production asset record at least:

- canonical filename/path;
- family (environment / decoration / structural / control-state / FX support);
- visual purpose;
- logical destination size or intended bounds in the fixed stage;
- transparency requirement;
- runtime depth/layer;
- whether it moves;
- state variants and shared base geometry;
- what dynamic content Phaser draws above it;
- whether it is required or optional.
- référence de planche, états illustrés et décision utilisateur associée ;
- pour un élément vivant : recette Phaser, déclencheur, durée, budget simultané et priorité visuelle ;
- pour un asset externe : source, licence, preuve de compatibilité et éventuelles limites d'usage.

The manifest must explicitly mark flattened concept/master images as `REFERENCE ONLY` when they contain baked dynamic/UI state.

## 7. Reconstruction rules

When deriving assets from an approved DA:

1. preserve the approved visual language rather than redesigning it;
2. isolate/recreate clean components instead of retaining contaminated crop regions;
3. remove labels, fake values, fake buttons and fake paths from reusable surfaces;
4. preserve alpha around isolated props/controls when useful;
5. use one shared base geometry for families such as three colored indicators;
6. prefer reuse/tint/procedural overlays when it guarantees coherence;
7. keep important authored surfaces as real assets rather than approximating them with generic rectangles;
8. keep genuinely dynamic geometry in Phaser rather than generating dozens of baked combinations.

A crop from a concept sheet is acceptable only if it is cleaned into an independent production asset. The concept sheet itself is never a runtime atlas unless it was intentionally authored as one with known frame coordinates and no labels/mockup contamination.

## 8. Design for states, not for one screenshot

Before calling gameplay art finished, inspect the canonical stage in representative states relevant to that game.

For a three-action puzzle this normally includes:

- fresh run / zero actions;
- active pointer drag;
- one action committed;
- two actions committed;
- all actions committed but not submitted;
- enabled validation control;
- invalid action feedback;
- undo state;
- final submit transition.

The UI must remain coherent in every state. A beautiful screenshot representing only one state is insufficient.

## 9. Design for motion during decomposition

For every notable DA element ask:

- should it move independently?
- should it react to input/audio?
- does something pass in front of or behind it?
- does its state change?
- does it need independent pause/destruction?

If yes, isolate it or deliberately make the dynamic portion engine-owned.

Animation planning happens before flattening/export, not after integration. Les vignettes FX doivent permettre de voir la différence entre le repos, l'action et le moment fort : une liste seule ne suffit pas à valider le rendu.

### Règle de budget FX

Faire vivre le jeu avec de nombreux détails légers : boucles de sprites courtes, oscillations ciblées, variations de teinte/alpha, petites particules bornées et tweens. Réserver les passes plus coûteuses — filtres, blur, glow étendu, éclairage d'image, masques dynamiques, grandes gerbes et secousses — aux événements qui changent réellement la sensation du joueur.

Pour Phaser 4.2.1, préférer les émetteurs avec plafond/réservation de particules et les filtres internes localisés. Les filtres externes de caméra sont des passes écran plus coûteuses ; les tester sur l'appareil cible et ne pas les laisser actifs par habitude. Chaque proposition indique donc `léger`, `ponctuel` ou `coûteux`, ainsi que le gain attendu.

## 10. Fixed-stage composition remains authoritative

All assets are authored for the game's declared logical viewport, normally `390×844` portrait or `844×390` landscape.

Asset decomposition does not create mobile/desktop layout variants. Phaser/Core uniformly scale the 390-wide composition: width first on mobile, height first on PC.

HAUT and BAS are crop-sensitive parts of MASTER. Decorative extension can exist only in EXTRA HAUT/BAS outside MASTER on unusually tall mobile viewports. Lateral sidecars belong to Core, and gameplay-critical geometry never reflows because of device size.

## 11. Localization rule

Avoid baking gameplay copy into image assets.

Prefer:

- universal icons;
- dynamic localized Phaser/Core text;
- symbols already intrinsic to the mechanic.

Decorative fictional markings may be baked only when they are not functional instructions and do not create localization ambiguity.

## 12. Integration order

Use this order for a final DA implementation:

1. freeze `ART_DIRECTION.md` and recover its approved/rejected references;
2. produce the visual production board and obtain its validation/corrections;
3. decompose the reference and update `ASSET_MANIFEST.md` with the board's FX/state decisions;
4. produce or source clean isolated assets;
5. save directly under `public/assets/generated/<game-id>/...` in Codex, or upload through private `Fugg/<game-id>/...` in ChatGPT;
6. verify local generated files or the Actions mirror under `public/assets/imported/...`, according to the entry route;
7. intégrer une mini-tranche représentative — décor, interaction, état et FX compris — et la comparer à la planche à taille de jeu;
8. only then preload the complete pack and rebuild the remaining runtime layer stack without the flattened mockup;
9. wire all state transitions and input feedback;
10. verify all representative game states and the FX budgets;
11. verify normalized geometry across phone/tablet/desktop;
12. build/typecheck;
13. remove superseded runtime art/assets once nothing references them.

Never change code to an `/assets/imported/...` path before the file is verified in the repository.

## 13. Production review checklist

Before declaring the art pass complete, answer yes to all relevant items:

- Does the background still make sense with every UI/gameplay layer hidden?
- Can every interactive control change state without exposing a baked duplicate beneath it?
- Is every mutable value engine-owned?
- Are repeated components visibly from one family?
- Are buttons and indicators isolated from the background?
- Are likely animations supported by separate layers?
- Is there a validated visual production board for composition, states and FX?
- Do the implemented FX visibly match its approved intent while staying inside their declared budget?
- Is there only one owner for each visible function?
- Are all functional texts localizable or avoided?
- Does the screen remain coherent at all gameplay states?
- Does the 390×844 (or declared viewport) composition remain unchanged across device ratios?
- Are runtime assets verified through their documented local/Drive entry route?
- Has the flattened DA/master been kept as reference-only when appropriate?

## 14. Key principle

Think like a game renderer, not like a poster compositor.

The approved DA tells us what the finished game should feel like. Production work turns that single image into a reusable, stateful, animated system without losing the approved visual identity.
