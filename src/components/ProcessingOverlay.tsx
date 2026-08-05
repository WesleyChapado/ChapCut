import type { ProcessingProgress } from '../types'

interface ProcessingOverlayProps {
  progress: ProcessingProgress
}

const phaseLabels: Record<ProcessingProgress['phase'], string> = {
  analyzing: 'Analisando páginas',
  splitting: 'Gerando documentos',
  zipping: 'Compactando arquivos',
}

export function ProcessingOverlay({ progress }: ProcessingOverlayProps) {
  const percentage =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="processing-overlay">
      <div className="processing-overlay__card">
        <h2>Processando...</h2>
        <p>
          {phaseLabels[progress.phase]}: {progress.current} de {progress.total}
        </p>
        <div className="processing-overlay__bar">
          <div
            className="processing-overlay__bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="processing-overlay__percentage">{percentage}%</span>
      </div>
    </div>
  )
}
