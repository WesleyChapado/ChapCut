import { useId } from 'react'

interface HelpTooltipProps {
  text: string
}

export function HelpTooltip({ text }: HelpTooltipProps) {
  const tooltipId = useId()

  return (
    <span className="help-tooltip">
      <button
        type="button"
        className="help-tooltip__trigger"
        aria-label="Como funciona"
        aria-describedby={tooltipId}
      >
        ?
      </button>
      <span className="help-tooltip__content" id={tooltipId} role="tooltip">
        {text}
      </span>
    </span>
  )
}
