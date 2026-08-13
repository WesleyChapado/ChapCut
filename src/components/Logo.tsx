import logoDark from '../assets/logo_white.png'
import logoLight from '../assets/logo_black.png'

interface LogoProps {
  onClick?: () => void
}

export function Logo({ onClick }: LogoProps) {
  return (
    <button type="button" className="logo" onClick={onClick} aria-label="Voltar à página inicial">
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
        <img src={logoLight} alt="Celnar" className="logo__img logo__img--light" />
        <img src={logoDark} alt="" className="logo__img logo__img--dark" />
        <span className="logo__tagline">Celnar transportes rodoviários LTDA.</span>
      </div>
    </button>
  )
}
