interface PageThumbnailProps {
  pageNumber: number
  dataUrl: string
  selected: boolean
  onSelect: () => void
  compact?: boolean
}

export function PageThumbnail({
  pageNumber,
  dataUrl,
  selected,
  onSelect,
  compact = false,
}: PageThumbnailProps) {
  return (
    <button
      type="button"
      className={`page-thumbnail${compact ? ' page-thumbnail--compact' : ''}${selected ? ' page-thumbnail--selected' : ''}`}
      onClick={onSelect}
      aria-label={`Página ${pageNumber}`}
      aria-current={selected ? 'true' : undefined}
    >
      <img src={dataUrl} alt="" className="page-thumbnail__image" />
      <span className="page-thumbnail__label">{pageNumber}</span>
    </button>
  )
}
