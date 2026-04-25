import { SHOPPER_STATUS_META, type ShopperOrderStatus } from '@/lib/shopper-data'

export function ShopperStatusBadge({
  status,
  small = false,
}: {
  status: ShopperOrderStatus
  small?: boolean
}) {
  const meta = SHOPPER_STATUS_META[status]

  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-full font-bold whitespace-nowrap',
        small ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs',
        meta.className,
      ].join(' ')}
    >
      {meta.label}
    </span>
  )
}
