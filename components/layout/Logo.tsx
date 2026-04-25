import Link from 'next/link'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  onDark?: boolean
  className?: string
  imgClassName?: string
}

const SIZE_MAP = {
  xs: { width: 72, height: 22 },
  sm: { width: 88, height: 27 },
  md: { width: 140, height: 43, mobileScale: 0.9 },
  lg: { width: 176, height: 54 },
}

export function Logo({ size = 'md', onDark = false, className = '', imgClassName = '' }: LogoProps) {
  const dimensions = SIZE_MAP[size]
  const mobileStyle = size === 'md'
    ? {
        width: `${Math.round(dimensions.width * (dimensions.mobileScale ?? 1))}px`,
        height: 'auto',
      }
    : undefined

  return (
    <Link
      href="/"
      aria-label="Suguly"
      className={[
        'inline-flex items-center no-underline',
        onDark ? 'rounded-lg bg-white px-2.5 py-1.5' : '',
        className,
      ].join(' ')}
    >
      <img
        src="/logo-suguly.webp"
        alt="Suguly"
        width={dimensions.width}
        height={dimensions.height}
        loading="eager"
        decoding="async"
        className={['h-auto sm:w-auto', imgClassName].join(' ').trim()}
        style={mobileStyle}
      />
    </Link>
  )
}
