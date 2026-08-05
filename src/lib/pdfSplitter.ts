import { PDFDocument } from 'pdf-lib'
import type { SplitDocument } from '../types'

export async function splitPdf(
  sourceBytes: Uint8Array,
  groups: number[][],
): Promise<SplitDocument[]> {
  const sourcePdf = await PDFDocument.load(sourceBytes)
  const documents: SplitDocument[] = []

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]!
    const newPdf = await PDFDocument.create()
    const copiedPages = await newPdf.copyPages(sourcePdf, group)
    for (const page of copiedPages) {
      newPdf.addPage(page)
    }

    const savedBytes = await newPdf.save()
    documents.push({
      name: `Documento ${String(i).padStart(3, '0')}.pdf`,
      bytes: savedBytes,
    })
  }

  return documents
}
