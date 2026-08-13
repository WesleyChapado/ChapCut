import { useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { renderPagePreview } from '../lib/pdfLoader'
import { HelpTooltip } from './HelpTooltip'
import { PagePreview } from './PagePreview'
import { PageThumbnail } from './PageThumbnail'
import type { PageThumbnail as PageThumbnailType } from '../types'

interface PageGridProps {
  pdfDocument: PDFDocumentProxy
  thumbnails: PageThumbnailType[]
  selectedPageIndex: number | null
  onSelectPage: (pageIndex: number) => void
  onSplit: () => void
  onFileSelect: (file: File) => void
  onInvalidFile?: () => void
  isProcessing: boolean
}

export function PageGrid({
  pdfDocument,
  thumbnails,
  selectedPageIndex,
  onSelectPage,
  onSplit,
  onFileSelect,
  onInvalidFile,
  isProcessing,
}: PageGridProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const selectedThumb = thumbnails.find((t) => t.pageIndex === selectedPageIndex) ?? null

  useEffect(() => {
    if (selectedPageIndex === null) {
      setPreviewUrl(null)
      return
    }

    let cancelled = false
    setPreviewUrl(selectedThumb?.dataUrl ?? null)
    setPreviewLoading(true)

    renderPagePreview(pdfDocument, selectedPageIndex)
      .then((url) => {
        if (!cancelled) setPreviewUrl(url)
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [pdfDocument, selectedPageIndex, selectedThumb?.dataUrl])

  useEffect(() => {
    if (selectedPageIndex === null || !carouselRef.current) return
    const selectedEl = carouselRef.current.querySelector('[aria-current="true"]')
    selectedEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedPageIndex])

  const scrollCarousel = (direction: -1 | 1) => {
    carouselRef.current?.scrollBy({ left: direction * 200, behavior: 'smooth' })
  }

  return (
    <div className="page-grid">
      <div className="page-grid__header">
        <h2>
          Escolha a página modelo
          <HelpTooltip text="Selecione uma página cujo layout será usado como referência. O PDF será dividido sempre que outra página tiver estrutura visual semelhante." />
        </h2>
      </div>

      <div className="page-carousel">
        <button
          type="button"
          className="page-carousel__nav"
          onClick={() => scrollCarousel(-1)}
          aria-label="Páginas anteriores"
        >
          ‹
        </button>

        <div className="page-carousel__track" ref={carouselRef}>
          {thumbnails.map((thumb) => (
            <PageThumbnail
              key={thumb.pageIndex}
              pageNumber={thumb.pageIndex + 1}
              dataUrl={thumb.dataUrl}
              selected={selectedPageIndex === thumb.pageIndex}
              onSelect={() => onSelectPage(thumb.pageIndex)}
              compact
            />
          ))}
        </div>

        <button
          type="button"
          className="page-carousel__nav"
          onClick={() => scrollCarousel(1)}
          aria-label="Próximas páginas"
        >
          ›
        </button>
      </div>

      <PagePreview
        pageNumber={selectedThumb ? selectedThumb.pageIndex + 1 : null}
        dataUrl={previewUrl}
        loading={previewLoading}
        action={
          <div className="page-preview__actions">
            <button
              type="button"
              className="btn btn--primary btn--wide"
              onClick={onSplit}
              disabled={selectedPageIndex === null || isProcessing}
            >
              Dividir PDF
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--wide"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              Selecionar outro PDF
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="file-upload__input"
              accept="application/pdf,.pdf"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                  onInvalidFile?.()
                  return
                }
                onFileSelect(file)
              }}
            />
          </div>
        }
      />
    </div>
  )
}
