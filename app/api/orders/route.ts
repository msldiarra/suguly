import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateOrderNumber } from '@/lib/orders'
import { getDeliveryFee } from '@/lib/delivery'
import { isMalianPhone } from '@/lib/validate'

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

    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
