import { useEffect, useRef, type RefObject } from 'react'
import { playGameSfx, unlockSfxAudio } from '../../audio/sfxEngine'

const GAME_ID = 'tetramindfck'

type Options = {
  rootRef: RefObject<HTMLElement>
  armed: boolean
  playing: boolean
  runFinished: boolean
  restartToken: number
}

function readLevel(root: HTMLElement) {
  const level = Number(root.querySelector('.calc-drop-level strong')?.textContent)
  return Number.isFinite(level) && level > 0 ? Math.floor(level) : 1
}

function settledCount(root: HTMLElement) {
  return root.querySelectorAll('.calc-drop-cell.is-settled').length
}

function addedElements(node: Node) {
  if (!(node instanceof HTMLElement)) return []
  return [node, ...Array.from(node.querySelectorAll<HTMLElement>('*'))]
}

export function useTetraMindFckSfx({ rootRef, armed, playing, runFinished, restartToken }: Options) {
  const settledRef = useRef(0)
  const levelRef = useRef(1)
  const initializedRef = useRef(false)
  const failPlayedRef = useRef(false)
  const armedRef = useRef(armed)
  const playingRef = useRef(playing)

  useEffect(() => { armedRef.current = armed }, [armed])
  useEffect(() => { playingRef.current = playing }, [playing])

  useEffect(() => {
    initializedRef.current = false
    settledRef.current = 0
    levelRef.current = 1
    failPlayedRef.current = false
  }, [restartToken])

  useEffect(() => {
    const unlock = () => {
      if (armedRef.current) void unlockSfxAudio()
    }
    window.addEventListener('pointerdown', unlock, true)
    window.addEventListener('pointerup', unlock, true)
    window.addEventListener('keydown', unlock, true)
    window.addEventListener('wheel', unlock, { capture: true, passive: true })
    return () => {
      window.removeEventListener('pointerdown', unlock, true)
      window.removeEventListener('pointerup', unlock, true)
      window.removeEventListener('keydown', unlock, true)
      window.removeEventListener('wheel', unlock, true)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || !playing) return

    const syncState = () => {
      const nextLevel = readLevel(root)
      const nextSettled = settledCount(root)

      if (!initializedRef.current) {
        initializedRef.current = true
        levelRef.current = nextLevel
        settledRef.current = nextSettled
        return
      }

      if (nextLevel > levelRef.current) {
        const jump = Math.max(1, nextLevel - levelRef.current)
        void playGameSfx(GAME_ID, 'levelUp', { intensity: Math.min(1.25, .9 + jump * .08) })
      }

      if (nextSettled > settledRef.current) {
        const landedCells = nextSettled - settledRef.current
        void playGameSfx(GAME_ID, 'land', { intensity: Math.min(1.2, .8 + landedCells * .05) })
      }

      levelRef.current = nextLevel
      settledRef.current = nextSettled
    }

    syncState()

    const observer = new MutationObserver((mutations) => {
      let newClearRows = 0
      let hasBonusTile = false
      let hasBigImpact = false

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          const elements = addedElements(node)
          elements.forEach((element) => {
            if (element.classList.contains('calc-drop-clear-row')) {
              newClearRows += 1
              if (element.querySelector('.calc-drop-clear-cell.is-bonus')) hasBonusTile = true
            }
            if (element.classList.contains('calc-drop-impact')) hasBigImpact = true
          })
        })
      })

      if (newClearRows > 0) {
        void playGameSfx(GAME_ID, 'calculate', { intensity: Math.min(1.25, .82 + newClearRows * .12) })
        if (newClearRows >= 2 || hasBonusTile) {
          window.setTimeout(() => { if (playingRef.current) void playGameSfx(GAME_ID, 'bonus') }, 135)
        }
      }
      if (hasBigImpact) void playGameSfx(GAME_ID, 'bigImpact', { intensity: 1.05 })

      queueMicrotask(syncState)
    })

    observer.observe(root, { subtree: true, childList: true, characterData: true })
    return () => observer.disconnect()
  }, [playing, restartToken, rootRef])

  useEffect(() => {
    const root = rootRef.current
    if (!root || !playing) return

    const soundForButton = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return
      const button = target.closest('button')
      const label = button?.getAttribute('aria-label') ?? ''
      if (label === 'Déplacer à gauche' || label === 'Déplacer à droite') void playGameSfx(GAME_ID, 'move')
      if (label === 'Descendre plus vite') void playGameSfx(GAME_ID, 'softDrop')
    }

    const onPointerDown = (event: PointerEvent) => soundForButton(event.target)
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const label = event.target.closest('button')?.getAttribute('aria-label') ?? ''
      if (label === 'Tourner à gauche' || label === 'Tourner à droite') void playGameSfx(GAME_ID, 'rotate')
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (!playingRef.current) return
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') void playGameSfx(GAME_ID, 'move')
      if (event.key === 'ArrowDown') void playGameSfx(GAME_ID, 'softDrop')
      if (event.key === 'ArrowUp' || event.key === 'z' || event.key === 'Z' || event.key === 'x' || event.key === 'X') void playGameSfx(GAME_ID, 'rotate')
    }

    root.addEventListener('pointerdown', onPointerDown, true)
    root.addEventListener('click', onClick, true)
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      root.removeEventListener('pointerdown', onPointerDown, true)
      root.removeEventListener('click', onClick, true)
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [playing, rootRef])

  useEffect(() => {
    if (!runFinished || !armed || failPlayedRef.current) return
    failPlayedRef.current = true
    void playGameSfx(GAME_ID, 'fail', { intensity: .95 })
  }, [armed, runFinished])
}
