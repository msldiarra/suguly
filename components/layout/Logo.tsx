import Link from 'next/link'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'header' | 'icon'
  onDark?: boolean
  className?: string
  imgClassName?: string
}

const SIZE_MAP: Record<string, { width: number; height: number; mobileScale?: number }> = {
  xs: { width: 72, height: 22 },
  sm: { width: 100, height: 30 },
  md: { width: 140, height: 42, mobileScale: 0.9 },
  lg: { width: 180, height: 54 },
}

const ICON_SIZE_MAP: Record<string, number> = {
  xs: 24,
  sm: 40,
  md: 48,
  lg: 64,
}

export function Logo({
  size = 'md',
  variant = 'header',
  onDark = false,
  className = '',
  imgClassName = '',
}: LogoProps) {
  const isIcon = variant === 'icon'
  const dimensions = isIcon
    ? { width: ICON_SIZE_MAP[size], height: ICON_SIZE_MAP[size] }
    : SIZE_MAP[size]

  const mobileStyle = !isIcon && size === 'md'
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
        'inline-flex items-center no-underline group',
        onDark ? 'rounded-lg bg-white p-1.5' : '',
        className,
      ].join(' ')}
    >
      <img
        src={isIcon ? '/logo-suguly-new.svg' : '/logo-suguly-header.svg'}
        alt="Suguly"
        width={dimensions.width}
        height={dimensions.height}
        loading="eager"
        decoding="async"
        className={['transition-transform group-hover:scale-105', imgClassName].join(' ').trim()}
        style={{
          width: `${dimensions.width}px`,
          height: isIcon ? `${dimensions.height}px` : 'auto',
          ...mobileStyle
        }}
      />
    </Link>
  )
}
