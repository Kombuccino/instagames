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
}

type ProjectionConfig = Required<Pick<
  PerspectiveTextureCanvasProps,
  'slices' | 'speed' | 'nearX' | 'farX' | 'nearTop' | 'nearBottom' | 'farTop' | 'farBottom' | 'xCurve'
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

function projectedX(t: number, curve: number) {
  // Equal-width source strips become progressively narrower toward the far edge.
  // This makes scenery enter small at the vanishing side, then grow as it moves near.
  return 1 - Math.pow(1 - clamp(t, 0, 1), curve)
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
  const sourceStripWidth = sourceWidth / slices

  for (let index = 0; index < slices; index += 1) {
    const u0 = index / slices
    const u1 = (index + 1) / slices
    const p0 = projectedX(u0, config.xCurve)
    const p1 = projectedX(u1, config.xCurve)

    const x0 = lerp(nearX, farX, p0)
    const x1 = lerp(nearX, farX, p1)
    const destinationWidth = Math.max(1.25, x1 - x0 + 1.1)

    const top0 = lerp(nearTop, farTop, p0)
    const top1 = lerp(nearTop, farTop, p1)
    const bottom0 = lerp(nearBottom, farBottom, p0)
    const bottom1 = lerp(nearBottom, farBottom, p1)
    const destinationTop = (top0 + top1) * 0.5
    const destinationHeight = Math.max(1, ((bottom0 - top0) + (bottom1 - top1)) * 0.5)

    const sourceX = wrap(scrollPx + u0 * sourceWidth, sourceWidth)
    const wantedSourceWidth = sourceStripWidth + 1.5

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
    }

    let frame = 0
    let disposed = false
    let startedAt = performance.now()
    let pausedAt = 0
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
        const elapsedSeconds = reduceMotion ? 0 : Math.max(0, now - startedAt - pausedAt) / 1000
        const scrollPx = elapsedSeconds * config.speed
        drawLoopingTextureTrapezoid(context, image, width, height, scrollPx, config)
      }

      if (!paused && !reduceMotion) frame = window.requestAnimationFrame(render)
    }

    const handleLoad = () => {
      startedAt = performance.now()
      pausedAt = 0
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
  }, [src, paused, slices, speed, nearX, farX, nearTop, nearBottom, farTop, farBottom, xCurve])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
