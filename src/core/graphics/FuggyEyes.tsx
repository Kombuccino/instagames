import './fuggyEyes.css'

type FuggyEyesProps = {
  className?: string
}

export function FuggyEyes({ className = '' }: FuggyEyesProps) {
  return (
    <span className={`mf-fuggy-eyes ${className}`.trim()} aria-hidden="true">
      <span className="mf-fuggy-eyes__pair">
        <span className="mf-fuggy-eyes__socket mf-fuggy-eyes__socket--left">
          <span className="mf-fuggy-eyes__mark mf-fuggy-eyes__mark--left" />
        </span>
        <span className="mf-fuggy-eyes__socket mf-fuggy-eyes__socket--right">
          <span className="mf-fuggy-eyes__mark mf-fuggy-eyes__mark--right" />
        </span>
      </span>
    </span>
  )
}
