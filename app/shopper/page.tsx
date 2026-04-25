import { redirect } from 'next/navigation'
import { ShopperDashboard } from '@/components/shopper/ShopperDashboard'
import { getCurrentUser } from '@/lib/current-user'
import { getShopperProfile, listShopperOrders } from '@/lib/shopper-db'

export default async function ShopperPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) redirect('/compte')
  if (!['SHOPPER', 'ADMIN'].includes(currentUser.role)) redirect('/compte')

  const [shopper, orders] = await Promise.all([
    getShopperProfile(currentUser.id, currentUser.name, currentUser.phone),
    listShopperOrders(currentUser.role, currentUser.id),
  ])

  return <ShopperDashboard orders={orders} shopper={shopper} currentUserRole={currentUser.role} />
}
