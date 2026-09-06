import { useEffect, useRef } from 'react'

type PerspectiveTextureCanvasProps = {
  src: string
  className?: string
  paused?: boolean
  slices?: number
  speed?: number
  nearX?: number
  farX?: number
  nearTop?: number
  nearBottom?: number
  farTop?: number
  farBottom?: number
  xCurve?: number
  depthCurve?: number
}

type ProjectionConfig = Required<Pick<
  PerspectiveTextureCanvasProps,
  'slices' | 'speed' | 'nearX' | 'farX' | 'nearTop' | 'nearBottom' | 'farTop' | 'farBottom' | 'xCurve' | 'depthCurve'
>>

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

function wrap(value: number, size: number) {
  return ((value % size) + size) % size
}

function perspectiveAmount(t: number, curve: number) {
  return Math.pow(clamp(t, 0, 1), curve)
}

export function drawLoopingTextureTrapezoid(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  scrollPx: number,
  config: ProjectionConfig,
) {
  const sourceWidth = image.naturalWidth
  const sourceHeight = image.naturalHeight
  if (!sourceWidth || !sourceHeight || width <= 0 || height <= 0) return

  const slices = Math.max(24, Math.trunc(config.slices))
  const nearX = config.nearX * width
  const farX = config.farX * width
  const nearTop = config.nearTop * height
  const nearBottom = config.nearBottom * height
  const farTop = config.farTop * height
  const farBottom = config.farBottom * height

  /*
   * Screen geometry is explicit: t=0 is always the near/left edge and t=1
   * is always the far/right edge. Equal destination strips make that direction
   * impossible to accidentally invert. Source strips grow towards the far edge,
   * so more panorama pixels are squeezed into the same screen width on the right:
   * scenery is visibly smaller at the vanishing point and grows as it moves left.
   */
  for (let index = 0; index < slices; index += 1) {
    const t0 = index / slices
    const t1 = (index + 1) / slices

    const x0 = lerp(nearX, farX, t0)
    const x1 = lerp(nearX, farX, t1)
    const destinationWidth = Math.max(1.25, x1 - x0 + 1.15)

    const depth0 = perspectiveAmount(t0, config.depthCurve)
    const depth1 = perspectiveAmount(t1, config.depthCurve)
    const top0 = lerp(nearTop, farTop, depth0)
    const top1 = lerp(nearTop, farTop, depth1)
    const bottom0 = lerp(nearBottom, farBottom, depth0)
    const bottom1 = lerp(nearBottom, farBottom, depth1)
    const destinationTop = (top0 + top1) * 0.5
    const destinationHeight = Math.max(1, ((bottom0 - top0) + (bottom1 - top1)) * 0.5)

    const sourceU0 = perspectiveAmount(t0, config.xCurve)
    const sourceU1 = perspectiveAmount(t1, config.xCurve)
    const sourceX = wrap(scrollPx + sourceU0 * sourceWidth, sourceWidth)
    const wantedSourceWidth = Math.max(.75, (sourceU1 - sourceU0) * sourceWidth + 1.5)

    if (sourceX + wantedSourceWidth <= sourceWidth) {
      ctx.drawImage(
        image,
        sourceX,
        0,
        wantedSourceWidth,
        sourceHeight,
        x0,
        destinationTop,
        destinationWidth,
        destinationHeight,
      )
      continue
    }

    const firstSourceWidth = sourceWidth - sourceX
    const secondSourceWidth = wantedSourceWidth - firstSourceWidth
    const firstRatio = firstSourceWidth / wantedSourceWidth
    const firstDestinationWidth = destinationWidth * firstRatio

    if (firstSourceWidth > 0) {
      ctx.drawImage(
        image,
        sourceX,
        0,
        firstSourceWidth,
        sourceHeight,
        x0,
        destinationTop,
        firstDestinationWidth + 1,
        destinationHeight,
      )
    }

    if (secondSourceWidth > 0) {
      ctx.drawImage(
        image,
        0,
        0,
        secondSourceWidth,
        sourceHeight,
        x0 + firstDestinationWidth - 1,
        destinationTop,
        destinationWidth - firstDestinationWidth + 1,
        destinationHeight,
      )
    }
  }
}

export function PerspectiveTextureCanvas({
  src,
  className,
  paused = false,
  slices = 180,
  speed = 78,
  nearX = -0.08,
  farX = 1.04,
  nearTop = -0.2,
  nearBottom = 0.8,
  farTop = 0.35,
  farBottom = 0.55,
  xCurve = 2.4,
  depthCurve = 1.2,
}: PerspectiveTextureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return

    const image = new Image()
    image.decoding = 'async'
    image.src = src

    const config: ProjectionConfig = {
      slices,
      speed,
      nearX,
      farX,
      nearTop,
      nearBottom,
      farTop,
      farBottom,
      xCurve,
      depthCurve,
    }

    let frame = 0
    let disposed = false
    let startedAt = performance.now()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const cssWidth = Math.max(1, Math.round(bounds.width))
      const cssHeight = Math.max(1, Math.round(bounds.height))
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
      const pixelWidth = Math.round(cssWidth * dpr)
      const pixelHeight = Math.round(cssHeight * dpr)

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
    }

    const render = (now: number) => {
      if (disposed) return
      resize()

      const bounds = canvas.getBoundingClientRect()
      const width = Math.max(1, bounds.width)
      const height = Math.max(1, bounds.height)
      context.clearRect(0, 0, width, height)

      if (image.complete && image.naturalWidth > 0) {
        const elapsedSeconds = reduceMotion ? 0 : Math.max(0, now - startedAt) / 1000
        const scrollPx = elapsedSeconds * config.speed
        drawLoopingTextureTrapezoid(context, image, width, height, scrollPx, config)
      }

      if (!paused && !reduceMotion) frame = window.requestAnimationFrame(render)
    }

    const handleLoad = () => {
      startedAt = performance.now()
      cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(render)
    }

    image.addEventListener('load', handleLoad)
    if (image.complete && image.naturalWidth > 0) handleLoad()

    if (paused || reduceMotion) frame = window.requestAnimationFrame(render)

    return () => {
      disposed = true
      image.removeEventListener('load', handleLoad)
      cancelAnimationFrame(frame)
    }
  }, [src, paused, slices, speed, nearX, farX, nearTop, nearBottom, farTop, farBottom, xCurve, depthCurve])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
