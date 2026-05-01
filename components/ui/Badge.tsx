interface BadgeProps {
  label: string
  className?: string
}

const COLORS: Record<string, string> = {
  Nouveau: 'bg-[#F0F7FF] text-[#2563EB] border border-[#DBEAFE]',
  Populaire: 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]',
  Promo: 'bg-[#FFF1F2] text-[#E11D48] border border-[#FFE4E6]',
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
