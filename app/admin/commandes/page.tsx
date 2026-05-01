import { redirect } from 'next/navigation'
import { ShopperDashboard } from '@/components/shopper/ShopperDashboard'
import { getCurrentUser } from '@/lib/current-user'
import { getShopperProfile, listShopperOrders } from '@/lib/shopper-db'

export default async function AdminOrdersPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) redirect('/compte')
  if (currentUser.role !== 'ADMIN') redirect('/compte')

  const [adminProfile, orders] = await Promise.all([
    getShopperProfile(currentUser.id, currentUser.name?.trim() || 'Admin Suguly', currentUser.phone),
    listShopperOrders('ADMIN', currentUser.id),
  ])

  return (
    <ShopperDashboard
      orders={orders}
      shopper={adminProfile}
      currentUserRole={currentUser.role}
      heading="Contrôle admin"
      navigationLabel="Supervision, affectation et suivi des commandes"
      primaryHref="/admin/commandes"
      primaryLabel="Supervision"
    />
  )
}
