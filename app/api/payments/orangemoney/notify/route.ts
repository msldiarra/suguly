import { NextResponse } from 'next/server'
import { handleOrangeMoneyNotification, NotificationPayload } from '@/lib/orange-money'

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as NotificationPayload

    // Very basic validation
    if (!payload || !payload.notif_token) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    await handleOrangeMoneyNotification(payload)

    // Orange Money expects a 200 OK response to confirm receipt
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('OM Notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
