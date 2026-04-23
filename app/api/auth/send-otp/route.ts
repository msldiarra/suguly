import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Twilio SMS API implementation
async function sendSms(phone: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('⚠️ Twilio credentials missing, falling back to mock.')
    console.log(`\n\n🟢 [MOCK SMS to ${phone}]: ${message}\n\n`)
    return true
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          To: phone,
          From: fromNumber,
          Body: message,
        }),
      }
    )

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Twilio Error:', errorData)
      throw new Error(`Twilio API error: ${res.status}`)
    }

    return true
  } catch (error) {
    console.error('Failed to send SMS via Twilio:', error)
    return false
  }
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

    // Send SMS message
    await sendSms(phone, `Votre code Suguly est: ${code}. Il est valable 5 minutes.`)

    // Check if customer already exists and has a PIN
    const customer = await prisma.customer.findUnique({ where: { phone } })
    const hasPin = !!customer?.pinHash

    return NextResponse.json({ success: true, hasPin })
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'OTP:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
