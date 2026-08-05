interface PageThumbnailProps {
  pageNumber: number
  dataUrl: string
  selected: boolean
  onSelect: () => void
}

export function PageThumbnail({
  pageNumber,
  dataUrl,
  selected,
  onSelect,
}: PageThumbnailProps) {
  return (
    <button
      type="button"
      className={`page-thumbnail${selected ? ' page-thumbnail--selected' : ''}`}
      onClick={onSelect}
    >
      <span className="page-thumbnail__label">Página {pageNumber}</span>
      <img src={dataUrl} alt={`Página ${pageNumber}`} className="page-thumbnail__image" />
    </button>
  )
}
