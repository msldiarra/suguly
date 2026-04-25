import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCustomerRole } from '@/lib/customer-role'

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()
    if (!phone) return NextResponse.json({ error: 'Numéro requis' }, { status: 400 })

    const customer = await prisma.customer.findUnique({
      where: { phone: phone.startsWith('+223') ? phone : `+223${phone.replace(/\s/g, '')}` }
    })

    return NextResponse.json({ 
      exists: !!customer, 
      hasPin: !!customer?.pinHash,
      role: customer ? await getCustomerRole(customer.id) : null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
