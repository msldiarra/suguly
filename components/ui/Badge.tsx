interface BadgeProps {
  label: string
  className?: string
}

const COLORS: Record<string, string> = {
  Nouveau: 'bg-primary text-white',
  Populaire: 'bg-emerald-600 text-white',
  Promo: 'bg-rose-600 text-white',
}

export function Badge({ label, className = '' }: BadgeProps) {
  const colorClass = COLORS[label] ?? 'bg-gray-600 text-white'
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap ${colorClass} ${className}`}
    >
      {label}
    </span>
  )
}
