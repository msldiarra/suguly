import { notFound, redirect } from 'next/navigation'
import { ShopperOrderDetail } from '@/components/shopper/ShopperOrderDetail'
import { getCurrentUser } from '@/lib/current-user'
import { getShopperProfile, getShopperOrder, listShopperAssignees } from '@/lib/shopper-db'

export default async function ShopperOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser()

  if (!currentUser) redirect('/compte')
  if (!['SHOPPER', 'ADMIN'].includes(currentUser.role)) redirect('/compte')

  const { id } = await params
  const [shopper, order, assignees] = await Promise.all([
    getShopperProfile(currentUser.id, currentUser.name, currentUser.phone),
    getShopperOrder(id, currentUser.role, currentUser.id),
    listShopperAssignees(),
  ])
  if (!order) notFound()

  return (
    <ShopperOrderDetail
      initialOrder={order}
      shopper={shopper}
      assignees={assignees}
      currentUserRole={currentUser.role}
    />
  )
}
