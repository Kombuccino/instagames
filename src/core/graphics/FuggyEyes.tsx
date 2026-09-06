import './fuggyEyes.css'

type FuggyEyesProps = {
  className?: string
}

export function FuggyEyes({ className = '' }: FuggyEyesProps) {
  return (
    <span className={`mf-fuggy-eyes ${className}`.trim()} aria-hidden="true">
      <svg className="mf-fuggy-eyes__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/*
         * These two dark patches cover the white eyes baked into the wagon
         * raster without flattening Fuggy's whole faceted visor. All live eye
         * expressions are then drawn on top of those patches.
         */}
        <path className="mf-fuggy-eyes__mask" d="M16 36 L27 18 L43 33 L45 57 L33 72 L18 61 Z" />
        <path className="mf-fuggy-eyes__mask" d="M70 22 L82 8 L97 28 L95 49 L84 61 L70 51 Z" />

        <g className="mf-fuggy-eyes__state mf-fuggy-eyes__state--neutral">
          <polygon points="31,42 37,53 31,64 25,53" />
          <polygon points="83,27 89,38 83,49 77,38" />
        </g>

        <g className="mf-fuggy-eyes__state mf-fuggy-eyes__state--blink">
          <path d="M23 44 L34 53 L23 62" />
          <path d="M91 29 L80 38 L91 47" />
        </g>

        <g className="mf-fuggy-eyes__state mf-fuggy-eyes__state--happy">
          <path d="M22 58 L31 46 L40 58" />
          <path d="M74 43 L83 31 L92 43" />
        </g>

        <g className="mf-fuggy-eyes__state mf-fuggy-eyes__state--look-left">
          <polygon points="27,43 33,53 27,63 21,53" />
          <polygon points="79,28 85,38 79,48 73,38" />
        </g>

        <g className="mf-fuggy-eyes__state mf-fuggy-eyes__state--sleepy">
          <path d="M23 54 L39 52" />
          <path d="M75 39 L91 37" />
        </g>

        <g className="mf-fuggy-eyes__state mf-fuggy-eyes__state--awake">
          <circle cx="31" cy="53" r="6" />
          <circle cx="83" cy="38" r="6" />
        </g>

        <g className="mf-fuggy-eyes__state mf-fuggy-eyes__state--look-right">
          <polygon points="35,43 41,53 35,63 29,53" />
          <polygon points="87,28 93,38 87,48 81,38" />
        </g>
      </svg>
    </span>
  )
}
