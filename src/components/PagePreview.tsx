import type { ReactNode } from 'react'

interface PagePreviewProps {
  pageNumber: number | null
  dataUrl: string | null
  loading?: boolean
  action?: ReactNode
}

export function PagePreview({ pageNumber, dataUrl, loading = false, action }: PagePreviewProps) {
  if (pageNumber === null || dataUrl === null) {
    return (
      <div className="page-preview page-preview--empty">
        <p>Escolha uma página no carrossel acima</p>
      </div>
    )
  }

  return (
    <div className="page-preview">
      <div className={`page-preview__frame${loading ? ' page-preview__frame--loading' : ''}`}>
        <img src={dataUrl} alt={`Página ${pageNumber}`} className="page-preview__image" />
      </div>
      <div className="page-preview__footer">
        <span className="page-preview__label">Página {pageNumber} · modelo de layout</span>
        {action}
      </div>
    </div>
  )
}
