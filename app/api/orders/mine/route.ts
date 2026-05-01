import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get session from cookie
    const token = cookies().get('suguly_session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }

    // Fetch orders for this customer
    const orders = await prisma.order.findMany({
      where: {
        customerId: decoded.id
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Map to a simpler format for the UI if needed, or return as is
    const formattedOrders = orders.map(order => ({
      id: order.orderNumber,
      date: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(order.createdAt),
      status: order.orderStatus === 'NEW' ? 'En cours' : 
              order.orderStatus === 'DELIVERED' ? 'Livrée' : 
              order.orderStatus === 'CANCELLED' ? 'Annulée' : order.orderStatus,
      total: order.total,
      items: order.items.reduce((sum, item) => sum + item.quantity, 0)
    }))

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
