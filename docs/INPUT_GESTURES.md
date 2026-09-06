# MiniFugg — Input and Gesture Contract

MiniFugg separates platform navigation from active gameplay and maps hardware to semantic game actions.

## 1. Cover/discovery mode

When the game is not active, Core owns discovery gestures and controls according to `docs/DISCOVERY_NAVIGATION.md`.

A cover must not implement its own competing page-navigation grammar.

## 2. Active gameplay mode

Once gameplay starts, the game owns interaction inside the canonical game stage.

Core discovery swipes are suspended. Core's explicit close/return control remains reachable outside the game capture layer and returns to the same game's cover.

## 3. Semantic actions

Prefer game logic that consumes stable actions rather than device keys:

- `left`
- `right`
- `up`
- `down`
- `primary`
- `secondary`
- `pause`

The shared runtime action vocabulary is declared in `src/core/runtime/gameRuntimePolicy.ts`.

Use direct pointer positions, dragging or multi-touch only when those gestures are intrinsically part of the mechanic.

## 4. Device mappings

The same semantic action can be triggered by different hardware.

Examples:

- mobile/tablet: on-screen controls, taps, drags, swipes;
- desktop: keyboard and mouse;
- store/desktop builds: gamepad where useful.

Do not hard-code game rules around `Space`, `ArrowLeft`, a specific touch button or Steam input. Those are mappings.

## 5. Geometry does not follow the controls

Control presentation may adapt between devices. Gameplay geometry does not.

Examples:

- a touch D-pad may appear on a phone and disappear on keyboard desktop;
- a pointer hint may become a key hint;
- a gamepad glyph may replace a keyboard glyph.

None of those changes may move the board, character, camera, collision world or other canonical gameplay layers into a different composition.

## 6. Pointer precision

Hit testing must use the runtime's logical coordinate system after mapping the physical pointer into the canonical stage.

Do not compare raw browser pixel coordinates directly with logical game objects without applying the stage transform. This prevents the kind of near-edge misses that can appear when physical CSS geometry and gameplay coordinates drift apart.

## 7. Touch behavior

During gameplay:

- prevent browser scrolling/selection only inside the intended game interaction surface;
- keep Core close/return controls outside the capture region;
- use pointer capture for drags when the interaction must continue after the finger/mouse crosses an object's immediate bounds;
- do not freeze a dragged game object merely because the pointer leaves its allowed movement region — clamp the object while continuing to track the pointer.

## 8. Keyboard and gamepad

Keyboard listeners must be attached/removed with the game lifecycle and ignored when the game is inactive.

Gamepad support belongs to the shared runtime mapping. A game may declare which semantic actions it uses, but must not import a store-specific controller SDK.

## 9. Accessibility and reduced motion

Core HTML controls remain ordinary accessible DOM controls. Game-specific Canvas/WebGL interaction should expose useful accessible labels/instructions in Core where practical.

Honor `prefers-reduced-motion` for non-essential cover/Core motion. Gameplay motion required by the mechanic may remain, but avoid unnecessary camera/FX intensity when a reduced-motion mode is provided.
