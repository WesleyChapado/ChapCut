import { PageThumbnail } from './PageThumbnail'
import type { PageThumbnail as PageThumbnailType } from '../types'

interface PageGridProps {
  thumbnails: PageThumbnailType[]
  selectedPageIndex: number | null
  onSelectPage: (pageIndex: number) => void
  onConfirmModel: () => void
  onSplit: () => void
  modelPageIndex: number | null
  isProcessing: boolean
}

export function PageGrid({
  thumbnails,
  selectedPageIndex,
  onSelectPage,
  onConfirmModel,
  onSplit,
  modelPageIndex,
  isProcessing,
}: PageGridProps) {
  return (
    <div className="page-grid">
      <div className="page-grid__header">
        <h2>Escolha a página modelo</h2>
        <p>
          Selecione uma página cujo layout será usado como referência para identificar onde o PDF
          deve ser dividido.
        </p>
      </div>

      <div className="page-grid__items">
        {thumbnails.map((thumb) => (
          <PageThumbnail
            key={thumb.pageIndex}
            pageNumber={thumb.pageIndex + 1}
            dataUrl={thumb.dataUrl}
            selected={selectedPageIndex === thumb.pageIndex}
            onSelect={() => onSelectPage(thumb.pageIndex)}
          />
        ))}
      </div>

      <div className="page-grid__actions">
        {selectedPageIndex !== null && modelPageIndex === null && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={onConfirmModel}
            disabled={isProcessing}
          >
            Usar esta página como modelo
          </button>
        )}

        {modelPageIndex !== null && (
          <div className="page-grid__model-info">
            <p>
              Modelo definido: <strong>Página {modelPageIndex + 1}</strong>
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onSplit}
              disabled={isProcessing}
            >
              Dividir PDF
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
