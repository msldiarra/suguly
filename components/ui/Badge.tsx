interface BadgeProps {
  label: string
  className?: string
}

const COLORS: Record<string, string> = {
  Nouveau: 'bg-primary-light text-primary border border-primary/20',
  Populaire: 'bg-accent/10 text-accent-dark border border-accent/20',
  Promo: 'bg-rose-50 text-rose-600 border border-rose-100',
}

export function Badge({ label, className = '' }: BadgeProps) {
  const colorClass = COLORS[label] ?? 'bg-[#F7F7F8] text-text-light border border-[#E5E5E5]'
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase whitespace-nowrap ${colorClass} ${className}`}
    >
      {label}
    </span>
  )
}
