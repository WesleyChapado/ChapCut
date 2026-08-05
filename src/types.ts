import type { PDFDocumentProxy } from 'pdfjs-dist'

export type AppStep = 'upload' | 'selectModel' | 'processing' | 'done'

export interface PageThumbnail {
  pageIndex: number
  dataUrl: string
}

export interface LoadedPdf {
  pdfDocument: PDFDocumentProxy
  pageCount: number
  thumbnails: PageThumbnail[]
  bytes: Uint8Array
}

export interface SplitDocument {
  name: string
  bytes: Uint8Array
}

export interface ProcessingProgress {
  phase: 'analyzing' | 'splitting' | 'zipping'
  current: number
  total: number
}
