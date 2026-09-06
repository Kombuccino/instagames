import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { GameComponentProps } from '../../core/types'
import { PhaserGameHost } from '../../core/runtime/PhaserGameHost'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'
import { scheduleLineFuggDrum } from '../../core/lineFuggDrumSynth'
import { SymbolicMusicPlayer, type SymbolicComposition } from '../../audio/symbolicMusicPlayer'
import { musicCatalog } from '../../music/catalog'
import { LINEFUGG_SCENE_KEY, LineFuggScene } from './LineFuggScene'

const LINEFUGG_MUSIC_IDS = ['MF-MUS-0008', 'MF-MUS-0009'] as const

const LINEFUGG_MUSIC = LINEFUGG_MUSIC_IDS
  .map((id) => musicCatalog.compositions.find((composition) => composition.id === id))
  .filter(Boolean) as unknown as SymbolicComposition[]

function createLineFuggMusicPlayer(seed: number, restartToken: number) {
  if (LINEFUGG_MUSIC.length === 0) return null
  const index = ((seed >>> 0) + restartToken) % LINEFUGG_MUSIC.length
  const composition = LINEFUGG_MUSIC[index]

  return new SymbolicMusicPlayer({
    composition,
    gain: .9,
    customNoteScheduler: ({ context, output, noise, track, note, start, durationScale, sources }) => (
      scheduleLineFuggDrum({
        context,
        output,
        noise,
        trackId: track.id,
        midi: note[2],
        velocity: note[3],
        trackGain: track.gain,
        start,
        durationScale,
        sources,
      })
    ),
  })
}

export function LineFugg({ active, seed, restartToken, session }: GameComponentProps) {
  const sessionRef = useRef(session)
  sessionRef.current = session

  const music = useMemo(() => createLineFuggMusicPlayer(seed, restartToken), [restartToken, seed])
  const musicRef = useRef(music)
  musicRef.current = music

  useEffect(() => () => music?.destroy(), [music])

  useEffect(() => {
    if (!music) return
    if (active) void music.start()
    else music.pause()
  }, [active, music])

  const createScene = useCallback(() => new LineFuggScene({
    seed,
    session: {
      setScore: (score) => sessionRef.current.setScore(score),
      finish: (payload) => {
        musicRef.current?.stop()
        sessionRef.current.finish(payload)
      },
    },
  }), [seed])

  return (
    <div
      style={{ position: 'absolute', inset: 0 }}
      onPointerDownCapture={() => {
        if (active) void musicRef.current?.start()
      }}
    >
      <PhaserGameHost
        active={active}
        restartToken={restartToken}
        logicalViewport={DEFAULT_LOGICAL_VIEWPORTS.portrait}
        sceneKey={LINEFUGG_SCENE_KEY}
        createScene={createScene}
        ariaLabel="LineFugg. Grille 7 par 7. Trace trois lignes de cinq cases maximum."
      />
    </div>
  )
}
