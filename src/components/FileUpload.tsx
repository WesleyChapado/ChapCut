import { useRef } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onInvalidFile?: () => void
  disabled?: boolean
}

export function FileUpload({ onFileSelect, onInvalidFile, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | undefined) => {
    if (!file || disabled) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      onInvalidFile?.()
      return
    }
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFile(e.dataTransfer.files[0])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    handleFile(file)
  }

  const openFilePicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  return (
    <div
      className={`file-upload${disabled ? ' file-upload--disabled' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={openFilePicker}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openFilePicker()
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      <span className="file-upload__title">Arraste ou selecione um arquivo</span>
      <input
        ref={inputRef}
        type="file"
        className="file-upload__input"
        accept="application/pdf,.pdf"
        onChange={handleInputChange}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
      />
    </div>
  )
}
