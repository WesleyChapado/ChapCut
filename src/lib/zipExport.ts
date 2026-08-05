import JSZip from 'jszip'
import type { SplitDocument } from '../types'

export async function createAndDownload(
  documents: SplitDocument[],
  filename = 'resultado.zip',
): Promise<void> {
  const zip = new JSZip()

  for (const doc of documents) {
    zip.file(doc.name, doc.bytes)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
