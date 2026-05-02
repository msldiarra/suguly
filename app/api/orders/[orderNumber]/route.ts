import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        paymentMethod: true,
        paymentStatus: true,
        orderStatus: true,
        total: true,
        guestName: true,
        guestPhone: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (err) {
    console.error('[GET /api/orders/:orderNumber]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
