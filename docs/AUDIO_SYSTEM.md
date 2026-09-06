# MiniFugg Core Audio

Canonical runtime contract. Read before creating or migrating a game, cover,
entry scene, synth or audio UI. Authoring/catalog rules remain in `MUSIC_LAB.md`.

## Ownership and routing

`src/audio/coreAudioManager.ts` owns the single realtime `AudioContext` for the
document/application session. `src/main.tsx` installs its listeners once. Context
creation is lazy; an inactive neighboring game does not allocate audio resources.
A session singleton also prevents duplicate managers during module hot reload.
Refresh creates a new document/session; no browser permission is persisted in storage.

Signal flow (all four buses are siblings):

```text
symbolic notes / decoded buffers / UI / local previews
                    ↓
           per-playback envelope
                    ↓
        MUSIC   SFX   UI   AMBIENCE
                    ↓
                  MASTER
                    ↓
           AudioContext.destination
```

Defaults: MASTER 0.8, MUSIC 0.72, SFX 0.58, UI 0.58, AMBIENCE 0.5.
Per-composition trims preserve the quieter Home and Tetra presentation. Timbre
filters remain intentional (including the Home's 58 Hz high-pass).
There are no parallel playback compressors. Fix source levels/arrangements instead
of hiding clipping with additional compressors. Bus and mute changes use ramps.

An `OfflineAudioContext` is allowed for deliberate file export: it does not output
to the device or require unlocking. The Lab's offline mix uses the default Core
music/master trim. Preview tuning and runtime bus settings do not modify catalog data.
Microphone acquisition remains `getUserMedia`/`MediaRecorder`; its analyser uses the
shared context with **no microphone-to-speaker connection**. Recorded-take native
controls route through Core's UI bus. These previews are transient auditions and
pause on background without automatic replay; they are not the background music slot.

## Autoplay and lifecycle

Music requests are synchronous state changes, even if audio is blocked. A pending
browser `resume()` promise never blocks a screen, a game action or another attempt.

- Capture listeners observe trusted `pointerdown`, `pointerup`, `touchend` and
  `keydown` events. `resume()` is invoked directly, before any asynchronous work.
- They do not prevent defaults, stop propagation or consume the player's action.
- There is no separate Enable Audio screen and no silent-sound/autoplay bypass.
- `visibilitychange`, `pagehide`, `pageshow` (including bfcache) and focus handle
  background/foreground. Background releases scheduled music and transient sounds.
- Context `statechange` reconciles running versus suspended/interrupted playback.
  Foreground and subsequent gestures retry `resume()` for any non-running context.
- Fast foreground during a pending `suspend()` is reconciled again on completion.
- A browser/OS may still refuse sound. Do not promise unconditional playback on
  the first tap, after Ctrl+F5, during a phone call or on every Safari version.

State meanings:

| State | Meaning / return behavior |
| --- | --- |
| requested, not playing | Music belongs to the active screen but the browser is blocked/interrupted. Retry later. |
| requested, playing | Core has an active transport on a running context. This is not proof that hardware speakers are audible. |
| requested, paused | Explicit music pause. Gestures/foreground must not undo it. Resume explicitly. |
| stopped | Clear the request and reset musical position. Never restart from a gesture or lifecycle event. |
| destroyed | Release this client permanently; React must create a fresh handle on remount. |

`coreAudio.suspend()` is an explicit application suspension, distinct from browser
backgrounding. Only `resume()` clears it. Pausing one game never suspends the context.
Music position is retained on interruption/pause. Synth voices release; resume
continues the note sequence at that position rather than replaying stale scheduled
notes. Sustained notes already released are not reconstructed halfway through.

## Public API for clients

Import `miniFuggAudio` / `SymbolicMusicPlayer` from `src/audio/index.ts`.

```ts
const music = new SymbolicMusicPlayer({ composition, gain: .9 })
// Enter active screen / begin run:
void miniFuggAudio.setMusic(music.handle)
void miniFuggAudio.playGameSfx('tetramindfck', 'move')
void miniFuggAudio.playUi('success')
miniFuggAudio.setBusVolume('MUSIC', .6)
miniFuggAudio.setMuted(true)

music.pause()          // inactive or explicitly paused
void music.resume()   // resume the retained request
music.stop()           // finished run: clear intent
music.destroy()        // unmount / scene shutdown
miniFuggAudio.stopGameSfx('tetramindfck')
```

The compatible `playMiniFuggSfx`, `playGameSfx`, `previewSfxById` and
`unlockSfxAudio` exports remain available. They all use Core. Blocked SFX are dropped,
not queued for a stale burst at unlock. Cooldowns and a global 24-effect limit apply.
`PlayOptions.bus` can route authored short effects to UI/AMBIENCE. Stop owned effects
and cancel delayed game callbacks when leaving their screen.

Core also offers `stopMusic`, `pauseMusic`, `resumeMusic`, `unlock`, `resume` and
`suspend`. Prefer a client's handle when cleaning up: destroying an old handle
cannot stop a newer owner. One music request wins, with a short crossfade from the
outgoing voice. There is no implicit stack that resurrects old screen music.

Create players in React effects and destroy them in the effect cleanup, not during
render/useMemo. StrictMode's setup-cleanup-setup must create a fresh usable player.
`LineFugg.tsx` and `src/audio/gameMusic.ts` demonstrate the semantic game/Core split.

## Synth and future file adapters

Only Core audio adapters use `getContext()`, `getBus()`, `AudioVoice` or
`createMusic(id, transport, gain)`. A transport implements synchronous `start(voice)`,
`pause()` (cancel scheduling, retain cursor) and `reset()`. This is independent of
symbolic synthesis: a future imported file adapter can decode via Core's context,
create a buffer source into the supplied voice output and retain its playback offset.
Do not introduce a second context, HTML audio music engine or engine-specific player.

`SymbolicMusicPlayer` schedules short windows using Web Audio time (150 ms lookahead,
35 ms poll, quarter-beat chunks). Tetra tempo/layer changes occur at bar boundaries.
The Lab keeps its separate editing transport for seeking, excerpt loops, track mix
and tuning, but receives the same Core voice, context and lifecycle.

Music start ramps are 80 ms; ordinary release is 30–120 ms. The Home entry handoff
requests its longer transition fade. The outgoing scheduler stops immediately;
its sources stop after the envelope. Superseded tails are shortened on rapid changes.
Every synth uses `rememberAudioSource` to disconnect the source and its note graph
on `ended`. Voice-owned filters and Lab track buses are disconnected after release.
App listeners live for the document lifetime; clients add no unlock retry listeners.

## Phaser / Three.js / future agents

- Phaser hosts **must** set `audio: { noAudio: true }`. Do not use `scene.sound`,
  Phaser audio loading or a context per `Phaser.Game`.
- Three.js renders the game; use the same semantic Core audio facade. Do not create
  `THREE.AudioListener` / a Three-managed context. Future spatial audio belongs in
  a Core adapter using this graph.
- No game, cover or React hook creates, closes or suspends an `AudioContext` locally.
- Never persist an `audioUnlocked` flag as proof of permission after refresh.
- Preserve all catalog music/SFX identities and symbolic source data.
- Covers currently have no separate active music client in the current platform
  shell. Future covers opt into this API; do not restore an independent cover player.
- Home visuals are unchanged by this migration. Do not infer approval for their
  Phaser refactor from this document.

## Validation

Run `npm run typecheck`, `npm run build`, `npm run test:audio`.
With Vite running, run `npm run test:audio:browser`. On Windows the browser suite
uses installed Edge; elsewhere install Playwright Chromium (`npx playwright install chromium`).
`PLAYWRIGHT_CHANNEL` and `AUDIO_TEST_URL` override browser channel/server.
Results and screenshots: `dist/audio-tests/` (local generated output, not source).

The unit suite covers blocked/pending resume, retries, idempotency, explicit pause
and stop, interruption, visibility, bfcache events, stale owner cleanup, bus/mute
settings, transient cleanup and fades. Browser checks exercise Home, LineFugg,
Tetra and Audio Lab, count actual contexts/sources, measure real audio signal peaks,
and check pause/navigation/cleanup. Simulated page lifecycle events are **not** a
claim of real iPhone lock-screen validation. See `AUDIO_VALIDATION.md` for results.

### Required manual iPhone/Safari check

1. Open `/` in a fresh Safari tab, then refresh. Silence before activation is OK.
   First normal tap/swipe must still perform navigation; requested audio may start.
2. Play LineFugg and Tetra. Return to cover, change game and reopen several times.
   Listen for duplicate music, delayed SFX, harsh clicks and persistent loops.
3. While music is playing, switch app/tab and return; lock/unlock the phone too.
   Requested music should resume when allowed, or retry on the next normal tap.
4. Pause in Audio Lab, background/return and tap elsewhere: it must remain paused.
   Explicit resume must continue; STOP must remain stopped after any return/tap.
5. Test an interruption (call/audio device change) if practical, then repeat resume.
6. Audition, pause, seek and loop an excerpt in the Lab; record a short microphone
   take with headphones, play it and export it. Confirm master mute affects preview.
   Note iOS version, Safari/PWA, audio route and exact failed sequence if any.
