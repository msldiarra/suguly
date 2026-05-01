import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/current-user'
import { getShopperOrder, setOrderItemAvailability } from '@/lib/shopper-db'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || !['SHOPPER', 'ADMIN'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id, itemId } = await params
    const body = await req.json().catch(() => ({}))
    if (typeof body.available !== 'boolean') {
      return NextResponse.json({ error: 'Valeur de disponibilité invalide' }, { status: 400 })
    }

    const available = body.available
    const itemNumericId = Number(itemId)

    if (!Number.isFinite(itemNumericId)) {
      return NextResponse.json({ error: 'Article invalide' }, { status: 400 })
    }

    await setOrderItemAvailability(id, itemNumericId, available, currentUser.id)
    const order = await getShopperOrder(id, currentUser.role, currentUser.id)
    return NextResponse.json({ order })
  } catch (error) {
    if (error instanceof Error && error.message === 'ORDER_ITEM_NOT_FOUND') {
      return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
    }
    console.error('[PATCH /api/shopper/orders/:id/items/:itemId/availability]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
