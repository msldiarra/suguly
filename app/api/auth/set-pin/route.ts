import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export async function POST(req: Request) {
  try {
    const { pin } = await req.json()
    
    if (!pin || pin.length < 4) {
      return NextResponse.json({ error: 'PIN invalide' }, { status: 400 })
    }

    // Get session
    const token = cookies().get('suguly_session')?.value
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    
    const decoded = verifyToken(token)
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }

    // Hash the PIN (simple sha256 is enough for a 4-digit PIN in this context, 
    // although bcrypt is standard, we use crypto for edge compatibility without dependencies)
    const pinHash = createHash('sha256').update(pin).digest('hex')

    await prisma.customer.update({
      where: { id: decoded.id },
      data: { pinHash }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la configuration du PIN:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
