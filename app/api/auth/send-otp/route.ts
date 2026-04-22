import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// MOCK: Replace with real WhatsApp API later (Twilio, Meta, etc.)
async function sendWhatsApp(phone: string, message: string) {
  console.log(`\n\n🟢 [MOCK WhatsApp to ${phone}]: ${message}\n\n`)
  // Wait a little bit to simulate network
  await new Promise(r => setTimeout(r, 1000))
  return true
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()
    
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Numéro de téléphone invalide' }, { status: 400 })
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // Save to OtpSession
    await prisma.otpSession.create({
      data: {
        phone,
        code,
        expiresAt,
      }
    })

    // Send WhatsApp message
    await sendWhatsApp(phone, `Votre code Suguly est: ${code}. Il est valable 5 minutes.`)

    // Check if customer already exists and has a PIN
    const customer = await prisma.customer.findUnique({ where: { phone } })
    const hasPin = !!customer?.pinHash

    return NextResponse.json({ success: true, hasPin })
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'OTP:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
