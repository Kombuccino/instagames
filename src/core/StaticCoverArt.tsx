import { MINIFUGG_MASTER_VIEWPORT } from './runtime/gameRuntimePolicy'
import type { GameWelcomeVariant } from './types'

/** Static Core art only: no engine, animation, edited master or gameplay layout. */
export function StaticCoverArt({ variant }: { variant: GameWelcomeVariant }) {
  const preserveFrame = variant.fit === 'contain'
  const preservedTitleHeight = Math.max(0, Math.min(MINIFUGG_MASTER_VIEWPORT.height, variant.preserveTitleHeight ?? 0))
  const titleFadeHeight = Math.min(30, preservedTitleHeight * .2)
  return (
    <>
      {preserveFrame && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: -64,
            backgroundImage: `url("${variant.image}")`,
            backgroundSize: 'cover',
            backgroundPosition: variant.objectPosition ?? 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(40px) brightness(.42) saturate(.8)',
            pointerEvents: 'none',
          }}
        />
      )}
      <img
        className="mf-static-cover-base"
        src={variant.image}
        alt=""
        draggable={false}
        aria-hidden="true"
        style={{
          // The intact opaque master owns the foreground. Only its exterior
          // receives the heavily diffused crop, clipped by the Core cover slot.
          position: preserveFrame ? 'relative' : undefined,
          objectFit: variant.fit,
          objectPosition: variant.objectPosition,
        }}
      />
      {preservedTitleHeight > 0 && (
        <div
          className="mf-static-cover-title-preserver"
          aria-hidden="true"
          data-preserved-title-height={preservedTitleHeight}
          style={{
            height: `${preservedTitleHeight / 3.9}cqw`,
            maskImage: `linear-gradient(to bottom, #000 0, #000 calc(100% - ${titleFadeHeight / 3.9}cqw), transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to bottom, #000 0, #000 calc(100% - ${titleFadeHeight / 3.9}cqw), transparent 100%)`,
          }}
        >
          <img src={variant.image} alt="" draggable={false} aria-hidden="true" />
        </div>
      )}
    </>
  )
}
