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
- **a clear human-readable role/name for every track** in addition to its stable technical id;
- exact browser-preview note events;
- intended `.mid` export filename(s);
- status.

Stable track ids are for code and precise feedback. The Audio Lab displays explicit names such as `Basse principale`, `Batterie euclidienne` or `Percussions Fibonacci` so a non-musician can identify what they are hearing.

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

## Score / sequence review workflow

Every music card in the Audio Lab should expose a collapsible **Partition / Séquence** inspector based on the symbolic source, preferably as a piano-roll/timeline rather than classical staff notation when timing/layer feedback is the goal.

The inspector should let the user:

- show/hide the score without making the normal music list excessively tall;
- see one named row per currently active track;
- see a synchronized playhead while listening;
- mute/unmute one or several tracks independently;
- select one or several tracks for feedback independently from mute state;
- select a start/end range at musically useful precision;
- click/tap the timeline to seek the whole composition to that musical position;
- loop the selected start/end range for repeated audition without restarting the whole piece;
- copy a deterministic text block containing music id, stage/BPM, variant, timecodes, beats, selected track ids/names and the note/events crossing that range;
- paste that block directly into a development chat for a precise revision request.

The copied block starts with `MINIFUGG_AUDIO_SELECTION` and ends with a blank `feedback:` field. Treat a pasted block as an exact reference to the canonical symbolic catalog unless the user explicitly says otherwise.

Transport rules:

- `Space` pauses/resumes the current Audio Lab music globally unless the user is typing in an input/textarea/select/contenteditable field;
- pause/resume must preserve musical position rather than restart the loop;
- muting should take effect immediately without rewriting the source;
- timeline seeking acts on the complete mix, never just the row that was clicked;
- changing the intensity manually may restart that audition at the beginning of its loop;
- there is no automatic `1 → MAX` transport button: intensity stages are auditioned explicitly so feedback remains unambiguous.

## Local mix / track-tuning workflow

Like the Parallax Lab, the Audio Lab is a **preview-only workshop**. Track tuning may be saved in browser `localStorage`, but it must never write directly to the repository or silently become production configuration.

Per-track draft controls may include:

- included / removed from the composition;
- volume multiplier;
- pitch transposition in semitones for pitched tracks;
- brightness / low-pass filtering;
- note-length multiplier;
- temporary mute, which is audition-only and is **not** a production edit.

Neutral/default tuning must preserve the repository sound. Volume/filter/removal should update live when practical. Parameters that change already-scheduled note events may restart the current audition when committed.

The Lab must provide:

- `RESET PISTE` — restore one track to repository defaults;
- `RESET MORCEAU` — clear the local draft for that composition;
- a visible count/marker for tracks that differ from the repository;
- `COPIER LA CONFIG` — export only real draft differences, excluding temporary mute/selection state.

Copied mix blocks start with:

`MINIFUGG_AUDIO_CONFIG v1 — music=MF-MUS-####`

followed by formatted JSON containing the stable music id and per-track ids/names plus fields such as `enabled`, `volumePercent`, `transposeSemitones`, `brightness` and `noteLengthPercent`.

Handoff workflow:

1. Tune tracks live in the Audio Lab.
2. Draft values persist locally across refreshes.
3. Press `COPIER LA CONFIG`.
4. Paste the complete `MINIFUGG_AUDIO_CONFIG` block into the MiniFugg development conversation.
5. ChatGPT treats the pasted block as an explicit request to apply those reviewed values to the canonical symbolic composition, unless the user says it is only for discussion.
6. ChatGPT updates the repository through the normal workflow; the repository remains authoritative.

## Vocal idea workflow

The Audio Lab also supports **IDÉE VOCALE** for users who can hear a melody or rhythm but cannot describe or notate it.

Principle:

- the MiniFugg composition continues through headphones;
- `getUserMedia` records the microphone only, never the Audio Lab output mix;
- headphones are strongly recommended so the microphone capture remains isolated from the backing music;
- the Lab starts or resumes the chosen composition automatically when recording begins;
- one bar / four beats of count-in is provided before microphone recording starts;
- the take stores the music id, stage, BPM, variant, start beat/timecode, duration and recording timestamp;
- a live microphone-level waveform helps confirm that the take is being captured;
- the take can be auditioned alone in the browser and exported as its original recorded audio format.

The first implementation keeps a take local to the current browser page until it is exported. Do not treat an unexported browser Blob as durable project storage.

The handoff consists of two parts:

1. Export the microphone file from the Lab and attach that audio file to the development conversation.
2. Press `COPIER LES INFOS` and paste the accompanying block beginning with:

`MINIFUGG_VOCAL_IDEA v1 — music=MF-MUS-####`

The metadata identifies exactly where the user sang/hummed relative to the canonical loop. When the audio file and this block are supplied together, interpret the voice as a musical-direction reference, not as a performance that must be copied mechanically. Extract the useful contour, rhythm, accents or motif and translate it into a clean symbolic MiniFugg track that fits the existing composition and art direction.

A non-musician may use syllables, humming, beatboxing or spoken rhythmic sounds. Precision of singing is less important than preserving the intended contour and timing.

## Reactive game music

Prefer modular music over one flattened loop when gameplay intensity changes.

A reactive composition should expose:

- an initial core that works alone;
- additive **and subtractive** layer changes on musical boundaries;
- a BPM/intensity map tied to real gameplay cadence when the game has one;
- optional compatible high-pressure variations;
- stable bar/loop boundaries so transitions stay musical;
- recognizable motifs at every intensity.

**Escalation should be rhythm-first, not melody-stack-first.** When intensity rises, prefer tempo, carefully chosen subdivisions, percussion density, bass emphasis and rhythmic transformations before adding another pitched voice. New layers must preserve the hierarchy of the existing groove instead of taking over it. As a default, keep at most one clearly foreground melodic voice active at a time.

### Groove is a gameplay contract

For action/puzzle games whose interaction is helped by a beat, the underlying pulse is not decorative music: it is part of the gameplay feel.

- Establish one unmistakable rhythmic spine, normally main drums plus bass.
- Do not remove or obscure that spine merely to create a breakdown, descent or mathematical variation.
- A descent should normally come from subtracting hats, ornaments, fills or melodic density while the foot pulse remains legible.
- Syncopation, Euclidean patterns, prime-number accents, Fibonacci events and fills belong **around** the pulse; they must not make the player unsure where the beat is.
- At every intensity, a listener should be able to tap a foot through the complete section without guessing where beat 1 went.
- Main kick/snare accents must remain materially stronger than decorative percussion.
- If a clever pattern weakens the groove, simplify or remove the clever pattern.

### Tempo-aware orchestration

A higher intensity stage must not simply replay the exact same note density at a higher BPM.

- Treat tempo bands as legitimate arrangement variants of the same composition.
- Preserve approved pitches, motifs and harmony whenever possible; first solve high-speed problems by thinning or removing events rather than recomposing unrelated material.
- As BPM increases, actively reduce melodic attack density: use longer notes, fewer events and clearer phrases.
- If an earlier part becomes muddy, disable it or replace it with another part that preserves its musical role at the new speed.
- High-speed states should often trade fast arpeggios / ornamentation for slower hooks, syncopated bass or clearer rhythmic anchors.
- Bass and main drums may stay physically strong while ornamental percussion becomes sparser.
- A layer transition may remove tracks as well as add them; progression is orchestration, not accumulation.
- Preserve recognizable motifs/harmony across variants so the listener hears one composition evolving rather than unrelated songs.

Longer reactive pieces should also have a musical form rather than one short flat loop. When appropriate, use named sections such as introduction, rise, refrain, descent, rebuild and final refrain. Those sections do **not** justify losing the gameplay pulse. Refrains should preferably be created by recognizable motif emphasis and arrangement, not by introducing unrelated harmony.

If the game's mechanical cadence becomes too fast to map literally to musical BPM, group several game ticks into one beat and increase rhythmic subdivision only where it remains readable instead of driving the whole composition into unusable tempos.

The game engine should own live tempo and layer activation. Do not render the only production source to a fixed WAV when the music is meant to react to gameplay.

For long-form symbolic arrangements, the Audio Lab should schedule playback in short chunks/bars rather than pre-scheduling an entire multi-minute loop at once. This keeps auditioning practical on phones and lets local mix changes affect upcoming material quickly.

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
- an unbroken, foot-tappable rhythmic spine that supports rapid Tetra inputs;
- density growth based on powers of two only where it does not obscure that spine;
- prime-number accents (2/3/5/7 etc.) expressed mainly rhythmically around the core pulse;
- Fibonacci-derived timing or phrases where useful;
- multiply/divide ideas expressed by note duration, interval or subdivision transformations;
- modulo/polyrhythmic accents;
- a final max-speed state that feels computationally overloaded while keeping the original groove readable.

Its first SFX set demonstrates the shared-vocabulary model:

- common move / rotate / soft-drop / land / level-up / fail with a slightly lower, tighter Tetra accent;
- `Arithmetic Scan` for a completed calculation;
- `Times Two` for arithmetic bonus feedback;
- `Big Number Thump` for unusually large results.

The automatic falling tick is intentionally silent. Manual movement and meaningful state changes carry the tactile audio feedback so the soundtrack keeps breathing room.

## Browser playback

`src/core/MusicLab.tsx`, `src/core/MusicScorePanel.tsx`, `src/core/VoiceIdeaRecorder.tsx` and `src/core/SoundDesignLab.tsx` intentionally use native browser audio APIs and symbolic catalogs. Do not add a MIDI, recording or SFX playback dependency merely for the Lab unless the custom playback layer becomes insufficient.

The Lab must remain practical on a phone:

- one tap to listen;
- stage/intensity audition controls for music;
- collapsible timeline/score review;
- click/tap timeline seeking plus selectable excerpt looping;
- pause/resume with Space and an explicit pause button;
- per-track mute;
- per-track local mix/tuning with reset + copy handoff;
- multi-track + time-range copy for chat feedback;
- microphone-only vocal-idea recording with one-bar count-in and exportable metadata;
- direct preview of common and game-accented SFX;
- stop works immediately for music;
- playback cleans up continuous music scheduling when the Lab unmounts;
- the page remains vertically scrollable.
