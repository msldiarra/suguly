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

export default function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<OrderData | null>(null)
  const [orderNumber, setOrderNumber] = useState('')

  useEffect(() => {
    params.then(({ id }) => {
      setOrderNumber(id)
      const raw = localStorage.getItem('suguly_last_order')
      if (raw) {
        setOrder(JSON.parse(raw))
      }
    })
  }, [params])

  return (
    <div className="max-w-lg mx-auto py-12 sm:py-16 px-4 text-center">
      {/* Success icon */}
      <div className="w-18 h-18 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1a936f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="font-head text-2xl sm:text-3xl font-extrabold mb-2">Commande confirmée !</h1>
      {order?.nom && (
        <p className="text-text-light text-sm mb-1">Merci {order.nom.split(' ')[0]} !</p>
      )}
      <p className="text-sm text-text-light mb-6">
        Numéro de commande :{' '}
        <strong className="text-primary font-head text-base">{order?.orderNumber ?? orderNumber}</strong>
      </p>

      {/* Order summary card */}
      <div className="bg-white rounded-2xl p-5 text-left mb-5 shadow-sm">
        <h3 className="font-head font-extrabold text-sm mb-3">Résumé</h3>
        {order?.total && (
          <div className="flex justify-between text-sm font-bold">
            <span>Total payé</span>
            <span className="text-primary">{formatPrice(order.total)}</span>
          </div>
        )}
      </div>

      {/* SMS info */}
      <div className="bg-primary-light rounded-xl p-4 flex gap-3 text-left mb-6">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.58 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        <p className="text-sm text-primary-dark leading-relaxed">
          Vous recevrez un <strong>SMS de confirmation</strong>
          {order?.tel && ` au +223 ${order.tel}`}. Notre livreur vous contactera avant la livraison.
        </p>
      </div>

      <Link
        href="/"
        className="inline-block w-full py-3.5 bg-primary text-white rounded-xl font-extrabold text-sm hover:bg-primary-dark transition-colors"
      >
        Continuer mes achats →
      </Link>
    </div>
  )
}
