import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/current-user'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { status, adminNote } = body

  const validStatuses = ['PENDING', 'WAITING_DOCS', 'DOCS_RECEIVED', 'APPROVED', 'REJECTED']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const now = new Date()
  const data: Record<string, unknown> = { status }

  if (adminNote !== undefined) data.adminNote = adminNote
  if (status === 'WAITING_DOCS') data.whatsappSentAt = now
  if (status === 'DOCS_RECEIVED') data.docsReceivedAt = now
  if (status === 'APPROVED' || status === 'REJECTED') data.resolvedAt = now

  const updated = await prisma.businessVerification.update({
    where: { id: Number(id) },
    data,
  })

  return NextResponse.json({ request: updated })
}
