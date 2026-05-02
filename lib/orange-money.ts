'use server'

import { prisma } from './db'

// --- INTERFACES AND TYPES ---

interface TokenResponse {
  token_type: string
  access_token: string
  expires_in: string
}

interface WebPaymentResponse {
  status: number
  message: string
  pay_token: string
  payment_url: string
  notif_token: string
}

interface CreatePaymentArgs {
  internalOrderId: number
  orderNumber: string
  amount: number
  lang?: 'fr' | 'en'
  reference: string
}

// --- ENVIRONMENT VARIABLES ---

const AUTH_HEADER = process.env.OM_AUTH_HEADER || ''
const MERCHANT_KEY = process.env.OM_MERCHANT_KEY || ''
const API_BASE_URL = process.env.OM_API_BASE_URL || 'https://api.orange.com'
const OM_WEBPAY_PATH = process.env.OM_WEBPAY_PATH || '/orange-money-webpay/v1/webpayment'
const OM_CURRENCY = process.env.OM_CURRENCY || 'XOF'
const APP_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Simple in-memory cache for the auth token
let cachedToken: string | null = null
let tokenExpiresAt: number = 0

// --- AUTHENTICATION ---

/**
 * Fetches and caches the Orange Money API access token.
 */
async function getOrangeMoneyAuthToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && tokenExpiresAt > now) {
    return cachedToken
  }

  if (!AUTH_HEADER) {
    throw new Error('OM_AUTH_HEADER is missing')
  }

  const response = await fetch(`${API_BASE_URL}/oauth/v3/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: AUTH_HEADER,
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store'
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Failed to get Orange Money auth token: ${errorBody}`)
  }

  const data = (await response.json()) as TokenResponse
  const expiresInSeconds = parseInt(data.expires_in, 10) - 60 // 60s buffer

  cachedToken = data.access_token
  tokenExpiresAt = now + (expiresInSeconds * 1000)

  return data.access_token
}

// --- CORE PAYMENT LOGIC ---

/**
 * Initiates a payment with Orange Money and returns the payment URL.
 */
export async function createOrangeMoneyPayment(
  args: CreatePaymentArgs
): Promise<{ paymentUrl: string }> {
  const { internalOrderId, orderNumber, amount, lang = 'fr', reference } = args

  try {
    if (!MERCHANT_KEY) {
      throw new Error('OM_MERCHANT_KEY is missing')
    }

    const accessToken = await getOrangeMoneyAuthToken()

    const notifUrl = `${APP_BASE_URL}/api/payments/orangemoney/notify`
    const returnUrl = `${APP_BASE_URL}/confirmation/${orderNumber}`
    const cancelUrl = `${APP_BASE_URL}/checkout?error=cancelled` // Go back to checkout if cancelled

    const response = await fetch(
      `${API_BASE_URL}${OM_WEBPAY_PATH}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          merchant_key: MERCHANT_KEY,
          currency: OM_CURRENCY,
          order_id: orderNumber,
          amount,
          return_url: returnUrl,
          cancel_url: cancelUrl,
          notif_url: notifUrl,
          lang,
          reference,
        }),
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Orange Money API error: ${response.status} ${errorBody}`)
    }

    const data = (await response.json()) as WebPaymentResponse

    // Save tokens to verify callback
    await prisma.order.update({
      where: { id: internalOrderId },
      data: {
        orangeMoneyPayToken: data.pay_token,
        orangeMoneyNotifToken: data.notif_token,
      },
    })

    return { paymentUrl: data.payment_url }
  } catch (error) {
    console.error('Failed to create Orange Money payment:', error)
    throw new Error('Could not initiate Orange Money payment.')
  }
}

// --- NOTIFICATION HANDLING ---

export interface NotificationPayload {
  status: 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'PENDING' | 'INITIATED'
  notif_token: string
  txnid: string
}

/**
 * Verifies and processes the notification sent by Orange Money.
 */
export async function handleOrangeMoneyNotification(
  payload: NotificationPayload
): Promise<void> {
  const { status, notif_token, txnid } = payload

  const order = await prisma.order.findFirst({
    where: { orangeMoneyNotifToken: notif_token },
  })

  if (!order) {
    console.warn(`Orange Money notification: Order not found for token ${notif_token}`)
    return
  }

  if (status === 'SUCCESS') {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        omTransactionId: txnid,
      },
    })
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAYMENT_FAILED',
      },
    })
  }
}
