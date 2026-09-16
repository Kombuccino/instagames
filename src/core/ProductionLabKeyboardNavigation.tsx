import { useEffect } from 'react'

const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'])

function isEditable(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

export function ProductionLabKeyboardNavigation() {
  useEffect(() => {
    let offsetX = 0
    let offsetY = 0

    const applyOffset = () => {
      const world = document.querySelector<HTMLElement>('.mfpl-world')
      if (!world) return
      world.style.left = `${offsetX}px`
      world.style.top = `${offsetY}px`
    }

    const resetOffset = () => {
      offsetX = 0
      offsetY = 0
      applyOffset()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!ARROW_KEYS.has(event.key) || event.metaKey || event.ctrlKey || event.altKey || isEditable(event.target)) return

      const step = event.shiftKey ? 240 : 72
      if (event.key === 'ArrowLeft') offsetX += step
      if (event.key === 'ArrowRight') offsetX -= step
      if (event.key === 'ArrowUp') offsetY += step
      if (event.key === 'ArrowDown') offsetY -= step

      event.preventDefault()
      applyOffset()
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const button = target.closest('button')
      if (button?.getAttribute('title') === 'Vue globale') resetOffset()
    }

    window.addEventListener('keydown', onKeyDown, { passive: false })
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
