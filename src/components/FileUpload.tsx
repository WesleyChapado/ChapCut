interface FileUploadProps {
  onFileSelect: (file: File) => void
  onInvalidFile?: () => void
  disabled?: boolean
}

export function FileUpload({ onFileSelect, onInvalidFile, disabled }: FileUploadProps) {
  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      onInvalidFile?.()
      return
    }
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    handleFile(e.dataTransfer.files[0])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0])
  }

  return (
    <div
      className={`file-upload${disabled ? ' file-upload--disabled' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <p className="file-upload__title">Arraste o PDF aqui</p>
      <p className="file-upload__divider">ou</p>
      <label className="file-upload__button">
        Selecionar Arquivo
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleInputChange}
          disabled={disabled}
          hidden
        />
      </label>
    </div>
  )
}
