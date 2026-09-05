# MiniFugg — Current Platform Visual Validation

Living record of the platform visual decisions already approved by the user. Update this file whenever a visual direction is accepted/rejected so later work does not drift back to older concepts.

## Approved system direction

The converged platform direction is approved **in principle** for the overall product grammar:

- warm, stylized low-poly entry scenes;
- simplified people and environments, not photorealistic lifestyle imagery;
- first-person arm/hand + device belongs to the same low-poly world;
- transition from entry scene into a live MiniFugg cover viewport;
- one full-screen game cover at a time;
- discreet left-side social/action rail;
- vertical cover browsing;
- leftward play/open-box transition;
- game revealed behind/inside the cover;
- active gameplay almost fullscreen with only the compact Core close-box control;
- Bêta and Caca use reusable templates rather than premium authored cover sets.

Do not return to generic app-store feeds, large top/bottom Core bars, photorealistic scenes, or card-grid discovery unless the product contract is explicitly revised.

## Logo / mascot status

The user will reconstruct the MiniFugg logo **manually in vector form** from the previously approved earlier Variation 2 direction.

Do not spend further design time asking image generation to reinterpret or refine the wordmark. Treat the exact logo geometry as **pending user-supplied vector master**.

When the user supplies the vector asset:

- preserve it exactly unless explicitly asked to modify it;
- create required runtime/export variants from that master;
- integrate it into Core identity, favicon/app-icon/lockups as needed;
- use the normal asset pipeline for production files.

Mascot name: **Fuggy**.

Fuggy remains directionally approved as the small low-poly companion/mascot and may appear naturally in MiniFugg entry scenes. Do not force Fuggy to dominate every scene; presence may be obvious, subtle or partly hidden depending on composition.

## MiniFugg branding on live game covers

Do **not** add a large persistent MiniFugg wordmark overlay in a top corner of every cover.

The authored cover artwork may already contain a **small MiniFugg signature/logo integrated into the graphic composition**, typically near a lower corner. That treatment is approved when it behaves like discreet editorial/publisher branding rather than platform chrome.

- **allowed / desirable:** subtle MiniFugg logo baked into the authored cover composition, low visual priority, often bottom-left or bottom-right;
- **avoid:** repeated Core overlay logo sitting prominently over every cover, especially top-left.

For outbound sharing, Core may additionally add MiniFugg branding to the generated share asset/card/video if stronger attribution is useful outside the platform.

## Cover UI v1 — validated

The current full-screen cover UI is now **validated as the reference direction**. The validated visual reference is archived in Google Drive under:

`MiniFugg - Graphic Archive / Platform / Cover UI / Validated / platform-cover-ui-tetramindfck-validated-v1.png`

Locked characteristics:

- the authored game cover continues to fill the **entire screen**; do not add a black/footer band below it;
- the player's coin balance stays visible at the **top-right** during cover browsing, using the small pixel-coin visual language;
- the left action rail remains directly over the artwork with **no permanent background plates, circles, docks or pills behind the icons**;
- target rail actions remain Info, Like, Comments, Bookmark and Share;
- default icons are thin/outline and visually secondary to the cover;
- selected Like may use a restrained red/pink active highlight;
- selected Bookmark may use a restrained filled/highlight state;
- `SWIPE TO PLAY` is removed and must not return;
- play CTA uses the **Insert Coin** metaphor, not a generic mobile-app Play button;
- Fugg CTA copy: `INSERT COIN x2`;
- Bêta CTA copy later adapts to `INSERT COIN x1`;
- inside the light closed cartouche, the two overlapping pixel coins sit **after `x2` and before the rightward `>>` cue**;
- the overlap ordering/orientation of the two coins should match the latest validated reference;
- the CTA stays visually lightweight enough to work over many different cover art styles;
- the `>>` cue reinforces the leftward play/open-box gesture direction without adding a large tutorial;
- `CHANGE GAME` remains a small, separate browsing affordance at the bottom-left and may be tapped as an alternative to the vertical swipe;
- `CHANGE GAME` must remain visually secondary and not be fused into the Insert Coin cartouche;
- no large MiniFugg overlay logo is added over the cover.

The current reference includes both a default state and a Like + Bookmark active-state example. Do not redesign unrelated elements when refining one remaining component.

## Global platform access / Home / account / settings

MiniFugg will eventually need a way to reach platform-level functions that do not belong to the current game, for example account/profile settings, language/accessibility, purchases / Free Play / coin details and platform information.

These functions must **not** be stuffed into the current game's Info/Community panel.

Current direction:

- provide one discreet Core-level **System / Home / Account entry point** from the cover/discovery state;
- keep it visually much quieter than the game artwork and left social rail;
- do not use a large permanent MiniFugg logo as this control;
- icon/name and exact corner/placement remain open for UI study;
- avoid creating a conventional heavy app header merely to expose settings;
- the control may open a compact platform sheet/home surface rather than navigating to a generic dashboard.

## Next design tasks — current priority

The logo and cover UI no longer block progress. Detailed interface work should now proceed in this order:

1. **Info / Comments side panel** — layout, hierarchy, tabs/focus states, relationship to the cover, opening from the rightward gesture, and return behavior.
2. **Gameplay close-box control** — icon, size, placement, safe-zone behavior over wildly different games.
3. **End-of-run Core surface** — Replay / Quit / score / coin cost, without rebuilding a heavy platform shell.
4. **Bêta template refinement** — reusable background + per-game title/logo + live translated text + `INSERT COIN x1`.
5. **Caca template refinement** — reusable playful trash-box treatment + per-game title/logo + live translated text + free-entry treatment.
6. **Platform system/account sheet** — only enough to support global settings/account entry without creating a generic dashboard.
7. **Share behavior and deeper community IA** — defer implementation until the visual/Core shell is stable.

## Current status

**Macro platform direction: validated.**

**Logo: handed off to the user for vector reconstruction; do not regenerate.**

**Full-screen cover UI v1: validated.**

Still open before production lock:

- community Info/Comments side-panel styling;
- exact System/Home/Account control and placement;
- gameplay close-box icon/placement;
- end-of-run surface;
- final Bêta/Caca template styling.
