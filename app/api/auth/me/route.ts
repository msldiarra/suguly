import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { getCustomerRole } from '@/lib/customer-role'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const token = cookies().get('suguly_session')?.value
    if (!token) return NextResponse.json({ authenticated: false })

    const decoded = verifyToken(token)
    if (!decoded || !decoded.id) return NextResponse.json({ authenticated: false })

    const customer = await prisma.customer.findUnique({
      where: { id: decoded.id },
      select: { id: true, phone: true, name: true }
    })

    if (!customer) return NextResponse.json({ authenticated: false })

    const role = await getCustomerRole(customer.id)

    return NextResponse.json({ authenticated: true, customer: { ...customer, role } })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
