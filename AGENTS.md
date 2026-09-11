# MiniFugg agent rules

This file is authoritative for any AI or developer modifying `Kombuccino/instagames`.

## Entrée commune et communication

Pour toute nouvelle demande MiniFugg, suivre [docs/ACTIONS.md](docs/ACTIONS.md) : identifier l'intention, récupérer les décisions, choisir procédures et outils, vérifier puis transmettre. Ce point d'entrée s'applique aussi à ChatGPT. Ne pas demander à l'utilisateur de nommer les skills ou de préparer le brief. En cas de doute matériel non résolu par les sources, poser une question courte.

Répondre en français naturel et concis : résultat d'abord, raison utile, pas de répétition. Annoncer brièvement ce qui est fait et pourquoi ; signaler les changements importants et les limites. Les détails restent dans les fichiers, sauf demande contraire. Voir la section Communication d'ACTIONS.md.

Dans ce projet, une demande de **commit** signifie : créer le commit puis le pousser sur GitHub vers la branche distante correspondante, car le parcours de test courant se fait en ligne. Ne conserver le commit uniquement sur la machine que si l'utilisateur demande explicitement un **commit local** ou interdit le push.

For project history, product intent and the current DOM/CSS/Canvas → Phaser transition context, also read root `codex.md`. `codex.md` is an onboarding/handoff document; when it conflicts with a newer normative file, the normative file wins.

## Art-direction brief routing — mandatory

Use `.agents/skills/minifugg-art/SKILL.md` for graphic requests. It routes to the existing DA documents and their single micro-brief template, including the closed list of allowed text. Keep comparison/technical annotations separate from clean originals; measure files without treating a technical pass as artistic approval. ChatGPT may read the skill as a procedure even without native activation. Record each significant pass in the existing surface/game follow-up. No periodic review is activated (user decision, 11 September 2026).

Before any graphic research, image request, visual redesign or art integration, read the latest `main` version of `docs/DA_CORE.md`, then the file for the requested surface:

- `docs/DA_COVER.md` — authored game covers and collectible editions;
- `docs/DA_GAME.md` — gameplay art research, redesign and stateful art production;
- `docs/DA_WELCOME.md` — platform entry scene, held phone and direct handoff to discovery;
- `docs/DA_UI.md` — shared Cover overlay, Info, Comments, Leaderboard, result and future Core panels.

Also read `docs/MINIFUGG_ZONES.md`. Its short zone names and 390-wide Core containment are mandatory in every Home, Cover, gameplay, result and ladder brief or integration.

These are the current operational authorities for creative briefs and reconciled visual decisions. Preserve exact approved references and subsequent explicit user corrections within their scope. Older style catalogs and exploratory platform documents provide supporting detail, not permission to restore obsolete visual directions: no baked SWIPE TO PLAY on covers, no half-sized Info/Comments panels, no duplicate interactive game/feed inside the entry phone. Engine, input, economy, asset-transport and other technical contracts remain authoritative in their respective domains.

Keep agent context separate from generator context. Recover decisions yourself, then send only a targeted micro-brief and the exact reference(s) needed for the requested component. Never send the entire catalog, placeholder set or project history as an image brief. Do not ask the user to repeat settled artistic decisions.

## 1. Read before editing

For any game work, read the latest `main` versions of:

- `AGENTS.md`
- `GAME_DEV_SPEC.md`
- `docs/GAME_CREATION_PIPELINE.md` — unified creation stages, quality gates and handoff/status procedure.
- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/AUDIO_SYSTEM.md`
- `docs/GAME_MIGRATION_PLAN.md`
- `docs/GAME_LAYOUT_SYSTEM.md`
- `docs/MINIFUGG_ZONES.md`
- `docs/INPUT_GESTURES.md`
- `docs/ORIENTATION_LAYOUT.md`
- the game's `ART_DIRECTION.md` when present.

For any Phaser task, also use the repo skill `.agents/skills/phaser-minifugg/SKILL.md` and consult the relevant official Phaser 4.2.1 vendor skill documented in `docs/PHASER_SKILLS.md`. MiniFugg rules override generic Phaser guidance.

For any approved game-DA implementation, asset decomposition or final gameplay-art pass, also read `docs/GAME_ART_PRODUCTION_PIPELINE.md`.

For each substantial game pass, read/update `src/games/<id>/GAME_STATUS.md` (create it if missing). Before art, cover, animation or audio work, recover the approved references, decisions and rejected directions from the game's `ART_DIRECTION.md`, asset manifest and linked discussions. Do not ask the user to repeat settled choices or substitute generic generated art. Follow the continuity and visual acceptance checks in `docs/GAME_CREATION_PIPELINE.md`.

For Core/platform work also read the relevant platform documents, especially `docs/PLATFORM_REDESIGN.md`, `docs/PLATFORM_UI_BASELINE.md`, `docs/PLATFORM_VISUAL_VALIDATION.md`, `docs/DISCOVERY_NAVIGATION.md`, `docs/PLATFORM_ECONOMY.md`, `docs/PLATFORM_EXPORTS.md` and `docs/PLATFORM_ART_DIRECTION.md`.

For any production image creation/import/integration, first read and follow `docs/ASSET_PIPELINE.md`.

## 2. Runtime architecture is fixed

Do not choose a new engine per game.

- Core UI/login/discovery/Info/Comments/shop/leaderboards: **React + TypeScript + HTML/CSS**.
- New and migrated 2D gameplay: **Phaser 4**.
- Covers: **static raster art rendered by Core**. Existing Phaser animated covers are legacy migration sources and must be removed after their static replacements are validated.
- Genuine 3D low-poly/blockout gameplay: **Three.js**.

Do not add PixiJS as a parallel production runtime.

Do not create new bespoke raw Canvas/WebGL/WebGPU gameplay renderers unless the user explicitly reopens the architecture decision. Existing custom Canvas and DOM/CSS renderers are legacy migration sources, not foundations to extend.

## 3. Canonical logical stage — mandatory

Gameplay has a canonical portrait width of `390` logical units. The authored MASTER is `390 × 844`; its always-visible CENTRE is `390 × 662`. HAUT and BAS are crop-sensitive parts of MASTER. EXTRA HAUT/BAS exist only outside MASTER when a mobile viewport is proportionally taller. Exact names, coordinates and per-screen masks are defined in `docs/MINIFUGG_ZONES.md`.

**Current product scope (decision of 8 September 2026):** all new game, gameplay-DA and cover production is portrait-only until the user explicitly reopens landscape. Do not propose, generate or implement a second landscape composition. Existing landscape catalog entries remain supported only for maintenance and migration of their current behavior.

On mobile, scale uniformly from the useful width. On PC or big screen, scale uniformly from the useful height. Do not redesign or reflow critical gameplay geometry for PC vs phone. Do not position important game objects primarily with `vw`/`vh`.

A phone is the complete reference experience. On mobile, width controls scale and HAUT/BAS may be cropped as useful browser/app height changes. On desktop, the height of CENTRE controls scale: CENTRE fills the screen while HAUT/BAS are cropped. Tablet/desktop lateral space belongs to Core; do not author extra left/right game or cover decoration. Core currency and CTA remain inside the 390-wide frame, while the rail stays over CENTRE at the left.

Device pixel ratio may improve render resolution but never changes logical coordinates.

## 4. Existing games are frozen for migration

All current games are explicitly marked in `src/core/gameRegistry.tsx` with `runtime`, `logicalViewport` and `migration` metadata.

When `migration.locked === true`:

- no new gameplay feature;
- no normal polish pass;
- no additional legacy responsive/CSS/Canvas workaround;
- only direct migration work is allowed, except for a minimal urgent security/blocking regression fix.

If the user asks to improve a locked game, migrate it first/as part of the request.

Read `src/games/README.md` and `docs/GAME_MIGRATION_PLAN.md`.

When migration becomes canonical, delete the superseded renderer/code in the same cleanup. Git history is the archive; do not retain V2/V3/OLD production files.

## 5. Current covers are migration-marked

The approved target is static covers rendered by Core. Current Phaser/CSS animated cover implementations are legacy until replaced and removed. A cover remains **A METTRE A JOUR** until its static asset, crop behavior and Core overlays are validated and its registry state is `current`.

Do not expand the legacy CSS parallax/FuggWelcome system. Existing TetraMindFck layered work may be used as visual reference when preparing an approved static replacement rendered by Core; do not migrate to or expand an animated cover runtime.

## 6. New game 10-prompt rule

A real new game's first complete playable version must be created and finished in a maximum of 10 user prompts. Neutral prototype art is acceptable. Later GD refinement and full artistic production on a game the user chooses to pursue follow `docs/GAME_CREATION_PIPELINE.md`; they do not restart the initial counter or automatically confer Fugg quality.

When the user explicitly begins a new game, show in every game-development response:

`🎮 <Game name> — Prompt N/10 — X prompts remaining`

One user message in the active creation sequence = one prompt. Prompt 10 is final. Core/platform/runtime/export/documentation/migration-infrastructure work does not consume a game's 10 prompts.

Use Prompt 1 to produce a playable implementation when repository access is available. Avoid spending prompts on questions that can be inferred safely.

## 7. Input portability

Game logic consumes semantic actions (`left`, `right`, `up`, `down`, `primary`, `secondary`, `pause`) or direct pointer coordinates when the mechanic genuinely requires them.

Map hardware separately:

- touch/pointer on mobile/tablet;
- keyboard/mouse on desktop;
- gamepad on desktop/store builds.

Changing input device must not change gameplay geometry.

During active gameplay, the game owns gameplay gestures. Core keeps its explicit close-box/return control reachable. Cover discovery gestures are suspended while playing.

## 8. Core/game boundary

Games do not implement platform UI or platform economy.

Core owns:

- auth/player identity;
- coins and purchases;
- entitlements;
- official leaderboard submission;
- love/comments/bookmarks/share;
- discovery/navigation;
- store/platform adapters.

Games report through the shared session/lifecycle contract (`active`, `seed`, `restartToken`, `session.setScore`, `session.finish`).

Do not call the database, Steam, Google Play, App Store or platform SDKs directly from a game.

## 9. Online/offline trust boundary

Online coins, purchases, entitlements and official ladders are server-authoritative.

A purchased game may be playable offline. Offline local state is untrusted by design:

- local coins may be tampered with;
- offline score never enters an official ladder;
- offline play grants no official server reward;
- reconnecting never overwrites the server wallet with a client wallet.

Do not build fragile invasive DRM merely to protect local offline values.

## 10. Assets

Production images use the route appropriate to the working tool (see `docs/ASSET_PIPELINE.md`):

Codex with local access: save to `public/assets/generated/<game-id>/...`, verify, then commit assets with code. ChatGPT without local repository access: `private Drive Fugg hierarchy → GitHub Actions sync → public/assets/imported/...`.

Do not require Drive for Codex-local generation. Never use public Drive URLs, FTP or base64 chunking. Preserve originals without resize/recompression unless explicitly requested; keep requested optimized derivatives separate.

New production must not use JPG/JPEG. Preserve approved masters as PNG or another lossless source; use verified WebP lossless as the normal runtime derivative and AVIF for large static artwork only when visual quality, size and target-shell decoding have been checked. Keep a PNG/WebP fallback. Transfer compression does not reduce decoded RGBA memory; measure texture dimensions as well as file size.

Important visual objects promised as authored art must be real imported assets; procedural engine shapes are fine for genuinely procedural effects, prototypes and non-art primitives.

An approved DA/mockup is not automatically a runtime background or atlas. Before final integration, decompose it according to `docs/GAME_ART_PRODUCTION_PIPELINE.md`: permanent environment, animatable decoration, structural surfaces, stateful controls and engine-owned dynamic gameplay. Mutable gameplay/UI state must never remain baked underneath the live Phaser layer.

Before full implementation of an approved gameplay DA, produce and obtain feedback on its visual translation board: annotated composition, assets/layers, state storyboard and visible Phaser FX proposals with cost/priority. Integrate one representative vertical slice before producing the whole pass. FX must keep the DA's visual language; use the board as the production reference.

## 11. Visual quality

MiniFugg gameplay must not settle for a generic “small HTML5 game” presentation.

A Fugg-quality game needs deliberate art direction, authored assets where appropriate, readable silhouettes, motion, sound, feedback and enough visual/emotional character that the cover-to-game transition is not a major quality drop.

Do not confuse engine complexity with polish: simple pixel art, paper art or low-poly/blockout can be excellent if intentionally finished.

## 12. Repository discipline

- Inspect `main` before editing.
- Keep one canonical implementation.
- Do not create avoidable duplicate files (`V2`, `final-final`, backups, etc.).
- Delete obsolete production code/assets once replacement is canonical and safe.
- Keep user-approved visual references unchanged unless explicitly asked.
- Run/build/typecheck where tools permit.
- `main` is the deployable source of truth; do not leave the accepted state only on an abandoned branch.
- On every game delivery to `main`, update the game release metadata, version, Europe/Paris last-update timestamp and per-game changelog in the same commit. Core Information reads that metadata; never leave a generic hardcoded version/date.

## 13. Distribution portability

Games depend on MiniFugg, never on a store/OS.

Target shells:

- browser/PWA: normal web build;
- Android/iOS: Capacitor target;
- desktop/Steam: Electron target.

Platform-specific APIs belong behind Core adapters. Packaging technology may evolve without rewriting games.

## 14. Security

Never put secrets/private keys/store credentials in client code or the repository. Treat the browser/app client as attacker-controlled for shared economy and competition. Validate authoritative actions server-side.

## 15. Core owns all realtime audio

Read `docs/AUDIO_SYSTEM.md` before audio/game/cover/entry work. Use the shared
`src/audio/index.ts` facade and managed music handles. Never create, suspend or
close an `AudioContext` in a game, cover, screen or hook. Phaser hosts must use
`audio: { noAudio: true }`; Three.js must also consume Core audio.

Keep requested playback separate from browser-permitted playback. Normal trusted
gestures unlock Core globally; do not add local retry listeners or an Enable Audio
screen. Explicit pause/stop must survive foreground and subsequent gestures.
Create music handles inside lifecycle setup, destroy them during cleanup, stop
owned SFX and cancel delayed callbacks. Preserve catalog data and use fades.
Only offline file rendering may create an `OfflineAudioContext` outside Core.

## 16. Official Phaser skills are pinned, not floating

MiniFugg uses the free official Phaser AI-agent skills as implementation reference.
They are pinned to the same Phaser runtime version as the app and vendored under
`vendor/phaser-skills/<version>/`; see `docs/PHASER_SKILLS.md`.

Do not pull skills from Phaser `master` while the runtime remains on an older
release. Do not hand-edit the vendor copy. Update the Phaser dependency and the
skill snapshot together. Use `.agents/skills/phaser-minifugg/SKILL.md` as the
project routing layer so Codex reads only the relevant subsystem skills and keeps
MiniFugg architecture authoritative.
