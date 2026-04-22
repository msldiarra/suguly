interface StarsProps {
  rating: number
  reviews?: number
}

export function Stars({ rating, reviews }: StarsProps) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12">
          <polygon
            points="6,1 7.5,4.5 11,4.5 8.5,7 9.5,11 6,9 2.5,11 3.5,7 1,4.5 4.5,4.5"
            fill={i <= Math.round(rating) ? 'var(--primary)' : '#ddd'}
          />
        </svg>
      ))}
      {reviews !== undefined && (
        <span className="text-xs text-text-light ml-0.5">({reviews})</span>
      )}
    </span>
  )
}
