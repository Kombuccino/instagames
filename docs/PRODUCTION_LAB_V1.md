# MiniFugg Production Lab — V1 plan

Pilot: **LineFugg — Rebirth**. The Lab is a human cockpit over repository-owned production data, not a second source of truth and not a chat replacement.

## Goal
Reduce expensive late rework by exposing production dependencies and validating visual components before full integration. Human review is reserved for judgement; deterministic checks belong to tooling/agents.

## Production graph
`PROTO → REQUIREMENTS → DA ↔ STATES/BEHAVIORS → ASSEMBLY → VERTICAL SLICE → PRODUCTION → INTEGRATION → HUMAN REVIEW → RELEASE`

Cover can start in parallel from PROTO. Nodes are baselines, not irreversible locks: an upstream GD/DA change marks dependent downstream items stale/review-required rather than hiding the dependency.

## V1 cockpit
- Graph view with node status, deliverables and dependencies.
- Per-stage **Sources / recipe**: procedures, skills, game files, references and generated brief used by that stage.
- Stable IDs for requirements, components, states, annotations and review decisions.
- Visual requirements derived from the playable proto: entities, states, transitions, exceptional moments, feedback and expected visual deliverables.
- DA/state review against those requirements; DA is a system of screens/components/states, not one hero screenshot.
- Assembly Blueprint: owner (`raster | Phaser | Core`), layer/z-order, logical bounds, pivot/origin, masks/alpha, states, animation/FX recipe.
- Component Workbench with `Solo`, `Exploded`, `In Context`; same runtime assets/recipes as the game, never a duplicate Lab-only implementation.
- Workbench diagnostics: transparent canvas, bounds, pivot, hitbox, playback/pause, speed and frame stepping where applicable.
- DA ↔ runtime comparison and image annotations attached to stable component IDs.
- Review statuses: `todo | produced | rework | validated | integrated | verified` plus stale dependency state.
- `Copy for ChatGPT` handoff containing only changed decisions since previous export, stable IDs, tested state/version and next action; annotated PNG and full JSON are companion exports.

## Deterministic asset gates
- Interchangeable visual states share one canonical canvas, pivot/origin and destination bounds. A glow/pressed state may occupy more visible pixels but does not change the state canvas or runtime placement.
- Alpha crop optimization applies to the state family envelope, never independently to interchangeable frames.
- Missing required states/assets, mismatched family dimensions, unowned layers, missing bounds/pivots and proto requirements not covered by DA are surfaced before integration.
- A green item means its declared gate is satisfied, not merely that a file exists.

## LineFugg experiment
1. Preserve current Solar Origami as a failure/reference snapshot.
2. Restore classic LineFugg separately from the last suitable pre-redesign functional state; never rewind unrelated Core/main history.
3. Create `LineFugg — Rebirth` as a separate game/product based on classic LineFugg as an evolved prototype. Solar Origami is not inherited as its DA.
4. Populate REQUIREMENTS from classic gameplay before new art exploration.
5. Allow GD to evolve during early DA exploration; record resulting requirement changes.
6. Produce enough DA/state material to create an Assembly Blueprint.
7. Implement and validate a representative vertical slice in the Workbench before full asset production.
8. Measure success by late rework and human-review cost, not document count.

## Later validation cases
- TetraMindFck: deterministic layered assembly and same-canvas control states.
- Vlad: character animation, layered environment, FX and post-integration GD/DA revision.
- Crazy Papers: systemic state progression and exceptional game-over/paper-pile sequence.

## Explicit non-goals for V1
No embedded chat, no independent production database, no mandatory PR workflow, no giant generic asset editor, no full rebuild of every game, no requirement that the user reads internal MD files.
