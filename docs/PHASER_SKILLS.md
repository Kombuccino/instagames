# MiniFugg — Phaser official AI skills

This document defines how MiniFugg uses the free AI-agent skills shipped by Phaser.

## Source and version

MiniFugg currently depends on **Phaser 4.2.1**.

The corresponding official Phaser tag is:

- repository: `phaserjs/phaser`
- tag: `v4.2.1`
- commit: `41be1e462bc600064e498cba370bfa8c5c055a22`
- license: MIT

The upstream `skills/` directory contains 28 skill folders at this version:

- actions-and-utilities
- animations
- audio-and-sound
- cameras
- curves-and-paths
- data-manager
- events-system
- filters-and-postfx
- game-object-components
- game-setup-and-config
- geometry-and-math
- graphics-and-shapes
- groups-and-containers
- input-keyboard-mouse-touch
- loading-assets
- particles
- physics-arcade
- physics-matter
- render-textures
- scale-and-responsive
- scenes
- sprites-and-images
- text-and-bitmaptext
- tilemaps
- time-and-timers
- tweens
- v3-to-v4-migration
- v4-new-features

Phaser explicitly publishes these files for AI coding agents. The Phaser repository is MIT-licensed, so the vendored copy must preserve the upstream license notice.

## Why MiniFugg vendors them

Phaser 4 is the canonical runtime for MiniFugg 2D gameplay. Covers are static Core raster art; the former Phaser cover host is retained only in Git history. The project deliberately avoids relying only on an agent's generic memory of Phaser because:

- Phaser 4 differs materially from Phaser 3;
- the renderer, filters and several APIs changed;
- agents can otherwise suggest old Phaser 3 patterns;
- the official skills contain subsystem-specific gotchas and current idioms.

The goal is to give Codex and other coding agents a local, version-pinned reference that matches the runtime actually installed in `package.json`.

## Vendor location

The official snapshot belongs under:

`vendor/phaser-skills/4.2.1/`

The directory mirrors the upstream Phaser `skills/` hierarchy and also contains:

- `SOURCE.json` — exact upstream version/commit metadata;
- `LICENSE.md` — upstream MIT license.

Do not hand-edit vendored Phaser files. MiniFugg-specific rules belong in our own docs and in `.agents/skills/phaser-minifugg/SKILL.md`.

## Refresh / install command

Run:

```bash
npm run vendor:phaser-skills
```

This executes `scripts/vendor-phaser-skills.mjs`, which:

1. checks that MiniFugg still declares Phaser 4.2.1;
2. downloads the official `skills/` tree from the exact `v4.2.1` tag;
3. preserves nested supporting files such as `references/` when present;
4. writes the full snapshot to `vendor/phaser-skills/4.2.1/`;
5. copies the MIT license;
6. writes provenance metadata.

After running it, review and commit the generated vendor directory. If MiniFugg later upgrades Phaser, update the runtime dependency and vendor snapshot together; do not silently pull `master` skills against an older runtime.

## Instruction priority

The Phaser skills teach **how Phaser works**. They do not define MiniFugg product architecture.

Priority order for project work is:

1. explicit user instruction;
2. `AGENTS.md` and current MiniFugg normative docs;
3. game-specific `ART_DIRECTION.md`, `GAME_STATUS.md`, manifests and accepted references;
4. official Phaser skill relevant to the subsystem;
5. generic framework knowledge.

When a generic Phaser skill conflicts with MiniFugg architecture, MiniFugg wins.

Important examples:

- MiniFugg uses a fixed portrait MASTER `390×844`: width-first uniform scaling on mobile and CENTRE-height scaling (`662` units) on PC. HAUT/BAS may be cropped while CENTRE remains complete. Do not adopt generic `FIT` shrinkage or responsive reflow from a framework example.
- MiniFugg Core owns all realtime audio. The upstream `audio-and-sound` skill may explain Phaser sound APIs, but production MiniFugg games must **not** instantiate or own Phaser audio. Read `docs/AUDIO_SYSTEM.md`; Phaser hosts use `audio: { noAudio: true }`.
- Core UI remains React/HTML/CSS. Do not move account, comments, shop, discovery or platform controls into Phaser because a generic skill demonstrates Phaser UI.
- Production images still follow `docs/ASSET_PIPELINE.md` and `docs/GAME_ART_PRODUCTION_PIPELINE.md`.

## Recommended routing for MiniFugg tasks

For most game work, agents should read only the relevant skill files rather than all 28.

| Task | Read first |
| --- | --- |
| create/configure Phaser host | `game-setup-and-config`, `scale-and-responsive` |
| scene lifecycle / pause / restart | `scenes`, `events-system` |
| touch / mouse / keyboard / gamepad | `input-keyboard-mouse-touch` |
| sprites / atlases / images | `sprites-and-images`, `loading-assets` |
| sprite animation | `animations`, `tweens` |
| camera motion / shake / zoom | `cameras` |
| particles / juice | `particles`, `tweens` |
| glow / blur / v4 rendering FX | `filters-and-postfx`, `v4-new-features` |
| procedural lines / shapes | `graphics-and-shapes`, `geometry-and-math` |
| offscreen drawing / generated textures | `render-textures` |
| tile games / maps | `tilemaps` |
| simple physics | `physics-arcade` |
| rigid-body / constraint physics | `physics-matter` |
| timers / pacing | `time-and-timers` |
| groups / batch layout | `groups-and-containers`, `actions-and-utilities` |
| text / BitmapText | `text-and-bitmaptext` |
| migrating Phaser 3 code | `v3-to-v4-migration`, `v4-new-features` |

For MiniFugg engine migrations, `scenes`, `input-keyboard-mouse-touch`, `scale-and-responsive`, `sprites-and-images`, `tweens` and `v4-new-features` are especially useful.

## Codex integration

MiniFugg includes a repo-level routing skill at:

`.agents/skills/phaser-minifugg/SKILL.md`

That skill tells Codex when to consult the vendored official Phaser reference and reminds it that MiniFugg rules override generic framework advice.

The vendor tree itself is intentionally kept under `vendor/` rather than registering all 28 upstream files as separate always-visible project skills. This avoids flooding Codex with irrelevant skill descriptions on every task while still making every official Phaser subsystem reference available locally.

When asking Codex to work on Phaser, a useful instruction is simply:

> Use the `phaser-minifugg` skill and read the relevant official Phaser 4.2.1 vendor skills before changing Phaser code.

Codex may also select the repo skill automatically when the task clearly concerns Phaser.
