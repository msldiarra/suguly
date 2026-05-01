import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/current-user'
import { assignOrderToShopper, getShopperOrder } from '@/lib/shopper-db'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || !['SHOPPER', 'ADMIN'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const shopperId = Number(body.shopperId)

    if (!Number.isFinite(shopperId)) {
      return NextResponse.json({ error: 'shopperId invalide' }, { status: 400 })
    }

    if (currentUser.role === 'SHOPPER' && shopperId !== currentUser.id) {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 })
    }

    await assignOrderToShopper(id, shopperId)
    const order = await getShopperOrder(id, currentUser.role, currentUser.id)

    return NextResponse.json({ order })
  } catch (error) {
    console.error('[PATCH /api/shopper/orders/:id/assign]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
