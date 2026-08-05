import { useCallback, useState } from 'react'
import { FileUpload } from './components/FileUpload'
import { Logo } from './components/Logo'
import { PageGrid } from './components/PageGrid'
import { ProcessingOverlay } from './components/ProcessingOverlay'
import { detectLayoutMatchIndices, groupPagesByLayoutMatches } from './lib/layoutCompare'
import { formatError, logProcessingError } from './lib/errors'
import { extractPageFeatures, loadPdf } from './lib/pdfLoader'
import { splitPdf } from './lib/pdfSplitter'
import { createAndDownload } from './lib/zipExport'
import type { AppStep, LoadedPdf, ProcessingProgress } from './types'

function App() {
  const [step, setStep] = useState<AppStep>('upload')
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdf | null>(null)
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingThumbnails, setLoadingThumbnails] = useState(false)
  const [thumbnailProgress, setThumbnailProgress] = useState({ current: 0, total: 0 })
  const [progress, setProgress] = useState<ProcessingProgress>({
    phase: 'analyzing',
    current: 0,
    total: 0,
  })
  const [documentCount, setDocumentCount] = useState(0)

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)
    setLoadingThumbnails(true)
    setThumbnailProgress({ current: 0, total: 0 })
    setSelectedPageIndex(null)

    try {
      const pdf = await loadPdf(file, (current, total) => {
        setThumbnailProgress({ current, total })
      })
      setLoadedPdf(pdf)
      setSelectedPageIndex(0)
      setStep('selectModel')
    } catch (err) {
      logProcessingError('carregamento', err)
      setError(`Não foi possível carregar o PDF: ${formatError(err)}`)
    } finally {
      setLoadingThumbnails(false)
    }
  }, [])

  const handleSplit = async () => {
    if (!loadedPdf || selectedPageIndex === null) return

    const modelPageIndex = selectedPageIndex

    setStep('processing')
    setError(null)

    let phase = 'análise de layout'

    try {
      const { pdfDocument, pageCount, bytes } = loadedPdf

      const modelFeatures = await extractPageFeatures(pdfDocument, modelPageIndex)
      const pageFeaturesCache = new Map<number, Float32Array>()
      pageFeaturesCache.set(modelPageIndex, modelFeatures)

      setProgress({ phase: 'analyzing', current: 0, total: pageCount })

      for (let i = 0; i < pageCount; i++) {
        if (i !== modelPageIndex) {
          const features = await extractPageFeatures(pdfDocument, i)
          pageFeaturesCache.set(i, features)
        }
        setProgress({ phase: 'analyzing', current: i + 1, total: pageCount })
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      }

      const allFeatures = Array.from({ length: pageCount }, (_, i) => {
        const features = pageFeaturesCache.get(i)
        if (!features) throw new Error(`Features ausentes para a página ${i + 1}`)
        return features
      })

      const layoutMatchIndices = detectLayoutMatchIndices(modelFeatures, allFeatures)
      const groups = groupPagesByLayoutMatches(pageCount, layoutMatchIndices)

      phase = 'divisão do PDF'
      setProgress({ phase: 'splitting', current: 0, total: groups.length })
      const documents = await splitPdf(bytes, groups)
      setProgress({ phase: 'splitting', current: groups.length, total: groups.length })

      phase = 'compactação ZIP'
      setProgress({ phase: 'zipping', current: 1, total: 1 })
      await createAndDownload(documents)

      setDocumentCount(documents.length)
      setStep('done')
    } catch (err) {
      logProcessingError(phase, err)
      setError(`Falha na etapa "${phase}": ${formatError(err)}`)
      setStep('selectModel')
    }
  }

  const handleReset = () => {
    setStep('upload')
    setLoadedPdf(null)
    setSelectedPageIndex(null)
    setError(null)
    setDocumentCount(0)
  }

  return (
    <div className="app">
      <header className="app__header">
        <Logo />
        <p className="app__subtitle">
          Divida um PDF em vários documentos comparando o layout de cada página com uma página
          modelo escolhida por você. Todo o processamento é feito localmente no seu navegador.
        </p>
      </header>

      {error && <div className="app__error">{error}</div>}

      {step === 'upload' && (
        <section className="app__section">
          <FileUpload
            onFileSelect={handleFileSelect}
            onInvalidFile={() => setError('Selecione um arquivo PDF válido.')}
            disabled={loadingThumbnails}
          />
          {loadingThumbnails && (
            <p className="app__loading">
              Carregando miniaturas... {thumbnailProgress.current} de {thumbnailProgress.total}
            </p>
          )}
        </section>
      )}

      {step === 'selectModel' && loadedPdf && (
        <section className="app__section">
          <PageGrid
            pdfDocument={loadedPdf.pdfDocument}
            thumbnails={loadedPdf.thumbnails}
            selectedPageIndex={selectedPageIndex}
            onSelectPage={setSelectedPageIndex}
            onSplit={handleSplit}
            isProcessing={false}
          />
        </section>
      )}

      {step === 'processing' && <ProcessingOverlay progress={progress} />}

      {step === 'done' && (
        <section className="app__section app__done">
          <h2>Download concluído!</h2>
          <p>
            {documentCount} documento{documentCount !== 1 ? 's' : ''} gerado
            {documentCount !== 1 ? 's' : ''} e compactado{documentCount !== 1 ? 's' : ''} em
            resultado.zip.
          </p>
          <button type="button" className="btn btn--primary" onClick={handleReset}>
            Novo PDF
          </button>
        </section>
      )}
    </div>
  )
}

export default App
