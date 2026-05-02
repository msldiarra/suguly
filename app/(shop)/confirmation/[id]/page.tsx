'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'

type OrderStatus = 'loading' | 'confirmed' | 'pending' | 'failed'

interface OrderData {
  orderNumber: string
  guestName?: string
  guestPhone?: string
  total?: number
  paymentMethod?: string
  paymentStatus?: string
}

export default function ConfirmationPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const [status, setStatus] = useState<OrderStatus>('loading')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [pollCount, setPollCount] = useState(0)

  const resolvedParams = params instanceof Promise ? use(params) : params
  const orderNumber = resolvedParams.id

  useEffect(() => {
    let cancelled = false

    async function checkOrderStatus() {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`)
        if (!res.ok) {
          // Order not found in DB — fall back to localStorage data
          const raw = localStorage.getItem('suguly_last_order')
          if (raw) {
            const local = JSON.parse(raw)
            setOrder(local)
            setStatus('confirmed')
            localStorage.removeItem('suguly_cart')
            window.dispatchEvent(new Event('cart-updated'))
          } else {
            setStatus('failed')
          }
          return
        }

        const { order: dbOrder } = await res.json()
        setOrder({
          orderNumber: dbOrder.orderNumber,
          guestName: dbOrder.guestName,
          guestPhone: dbOrder.guestPhone,
          total: dbOrder.total,
          paymentMethod: dbOrder.paymentMethod,
          paymentStatus: dbOrder.paymentStatus,
        })

        if (dbOrder.paymentMethod === 'CASH_ON_DELIVERY') {
          // Cash on delivery is always confirmed
          setStatus('confirmed')
          localStorage.removeItem('suguly_cart')
          window.dispatchEvent(new Event('cart-updated'))
        } else if (dbOrder.paymentStatus === 'PAID') {
          // Orange Money payment succeeded
          setStatus('confirmed')
          localStorage.removeItem('suguly_cart')
          window.dispatchEvent(new Event('cart-updated'))
        } else if (dbOrder.paymentStatus === 'PAYMENT_FAILED') {
          setStatus('failed')
        } else {
          // PENDING — payment may still be processing
          setStatus('pending')
          // Poll for up to 2 minutes (every 5s, 24 times)
          if (!cancelled && pollCount < 24) {
            setTimeout(() => {
              if (!cancelled) {
                setPollCount((c) => c + 1)
              }
            }, 5000)
          }
        }
      } catch {
        setStatus('failed')
      }
    }

    void checkOrderStatus()
    return () => { cancelled = true }
  }, [orderNumber, pollCount])

  if (status === 'loading') {
    return (
      <div className="max-w-lg mx-auto py-16 sm:py-20 px-4 text-center">
        <div className="w-16 h-16 bg-[#F7F7F8] border border-[#D1D1D1] rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h1 className="font-head text-2xl font-semibold mb-3">Vérification du paiement...</h1>
        <p className="text-sm text-text-light">Un instant, nous vérifions l'état de votre commande.</p>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="max-w-lg mx-auto py-16 sm:py-20 px-4 text-center">
        <div className="w-16 h-16 bg-[#FFFBEB] border border-[#FDE68A] rounded-full flex items-center justify-center mx-auto mb-8">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <h1 className="font-head text-3xl font-semibold mb-3 tracking-tight">Paiement en attente</h1>
        <p className="text-sm text-text-light mb-2">
          Votre paiement Orange Money est en cours de traitement.
        </p>
        <p className="text-xs uppercase tracking-widest font-bold text-text-light mb-10">
          Réf : <span className="text-text">{order?.orderNumber ?? orderNumber}</span>
        </p>

        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-5 flex gap-4 text-left mb-10">
          <div className="flex-shrink-0 w-10 h-10 bg-white border border-[#FDE68A] rounded-full flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm text-text leading-relaxed">
            Si vous avez confirmé le paiement sur votre téléphone, cette page se mettra à jour automatiquement.
            Sinon, veuillez valider la demande de paiement dans votre application Orange Money.
          </p>
        </div>

        {order?.total && (
          <div className="bg-white border border-[#D1D1D1] rounded-2xl p-6 text-left mb-8 shadow-sm">
            <h3 className="font-head font-bold text-xs uppercase tracking-widest mb-4 text-text-light">Résumé</h3>
            <div className="flex justify-between items-baseline pt-4 border-t border-[#D1D1D1]">
              <span className="text-sm font-semibold text-text-light">Montant</span>
              <span className="font-head font-bold text-xl text-text">{formatPrice(order.total)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Link
            href="/checkout"
            className="flex-1 py-4 bg-white border border-[#E5E5E5] rounded-xl font-medium text-sm hover:border-text transition-colors text-center"
          >
            Retour au checkout
          </Link>
          <Link
            href="/"
            className="flex-1 py-4 bg-text text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-sm text-center"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="max-w-lg mx-auto py-16 sm:py-20 px-4 text-center">
        <div className="w-16 h-16 bg-[#FFF1F2] border border-[#FFE4E6] rounded-full flex items-center justify-center mx-auto mb-8">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h1 className="font-head text-3xl font-semibold mb-3 tracking-tight">Paiement échoué</h1>
        <p className="text-sm text-text-light mb-2">
          Le paiement n&apos;a pas pu être confirmé. Aucun montant n&apos;a été débité.
        </p>
        <p className="text-xs uppercase tracking-widest font-bold text-text-light mb-10">
          Réf : <span className="text-text">{order?.orderNumber ?? orderNumber}</span>
        </p>

        <div className="bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl p-5 flex gap-4 text-left mb-10">
          <div className="flex-shrink-0 w-10 h-10 bg-white border border-[#FFE4E6] rounded-full flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm text-text leading-relaxed">
            Votre commande n&apos;a pas été validée. Vous pouvez réessayer le paiement ou choisir de payer à la livraison.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/checkout"
            className="flex-1 py-4 bg-text text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-sm text-center"
          >
            Réessayer le paiement
          </Link>
          <Link
            href="/"
            className="flex-1 py-4 bg-white border border-[#E5E5E5] rounded-xl font-medium text-sm hover:border-text transition-colors text-center"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    )
  }

  // status === 'confirmed'
  const displayName = order?.guestName ?? order?.orderNumber
  const firstName = displayName?.split(' ')[0]

  return (
    <div className="max-w-lg mx-auto py-16 sm:py-20 px-4 text-center">
      {/* Success icon */}
      <div className="w-16 h-16 bg-white border border-[#D1D1D1] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="font-head text-3xl font-semibold mb-3 tracking-tight">Commande confirmée</h1>
      {firstName && (
        <p className="text-text-light text-sm mb-2 font-medium">Merci de votre confiance, {firstName}.</p>
      )}
      <p className="text-xs uppercase tracking-widest font-bold text-text-light mb-10">
        Réf : <span className="text-text">{order?.orderNumber ?? orderNumber}</span>
      </p>

      {/* Order summary card */}
      <div className="bg-white border border-[#D1D1D1] rounded-2xl p-6 text-left mb-8 shadow-sm">
        <h3 className="font-head font-bold text-xs uppercase tracking-widest mb-4 text-text-light">Résumé de la commande</h3>
        {order?.total && (
          <div className="flex justify-between items-baseline pt-4 border-t border-[#D1D1D1]">
            <span className="text-sm font-semibold text-text-light">Total payé</span>
            <span className="font-head font-bold text-xl text-text">{formatPrice(order.total)}</span>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-[#F7F7F8] border border-[#D1D1D1] rounded-xl p-5 flex gap-4 text-left mb-10">
        <div className="flex-shrink-0 w-10 h-10 bg-white border border-[#D1D1D1] rounded-full flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.58 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
        <p className="text-sm text-text leading-relaxed">
          Un <strong>SMS de confirmation</strong> a été envoyé
          {order?.guestPhone && ` au ${order.guestPhone}`}. Notre équipe logistique vous contactera pour coordonner la livraison.
        </p>
      </div>

      <Link
        href="/"
        className="inline-block w-full py-4 bg-text text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-sm"
      >
        Continuer mes achats
      </Link>
    </div>
  )
}
