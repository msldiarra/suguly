import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/current-user'
import { addOrderNote, getShopperOrder } from '@/lib/shopper-db'

export async function POST(
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
    const text = typeof body.text === 'string' ? body.text.trim() : ''

    if (!text) {
      return NextResponse.json({ error: 'Note requise' }, { status: 400 })
    }

    await addOrderNote(id, text, currentUser.id)
    const order = await getShopperOrder(id, currentUser.role, currentUser.id)
    return NextResponse.json({ order })
  } catch (error) {
    if (error instanceof Error && error.message === 'ORDER_NOT_FOUND') {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }
    console.error('[POST /api/shopper/orders/:id/notes]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
