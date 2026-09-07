import type { GameWelcomeVariant } from './types'

/** Static Core art only: no engine, animation, edited master or gameplay layout. */
export function StaticCoverArt({ variant }: { variant: GameWelcomeVariant }) {
  const preserveFrame = variant.fit === 'contain'
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
    </>
  )
}
