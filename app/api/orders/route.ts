import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateOrderNumber } from '@/lib/orders'
import { getDeliveryFee } from '@/lib/delivery'
import { isMalianPhone } from '@/lib/validate'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

interface OrderItemInput {
  productId: number
  quantity: number
}

interface CreateOrderBody {
  guestName: string
  guestPhone: string
  quartier: string
  address?: string
  deliveryType?: 'standard' | 'express'
  paymentMethod: 'ORANGE_MONEY' | 'CASH_ON_DELIVERY'
  items: OrderItemInput[]
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderBody = await req.json()
    const { guestName, guestPhone, quartier, address, deliveryType = 'standard', paymentMethod, items } = body

    // Check for existing session to link customerId
    let customerId: number | undefined
    const token = cookies().get('suguly_session')?.value
    if (token) {
      const decoded = verifyToken(token)
      if (decoded?.id) {
        customerId = decoded.id
      }
    }

    // Validate inputs
    if (!guestName?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    if (!isMalianPhone(guestPhone)) return NextResponse.json({ error: 'Numéro de téléphone invalide' }, { status: 400 })
    if (!quartier) return NextResponse.json({ error: 'Quartier requis' }, { status: 400 })
    if (!['ORANGE_MONEY', 'CASH_ON_DELIVERY'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Mode de paiement invalide' }, { status: 400 })
    }
    if (!items?.length) return NextResponse.json({ error: 'Panier vide' }, { status: 400 })

    // Fetch products to calculate prices
    const productIds = items.map((i) => i.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } })
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Un ou plusieurs produits sont indisponibles' }, { status: 400 })
    }

    const deliveryFee = getDeliveryFee(quartier, deliveryType === 'express')
    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!
      return sum + product.price * item.quantity
    }, 0)
    const total = subtotal + deliveryFee

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId,
        guestName: guestName.trim(),
        guestPhone: `+223${guestPhone.replace(/\s/g, '')}`,
        quartier,
        address: address?.trim(),
        deliveryFee,
        subtotal,
        total,
        paymentMethod,
        paymentStatus: 'PENDING',
        orderStatus: 'NEW',
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!
            return { productId: item.productId, quantity: item.quantity, unitPrice: product.price }
          }),
        },
      },
      include: { items: { include: { product: true } } },
    })

    if (paymentMethod === 'ORANGE_MONEY') {
      try {
        const { createOrangeMoneyPayment } = await import('@/lib/orange-money')
        const { paymentUrl } = await createOrangeMoneyPayment({
          internalOrderId: order.id,
          orderNumber: order.orderNumber,
          amount: order.total,
          reference: `Commande ${order.orderNumber}`
        })
        return NextResponse.json({ order, paymentUrl }, { status: 201 })
      } catch (omError) {
        console.error('[POST /api/orders] Orange Money initiation failed:', omError)
        // We might still want to return the order but indicate payment initiation failed
        return NextResponse.json({ order, error: 'Échec initialisation Orange Money' }, { status: 201 })
      }
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
