import { Link } from 'react-router-dom'
import logoMark from '../../assets/icons/logo-mark.svg'

interface LogoProps {
  className?: string
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img src={logoMark} alt="Earth logo mark" className="h-12 w-auto shrink-0" />
      <span
        className="text-[#0c2310] text-[40.65px] leading-none lowercase whitespace-nowrap"
        style={{ fontFamily: 'Goldman, serif' }}
      >
        <span className="uppercase">E</span>arth
      </span>
    </Link>
  )
}
