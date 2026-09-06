# Core audio migration — validation

Date: 2026-09-06. Baseline inspected on `origin/main` at `fc4665d`.
The concurrent cover migration is a separate change; its Phaser host also declares
`noAudio: true`. This audio task does not change the Home's visual renderer.

## Architectural assessment

The choice discussed in **Réflexion sur le moteur** is appropriate: shared Web Audio
belongs to Core, independently of React/Phaser/Three scene lifetimes. The existing
symbolic composers do not need a new playback library or a conversion to flattened
files. A global manager alone cannot guarantee iOS autoplay or prove the absence
of audible clicks; lifecycle, scheduling and source envelopes must also be correct.

The implementation uses headroom and scoped envelopes instead of preserving the
five unrelated playback compressor chains. Authored timbre filters and compositions
are preserved. Local Lab mix/track controls remain an intentional editor transport,
not another context or global music owner.

## Removed / migrated ownership

| Previous owner | Result |
| --- | --- |
| SFX engine context, local master/compressor | Shared SFX/UI/AMBIENCE routing; compatible semantic APIs, cooldowns, scoped cleanup. |
| Symbolic player context/master/compressor | Core music handle; short scheduling windows, retained cursor and fades. |
| Tetra reactive hook context/compressor/suspend/close/listeners | Shared symbolic transport; original synth profile and bar-boundary intensity changes. |
| Home context/master/compressor and retry listeners | Shared player with scene phase and timbre filters; Core owns blocked intent and unlock. |
| Audio Lab context/master/compressor/suspend/close | Core transport, retaining tuning, seeking, excerpt loops and pause position. |
| Microphone analyser context | Shared context, input-only analyser; native take preview routed to UI bus. |
| Phaser default sound manager | Disabled in game host. No per-game Web Audio context. |

Offline WAV/MP3 export intentionally retains `OfflineAudioContext`, with default
Core music/master trim and without a separate compressor. It is not realtime output.
No existing realtime context remains to migrate. Future imported-file and spatial
audio adapters remain future features; they must consume the supplied Core context
and output. AMBIENCE is ready as a sibling bus; no new ambience composition or
independent continuous ambience transport was invented in this task.

Current covers are silent in the platform shell; this migration does not add music
that was not playing there. They can request a shared managed track in future.

## Automated checks

- `npm run typecheck`: passed.
- `npm run build`: passed. Existing large-bundle warning remains; eager catalog
  loading is a separate platform concern.
- `npm run test:audio`: passed. Includes architectural guard against local context
  construction and Phaser audio reactivation; mock browser tests exercise pending
  resume promises, retries, idempotency, pause, stop, interruption, visibility,
  pageshow, stale ownership, effects, volumes and release cleanup.
- `npm run test:audio:browser`: Edge/Chromium on Windows, headless, 390×844,
  autoplay requiring document activation. Home silent-before-input and keyboard /
  pointer unlock, Home→cover→game→cover, cache-bypass reload, LineFugg/Tetra repeated
  entry/exit, music pause/resume/stop, pagehide/pageshow simulation and Lab transport.
  A fake microphone also verifies recording and native preview through the shared
  UI bus; background pauses that transient preview without replaying it on return.
- Context/source instrumentation: one actual realtime context per loaded document,
  including Phaser instances; zero remaining instrumented sources after closed games.
- Screenshots of Home, LineFugg and Tetra inspected; gameplay remains visible.
- Signal samples at the master output were nonzero and below full scale for Home,
  LineFugg, Tetra and Audio Lab. Short samples measured peaks below 0.1; exact values
  vary with score selection, scene phase and noise. This is not a complete catalog
  mastering pass or a subjective listening certification.

Local browser report and screenshots are regenerated at `dist/audio-tests/`.
Known pre-existing console noise: missing `favicon.ico` and React's `fetchPriority`
prop warning in the Home image. No uncaught JavaScript audio errors in the passing run.

## Explicit validation limits

- `pagehide/pageshow` and unit visibility/interrupted events simulate lifecycle;
  they do not reproduce Safari process suspension, phone calls or device locking.
- Native iOS Safari/PWA, physical speaker/headphone sound, microphone permissions
  and audio-device changes require the real-device checklist in `AUDIO_SYSTEM.md`.
- A refresh often lands directly on a cover because the existing GameFeed writes
  `?game=...` into history. This is existing routing behavior; open `/` to retest Home.
- Offline export is still deliberate and separate. No new file catalog importer,
  3D spatial audio or independent looping ambience scheduler is claimed.

## Technical references

- [Web Audio context states and iOS interruption](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state)
- [AudioContext resume](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume)
- [Phaser audio configuration](https://docs.phaser.io/phaser/concepts/audio)
