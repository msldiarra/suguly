import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = { sm: 20, md: 26, lg: 32 }
const FONT_MAP = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }

export function Logo({ size = 'md' }: LogoProps) {
  const s = SIZE_MAP[size]
  return (
    <Link href="/" className="inline-flex items-center gap-1.5 no-underline">
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="var(--primary)" />
        <path d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="3" fill="white" />
      </svg>
      <span className={`font-head font-extrabold text-text tracking-tight ${FONT_MAP[size]}`}>
        suguly
      </span>
    </Link>
  )
}
