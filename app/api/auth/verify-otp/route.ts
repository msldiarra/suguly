import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { getCustomerRole } from '@/lib/customer-role'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json()
    
    if (!phone || !code) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Find the latest active OTP session
    const otpSession = await prisma.otpSession.findFirst({
      where: {
        phone,
        code,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!otpSession) {
      return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 })
    }

    // OTP is valid. Now find or create the customer
    let customer = await prisma.customer.findUnique({ where: { phone } })
    
    if (!customer) {
      customer = await prisma.customer.create({
        data: { phone }
      })
    }

    const role = await getCustomerRole(customer.id)

    // Create a secure session token
    const token = signToken({ id: customer.id, phone: customer.phone, role }, 180) // 180 days

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

    // Optionally delete the OTP session so it can't be reused
    await prisma.otpSession.deleteMany({ where: { phone } })

    return NextResponse.json({ 
      success: true, 
      hasPin: !!customer.pinHash,
      customer: { id: customer.id, phone: customer.phone, name: customer.name, role }
    })
  } catch (error) {
    console.error('Erreur lors de la vérification OTP:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
