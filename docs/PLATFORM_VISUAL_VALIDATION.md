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

## Cover + Info + Comments UI — validated

The current Cover UI, Info panel and Comments panel are **validated at 100% as the platform reference direction**.

Latest validated PNG reference:

`MiniFugg - Graphic Archive / Platform / Cover UI / Validated / platform-cover-info-comments-ui-validated-v2.png`

### Cover UI

Locked characteristics:

- the authored game cover fills the **entire screen**;
- the player's coin balance stays visible at the **top-right**, using the small pixel-coin language;
- left rail actions are Info, Like, Comments, Bookmark and Share;
- left rail icons sit directly over the art with **no dark/black background plates, circles, docks or pills**;
- Like, Comments and Bookmark have a small count below them;
- counts remain numeric through 9,999 then abbreviate, e.g. `10k`;
- active Like must render as one clean active heart, never a white heart doubled over a red heart;
- active Bookmark uses a restrained filled/highlight state;
- no system/logo/profile button at bottom-right of the cover;
- `SWIPE TO PLAY` is absent;
- play CTA uses the Insert Coin metaphor;
- Fugg CTA: `INSERT COIN x2`;
- two overlapping pixel coins sit after `x2` and before `>>`;
- `CHANGE GAME` remains small and separate at bottom-left;
- no large MiniFugg overlay wordmark over the cover.

### Info panel

Info is a **full panel**, not a half-panel or floating card. It belongs to the same panel family as Comments and can switch directly between `INFO` and `COMMENTS`.

The panel is scrollable and deliberately compact. Do not add storefront metadata, genre filters or analytics that were never requested.

Order / content:

1. **Cover selection at the very top**.
   - current cover must be unmistakably active;
   - unlocked covers are selectable;
   - locked covers stay mysterious using grayscale, pixelation, or both, rather than revealing clean final art;
2. game title, creator name and optional creation date — **no logo/icon thumbnail in front of these game details**;
3. short game description;
4. version + last-update date;
5. **personal high score**, with a clear action to open the separate leaderboard panel;
6. `HOW TO PLAY` / rules in a few concise lines;
7. creator section:
   - name;
   - short description;
   - optional external link;
   - number of games made;
   - creator's games displayed as a **grid**, not a single horizontal row;
   - show the first 20, then expose the next 20 when requested.

No Difficulty, Tags, Avg. Session, Platforms or similar catalog/filter metadata.

### Comments panel

Comments is the second full panel and shares the same `INFO / COMMENTS` switching model.

Locked direction:

- no heavy horizontal separator bars between every comment;
- reply threads are visible/nested in the mockup and final UI;
- small monochrome comment-heart/reaction only; reactions are visually secondary;
- each comment exposes report/more through `...`;
- creator replies must be visibly special with a clear **Creator** badge and higher-quality creator avatar treatment;
- users on the paid/Lifetime tier use the short **`999`** badge, referencing their 999 renewable daily coins; do not use `Paid` or `Fugg+`;
- free-user avatars are deliberately simple/basic;
- creator and `999` avatars may be more authored/polished;
- comment composer stays compact at the bottom.

## Canonical platform UI language

The canonical overall UI language is the user-supplied board archived as:

`MiniFugg - Graphic Archive / Platform / Reference Boards / platform-ui-canonical-reference-user-supplied-2026-09-05.png`

Use its graphite background, restrained white typography, thin dividers, tiny red accents, compact editorial panels and near-chromeless gameplay shell. Do not drift into neon gaming dashboards, glassmorphism, oversized cards or generic App Store styling.

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

1. **Leaderboard panel** — opened from personal high score; keep the same full-panel family and avoid unnecessary filters.
2. **Gameplay shell / close-box control** — active gameplay almost fullscreen, with only the minimal Core exit affordance.
3. **End-of-run Core surface** — Replay / Quit / score / coin cost.
4. **Bêta template refinement** — reusable visual + live translated copy + `INSERT COIN x1`.
5. **Caca template refinement** — playful reusable trash-box treatment + free entry.
6. **Platform system/account sheet**.
7. **Entry-scene production prototype and seamless scene → live cover transition**.
8. **Share behavior and deeper community implementation** after shell stability.

## Current status

**Macro platform direction: validated.**

**Logo: handed off to the user for vector reconstruction; do not regenerate.**

**Cover UI: validated.**

**Info panel: validated.**

**Comments panel: validated.**

Still open before production lock:

- leaderboard panel;
- gameplay close-box icon/placement;
- end-of-run surface;
- final Bêta/Caca templates;
- exact System/Home/Account control and placement;
- entry-scene production prototype.
