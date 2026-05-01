import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/current-user'
import { getShopperProfile, listShopperOrders } from '@/lib/shopper-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || !['SHOPPER', 'ADMIN'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const [shopper, orders] = await Promise.all([
      getShopperProfile(currentUser.id, currentUser.name, currentUser.phone),
      listShopperOrders(currentUser.role, currentUser.id),
    ])

    return NextResponse.json({ shopper, orders })
  } catch (error) {
    console.error('[GET /api/shopper/orders]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
