export function Logo() {
  return (
    <div className="logo">
      <div className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="6" width="24" height="32" rx="3" className="logo__page logo__page--back" />
          <rect x="14" y="10" width="24" height="32" rx="3" className="logo__page logo__page--mid" />
          <rect x="20" y="14" width="24" height="32" rx="3" className="logo__page logo__page--front" />
          <path
            d="M6 38 L42 10"
            className="logo__cut"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="logo__text">
        <span className="logo__name">
          Chap<span className="logo__name-accent">Cut</span>
        </span>
        <span className="logo__tagline">PDF Splitter por Layout</span>
      </div>
    </div>
  )
}
