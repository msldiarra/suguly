'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'

interface OrderData {
  orderNumber: string
  nom: string
  tel: string
  total?: number
}

import { use } from 'react'

export default function ConfirmationPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const [order, setOrder] = useState<OrderData | null>(null)
  
  // Use React.use() if params is a promise, or just access it if not.
  // In Next.js 14, params is sync. In Next.js 15, it's async.
  const resolvedParams = params instanceof Promise ? use(params) : params
  const orderNumber = resolvedParams.id

  useEffect(() => {
    // Clear cart upon successful order confirmation
    localStorage.removeItem('suguly_cart')
    window.dispatchEvent(new Event('cart-updated'))

    const raw = localStorage.getItem('suguly_last_order')
    if (raw) {
      setOrder(JSON.parse(raw))
    }
  }, [])

  return (
    <div className="max-w-lg mx-auto py-16 sm:py-20 px-4 text-center">
      {/* Success icon */}
      <div className="w-16 h-16 bg-white border border-[#D1D1D1] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="font-head text-3xl font-semibold mb-3 tracking-tight">Commande confirmée</h1>
      {order?.nom && (
        <p className="text-text-light text-sm mb-2 font-medium">Merci de votre confiance, {order.nom.split(' ')[0]}.</p>
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
          {order?.tel && ` au +223 ${order.tel}`}. Notre équipe logistique vous contactera pour coordonner la livraison.
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
