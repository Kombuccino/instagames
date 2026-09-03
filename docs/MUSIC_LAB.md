# MiniFugg Audio Lab

This is the source-of-truth workflow for AI-created MiniFugg music **and procedural sound design**.

## Goal

Audio stays symbolic, editable and lightweight whenever possible.

Music is canonical note/event data: pitches, durations, velocity, tempo stages, layers and loop structure. Standard MIDI is a deterministic export of that source, not the only master. The browser Audio Lab synthesizes the same source with WebAudio so a phone never depends on its native MIDI player.

Short sound effects use procedural WebAudio recipes when that is sufficient. A sound can later be replaced or augmented by a real sample if the art direction needs material that synthesis cannot represent, but common interaction language should stay identifiable.

## God Mode route

Open:

`/?usr=moigod&lab=music`

The historical route name stays `music`, but the page is now the **Audio Lab** and contains both music and SFX.

This is an obscured internal route, **not authentication**. Do not put secrets or privileged server actions behind this query parameter.

## Music catalog

Canonical browser/source catalog:

`src/music/catalog.ts`

The catalog contains or deterministically builds the exact note events used by the browser player. It also declares stable `.mid` export filenames for each proposal.

Every new proposal gets a permanent sequential id:

`MF-MUS-0001`, `MF-MUS-0002`, ...

Every entry must include:

- game id + game title;
- permanent music id;
- human-readable name;
- date;
- summary / musical idea;
- key, meter and loop length;
- intensity stages / BPM map;
- separate layers/tracks;
- exact browser-preview note events;
- intended `.mid` export filename(s);
- status.

## Music status lifecycle

Allowed statuses:

- `candidate` — waiting for the user's verdict; shown under **À écouter**;
- `selected` — currently retained/approved;
- `archived` — rejected, superseded or no longer active, but preserved forever.

**Never delete a music proposal or its symbolic MIDI source.** When the user makes a choice, update statuses in `src/music/catalog.ts`. Old attempts move to `archived`; the retained version becomes `selected`. If the user asks to keep several active choices, preserve that explicitly.

The browser panel itself is intentionally read-only for production status. The user auditions there and gives the verdict in the development conversation; repository state remains the source of truth instead of unsynced device-local admin state.

## MIDI export rule

The catalog note/event data is the master partition. It must remain deterministic and losslessly exportable to Standard MIDI. Do not require a binary `.mid` blob in Git merely to audition music in the Lab.

When a standalone MIDI file is needed, generate it from the catalog source and keep the declared `midiExports` filename stable. A later build/export utility may automate those derivatives without changing the composition identity.

## Reactive game music

Prefer modular music over one flattened loop when gameplay intensity changes.

A reactive composition should expose:

- an initial core that works alone;
- additive layers that can enter on bar boundaries;
- a BPM/intensity map tied to real gameplay cadence when the game has one;
- an optional compatible max-pressure variation;
- stable bar/loop boundaries so transitions stay musical;
- recognizable motifs at every intensity.

**Escalation should be rhythm-first, not melody-stack-first.** When intensity rises, prefer tempo, subdivisions, ghost notes, percussion density, syncopated bass, accents and rhythmic transformations before adding another pitched voice. New layers must preserve the hierarchy of the existing groove instead of taking over it. As a default, keep at most one clearly foreground melodic voice active at a time.

If the game's mechanical cadence becomes too fast to map literally to musical BPM, group several game ticks into one beat and increase rhythmic subdivision instead of driving the whole composition into unusable tempos.

The game engine should own live tempo and layer activation. Do not render the only production source to a fixed WAV when the music is meant to react to gameplay.

## Sound-design catalog

Canonical procedural SFX catalog:

`src/audio/sfxCatalog.ts`

Playback engine:

`src/audio/sfxEngine.ts`

Every authored MiniFugg sound identity gets a permanent sequential id:

`MF-SFX-0001`, `MF-SFX-0002`, ...

Do not delete an SFX identity merely because it is replaced. Keep the id and mark/supersede/archive it so old games and decisions remain understandable.

The first shared vocabulary is intentionally small:

- `move` — tiny positional feedback;
- `rotate` — orientation/change feedback;
- `softDrop` — deliberate downward acceleration;
- `land` — an object taking its final place;
- `levelUp` — common MiniFugg progression signature;
- `success` — compact positive confirmation;
- `fail` — compact negative/end confirmation.

Games should **reuse the semantic event first**, then apply a game accent instead of inventing an unrelated sound. A palette may transpose, darken, shorten or soften the common sound. Add a fully game-specific SFX only when the mechanic has a genuinely specific event such as TetraMindFck's arithmetic scan.

Game palettes live beside the catalog in `src/audio/sfxCatalog.ts` and map semantic events to sound identities.

### Mixing rule

SFX support the music; they do not compete with it.

For repeatable controls:

- use very short sounds;
- enforce cooldowns/throttling;
- do not sonify every automatic simulation tick;
- prefer low/mid-register feedback over piercing high beeps;
- reserve longer/stronger signatures for rare events such as level-up, major success or failure.

When music is active, common SFX should normally be perceived as tactile feedback rather than a second composition.

## Tetra MindFuck pilot direction

The Tetra MindFuck music should make mathematics perceptible without becoming a novelty tune:

- handheld 8-bit / early portable-console timbre;
- modern arrangement and escalation;
- tempo derived from the falling-block cadence;
- density growth based on powers of two;
- prime-number accents (2/3/5/7 etc.) expressed mainly rhythmically;
- Fibonacci-derived timing or phrases where useful;
- multiply/divide ideas expressed through note duration, interval or subdivision transformations;
- modulo/polyrhythmic accents;
- a final max-speed state that feels computationally overloaded while keeping the original groove readable.

Its first SFX set demonstrates the shared-vocabulary model:

- common move / rotate / soft-drop / land / level-up / fail with a slightly lower, tighter Tetra accent;
- `Arithmetic Scan` for a completed calculation;
- `Times Two` for arithmetic bonus feedback;
- `Big Number Thump` for unusually large results.

The automatic falling tick is intentionally silent. Manual movement and meaningful state changes carry the tactile audio feedback so the soundtrack keeps breathing room.

## Browser playback

`src/core/MusicLab.tsx` and `src/core/SoundDesignLab.tsx` intentionally use native WebAudio and symbolic catalogs. Do not add a MIDI or SFX playback dependency merely for the Lab unless the custom playback layer becomes insufficient.

The Lab must remain practical on a phone:

- one tap to listen;
- stage/intensity audition controls for music;
- an automatic `1 → MAX` escalation preview;
- direct preview of common and game-accented SFX;
- stop works immediately for music;
- playback cleans up continuous music scheduling when the Lab unmounts;
- the page remains vertically scrollable.
