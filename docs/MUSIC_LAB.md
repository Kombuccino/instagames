# MiniFugg Music Lab

This is the source-of-truth workflow for AI-created MiniFugg music.

## Goal

Music stays symbolic and editable. A MiniFugg composition should be kept as note/event data and as Standard MIDI files; the browser Music Lab synthesizes the same note data with WebAudio so a phone never depends on its native MIDI player.

## God Mode route

Open:

`/?usr=moigod&lab=music`

This is an obscured internal route, **not authentication**. Do not put secrets or privileged server actions behind this query parameter.

## Catalog

Canonical browser catalog:

`src/music/catalog.json`

MIDI masters:

`public/music/<game-id>/`

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
- path(s) to the matching `.mid` file(s);
- status.

## Status lifecycle

Allowed statuses:

- `candidate` — waiting for the user's verdict; shown under **À écouter**;
- `selected` — currently retained/approved;
- `archived` — rejected, superseded or no longer active, but preserved forever.

**Never delete a music proposal or its MIDI files.** When the user makes a choice, update statuses in `src/music/catalog.json`. Old attempts move to `archived`; the retained version becomes `selected`. If the user asks to keep several active choices, preserve that explicitly.

The browser panel itself is intentionally read-only for production status. The user can audition there and give the verdict in the development conversation; repository state remains the source of truth instead of unsynced device-local admin state.

## Reactive game music

Prefer modular music over one flattened loop when gameplay intensity changes.

A reactive composition should expose:

- an initial core that works alone;
- additive layers that can enter on bar boundaries;
- a BPM/intensity map;
- an optional compatible max-pressure variation;
- stable bar/loop boundaries so transitions stay musical;
- recognizable motifs at every intensity.

The game engine should own live tempo and layer activation. Do not render the only production source to a fixed WAV when the music is meant to react to gameplay.

## Tetra MindFuck pilot direction

The Tetra MindFuck music should make mathematics perceptible without becoming a novelty tune:

- handheld 8-bit / early portable-console timbre;
- modern arrangement and escalation;
- density growth based on powers of two;
- prime-number accents (2/3/5/7 etc.);
- Fibonacci-derived phrases where useful;
- multiply/divide ideas expressed through note duration or interval transformations;
- modulo/polyrhythmic accents;
- a final max-speed state that feels computationally overloaded while keeping the original motif recognizable.

## Browser playback

`src/core/MusicLab.tsx` intentionally uses native WebAudio and the catalog note data. Do not add a MIDI playback dependency merely for the Lab unless the custom playback layer becomes insufficient.

The Lab must remain practical on a phone:

- one tap to listen;
- stage/intensity audition controls;
- an automatic `1 → MAX` escalation preview;
- stop works immediately;
- playback cleans up AudioContext scheduling when the Lab unmounts.
