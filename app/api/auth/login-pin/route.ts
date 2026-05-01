import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { getCustomerRole } from '@/lib/customer-role'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export async function POST(req: Request) {
  try {
    const { phone, pin } = await req.json()
    
    if (!phone || !pin) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const customer = await prisma.customer.findUnique({ where: { phone } })
    
    if (!customer || !customer.pinHash) {
      return NextResponse.json({ error: 'Compte ou PIN introuvable' }, { status: 400 })
    }

    const pinHash = createHash('sha256').update(pin).digest('hex')

    if (customer.pinHash !== pinHash) {
      return NextResponse.json({ error: 'PIN incorrect' }, { status: 401 })
    }

    // Create a secure session token
    const role = await getCustomerRole(customer.id)
    const token = signToken({ id: customer.id, phone: customer.phone, role }, 180)

    // Set cookie
    cookies().set({
      name: 'suguly_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 180 * 24 * 60 * 60, // 180 days
      path: '/',
    })

    return NextResponse.json({ 
      success: true,
      customer: { id: customer.id, phone: customer.phone, name: customer.name, role }
    })
  } catch (error) {
    console.error('Erreur lors du login avec PIN:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
