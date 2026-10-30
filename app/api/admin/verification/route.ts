import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/current-user'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const requests = await prisma.businessVerification.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ requests })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { businessName, ownerName, phone, quartier, description } = body

  if (!businessName?.trim() || !ownerName?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  const request = await prisma.businessVerification.create({
    data: { businessName, ownerName, phone, quartier, description },
  })

  return NextResponse.json({ request }, { status: 201 })
}
