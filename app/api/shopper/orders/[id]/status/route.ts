import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/current-user'
import { getShopperOrder, updateShopperOrderStatus } from '@/lib/shopper-db'

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
    const status = typeof body.status === 'string' ? body.status : ''

    if (!status) {
      return NextResponse.json({ error: 'Statut requis' }, { status: 400 })
    }

    try {
      await updateShopperOrderStatus(id, status, currentUser.id, currentUser.role)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'ORDER_NOT_FOUND') {
          return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
        }
        if (error.message === 'INVALID_STATUS_TRANSITION') {
          return NextResponse.json({ error: 'Transition de statut invalide' }, { status: 400 })
        }
        if (error.message === 'ORDER_NOT_ASSIGNED_TO_USER') {
          return NextResponse.json({ error: 'Commande assignée à un autre shopper' }, { status: 403 })
        }
      }
      throw error
    }

    const order = await getShopperOrder(id, currentUser.role, currentUser.id)
    return NextResponse.json({ order })
  } catch (error) {
    console.error('[PATCH /api/shopper/orders/:id/status]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
