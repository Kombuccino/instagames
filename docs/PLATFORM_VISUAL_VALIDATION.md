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

The user will now reconstruct the MiniFugg logo **manually in vector form** from the previously approved earlier Variation 2 direction.

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

The distinction is important:

- **allowed / desirable:** subtle MiniFugg logo baked into the authored cover composition, low visual priority, often bottom-left or bottom-right;
- **avoid:** a repeated Core overlay logo sitting prominently over every cover, especially top-left, obscuring or competing with the artwork.

The cover should belong primarily to the game. MiniFugg remains recognizable through the shared coin balance, action rail, gesture grammar, CTA language and box-opening transition.

For outbound sharing, Core may additionally add MiniFugg branding to the generated share asset/card/video if stronger attribution is useful outside the platform.

## Global platform access / Home / account / settings

MiniFugg will eventually need a way to reach platform-level functions that do not belong to the current game, for example:

- account/profile settings;
- global preferences;
- language/accessibility;
- purchases / Free Play / coin details;
- platform information;
- other future Core settings.

These functions must **not** be stuffed into the current game's Info/Community panel merely because that panel already exists.

Current direction:

- provide one discreet Core-level **System / Home / Account entry point** from the cover/discovery state;
- keep it visually much quieter than the game artwork and left social rail;
- do not use a large permanent MiniFugg logo as this control;
- icon/name and exact corner/placement remain open for UI study;
- avoid creating a conventional heavy app header merely to expose settings;
- the control may open a compact platform sheet/home surface rather than navigating to a generic dashboard.

The purpose is functional escape to platform-wide settings, not branding.

## Play CTA

The latest large red pill/button treatment is **not approved**. The play action itself is approved, but its visual treatment remains open.

Next UI studies should test quieter, more integrated treatments, for example:

- small typographic `PLAY · 2 COINS` treatment;
- coin-slot / insert-coin metaphor;
- thin edge tab;
- understated bottom label;
- another solution that does not look like a generic mobile-app primary button.

The CTA must trigger the same action as the leftward play gesture.

## Left cover action rail

Target actions:

- Info / Community;
- Like;
- Comments;
- Bookmark;
- Share.

Visual treatment:

- thin outline icons;
- hollow/transparent centers where possible;
- no permanent button rectangles;
- no large opaque dock;
- compact vertical rhythm;
- placed on the **left** so the right side remains visually clear for the play/open-box direction.

Share must be visible in visual prototypes even before its platform-specific functionality is implemented.

## Next design tasks — current priority

The logo is no longer blocking progress. Detailed interface work should proceed now in this order:

1. **Cover UI detail study** — real full-screen Fugg cover, coin balance, left action rail, quieter Play CTA, gesture affordances, discreet System/Home/Account entry point. This is the next immediate visual task.
2. **Info / Comments side panel** — layout, hierarchy, tabs/focus states, relationship to the cover, return behavior.
3. **Gameplay close-box control** — icon, size, placement, safe-zone behavior over wildly different games.
4. **End-of-run Core surface** — Replay / Quit / score / coin cost, without rebuilding a heavy platform shell.
5. **Bêta template refinement** — reusable background + per-game title/logo + live translated text + `PLAY · 1 COIN`.
6. **Caca template refinement** — reusable playful trash-box treatment + per-game title/logo + live translated text + `PLAY · FREE`.
7. **Platform system/account sheet** — only enough to support global settings/account entry without creating a generic dashboard.
8. **Share behavior and deeper community IA** — defer implementation until the visual/core shell is stable.

## Current status

**Macro platform direction: validated.**

**Logo: handed off to the user for vector reconstruction; do not regenerate.**

Still open before production lock:

- play CTA styling;
- detailed cover UI spacing/iconography;
- exact System/Home/Account control and placement;
- community side-panel styling;
- close-box icon/placement;
- end-of-run surface;
- final Bêta/Caca template styling.
