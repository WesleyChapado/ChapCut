import type { PDFDocumentProxy } from 'pdfjs-dist'
import { getDocument } from './pdfSetup'
import { extractFeatures } from './layoutCompare'
import type { LoadedPdf, PageThumbnail } from '../types'

const THUMBNAIL_WIDTH = 120
const RENDER_WIDTH = 120

async function renderPageToCanvas(
  pdfDocument: PDFDocumentProxy,
  pageIndex: number,
  width: number,
): Promise<HTMLCanvasElement> {
  const page = await pdfDocument.getPage(pageIndex + 1)
  const viewport = page.getViewport({ scale: 1 })
  const scale = width / viewport.width
  const scaledViewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = scaledViewport.width
  canvas.height = scaledViewport.height

  await page.render({ canvas, viewport: scaledViewport }).promise
  return canvas
}

export async function loadPdf(
  file: File,
  onProgress?: (current: number, total: number) => void,
): Promise<LoadedPdf> {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  const pdfDocument = await getDocument({ data: bytes.slice() }).promise
  const pageCount = pdfDocument.numPages

  if (pageCount === 0) {
    throw new Error('O PDF não contém páginas')
  }

  const thumbnails: PageThumbnail[] = []

  for (let i = 0; i < pageCount; i++) {
    onProgress?.(i + 1, pageCount)
    const canvas = await renderPageToCanvas(pdfDocument, i, THUMBNAIL_WIDTH)
    thumbnails.push({
      pageIndex: i,
      dataUrl: canvas.toDataURL('image/jpeg', 0.7),
    })
    await yieldToMain()
  }

  return { pdfDocument, pageCount, thumbnails, bytes }
}

export async function extractPageFeatures(
  pdfDocument: PDFDocumentProxy,
  pageIndex: number,
): Promise<Float32Array> {
  const canvas = await renderPageToCanvas(pdfDocument, pageIndex, RENDER_WIDTH)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Não foi possível ler a página')

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  return extractFeatures(imageData)
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}
