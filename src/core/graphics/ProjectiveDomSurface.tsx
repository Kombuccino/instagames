import { useLayoutEffect, useRef, type ReactNode } from 'react'

type Point = readonly [number, number]

type ProjectiveDomSurfaceProps = {
  className?: string
  planeClassName?: string
  quad: readonly [Point, Point, Point, Point]
  children: ReactNode
  logicalSize?: number
  logicalWidth?: number
  logicalHeight?: number
}

function unitRectangleToQuadMatrix(
  width: number,
  height: number,
  quad: readonly [Point, Point, Point, Point],
  logicalWidth: number,
  logicalHeight: number,
) {
  const [[tlx, tly], [trx, try_], [brx, bry], [blx, bly]] = quad.map(([x, y]) => [x * width, y * height]) as unknown as [Point, Point, Point, Point]

  const dx1 = trx - brx
  const dx2 = blx - brx
  const dx3 = tlx - trx + brx - blx
  const dy1 = try_ - bry
  const dy2 = bly - bry
  const dy3 = tly - try_ + bry - bly

  let a: number
  let b: number
  let c = tlx
  let d: number
  let e: number
  let f = tly
  let g: number
  let h: number

  if (Math.abs(dx3) < 1e-8 && Math.abs(dy3) < 1e-8) {
    a = trx - tlx
    b = blx - tlx
    d = try_ - tly
    e = bly - tly
    g = 0
    h = 0
  } else {
    const denominator = dx1 * dy2 - dx2 * dy1
    if (Math.abs(denominator) < 1e-8) return 'none'

    g = (dx3 * dy2 - dx2 * dy3) / denominator
    h = (dx1 * dy3 - dx3 * dy1) / denominator
    a = trx - tlx + g * trx
    b = blx - tlx + h * blx
    d = try_ - tly + g * try_
    e = bly - tly + h * bly
  }

  const invX = 1 / logicalWidth
  const invY = 1 / logicalHeight
  a *= invX
  d *= invX
  g *= invX
  b *= invY
  e *= invY
  h *= invY

  return `matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,1)`
}

export function ProjectiveDomSurface({
  className,
  planeClassName,
  quad,
  children,
  logicalSize = 100,
  logicalWidth,
  logicalHeight,
}: ProjectiveDomSurfaceProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const planeWidth = logicalWidth ?? logicalSize
  const planeHeight = logicalHeight ?? logicalSize

  useLayoutEffect(() => {
    const root = rootRef.current
    const plane = planeRef.current
    if (!root || !plane) return

    const update = () => {
      /*
       * IMPORTANT: use the element's local layout dimensions, not
       * getBoundingClientRect(). The surface commonly lives inside an animated
       * scale/rotate parent (the hand in the metro scene). A transformed
       * bounding box would bake the parent transform into the homography and
       * then CSS would apply the parent transform a second time, shrinking and
       * offsetting the projected content relative to the physical phone.
       */
      const width = root.clientWidth || root.offsetWidth
      const height = root.clientHeight || root.offsetHeight
      if (width <= 0 || height <= 0 || planeWidth <= 0 || planeHeight <= 0) return
      plane.style.transform = unitRectangleToQuadMatrix(width, height, quad, planeWidth, planeHeight)
    }

    const observer = new ResizeObserver(update)
    observer.observe(root)
    update()

    return () => observer.disconnect()
  }, [quad, planeWidth, planeHeight])

  return (
    <div ref={rootRef} className={className} aria-hidden="true">
      <div
        ref={planeRef}
        className={planeClassName}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: planeWidth,
          height: planeHeight,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  )
}
