import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import PdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?worker'

GlobalWorkerOptions.workerPort = new PdfjsWorker()

export { getDocument, GlobalWorkerOptions }
