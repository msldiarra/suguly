import Image from 'next/image'

const CATEGORY_PALETTES: Record<string, [string, string]> = {
  electronique: ['#1a1a2e', '#e85d04'],
  electromenager: ['#4a4e69', '#9a8c98'],
  maison: ['#1a936f', '#f5f5dc'],
  mode: ['#8B4513', '#c9184a'],
  beaute: ['#c9184a', '#fff8f0'],
  enfant: ['#ffd166', '#ef476f'],
  divers: ['#2d6a4f', '#e9c46a'],
}

interface ProductImgProps {
  title: string
  category: string | null
  imageUrl: string | null
  size?: number
  priority?: boolean
}

export function ProductImg({ title, category, imageUrl, size = 180, priority = false }: ProductImgProps) {
  const [bg, accent] = CATEGORY_PALETTES[category ?? ''] ?? ['#333', '#eee']
  const initials = title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  if (imageUrl) {
    return (
      <div style={{ width: size, height: size }} className="relative flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes={`${size}px`}
          className="object-contain"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>
    )
  }

  // Placeholder with colored gradient and initials
  return (
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${bg}22 0%, ${accent}33 100%)`,
      }}
      className="rounded-lg flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0"
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 60 60" style={{ opacity: 0.15 }}>
        <rect x="5" y="5" width="50" height="50" rx="6" fill={bg} />
        <rect x="12" y="12" width="36" height="36" rx="4" fill={accent} />
        <line x1="12" y1="20" x2="48" y2="20" stroke={bg} strokeWidth="1.5" />
        <line x1="12" y1="28" x2="48" y2="28" stroke={bg} strokeWidth="1.5" />
        <line x1="12" y1="36" x2="48" y2="36" stroke={bg} strokeWidth="1.5" />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontFamily: 'var(--font-sora)',
          fontWeight: 800,
          fontSize: size * 0.18,
          color: bg,
          opacity: 0.4,
          letterSpacing: '-0.02em',
        }}
      >
        {initials}
      </span>
    </div>
  )
}
