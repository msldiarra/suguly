'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/format'

const MOCK_ORDERS = [
  { id: 'SGY-38291', date: '18 avr. 2026', status: 'Livrée', total: 42900, items: 3 },
  { id: 'SGY-29183', date: '12 avr. 2026', status: 'En cours', total: 19900, items: 1 },
  { id: 'SGY-10042', date: '3 avr. 2026', status: 'Annulée', total: 28500, items: 2 },
]

const STATUS_COLORS: Record<string, string> = {
  Livrée: 'bg-emerald-100 text-emerald-700',
  'En cours': 'bg-orange-100 text-orange-700',
  Annulée: 'bg-rose-100 text-rose-700',
}

export default function ComptePage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [tel, setTel] = useState('')
  const [step, setStep] = useState<'tel' | 'code'>('tel')
  const [code, setCode] = useState('')

  if (!loggedIn) {
    return (
      <div className="max-w-sm mx-auto py-12 sm:py-16 px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="font-head text-2xl font-extrabold mb-1.5">Mon compte</h1>
          <p className="text-sm text-text-light">Connectez-vous avec votre numéro de téléphone</p>
        </div>

        {step === 'tel' ? (
          <>
            <label className="block text-sm font-bold mb-2">Numéro de téléphone</label>
            <div className="flex border-2 border-bg-card rounded-xl overflow-hidden mb-5">
              <span className="px-3.5 py-3 bg-bg border-r border-bg-card text-sm font-semibold text-text-light">+223</span>
              <input
                type="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="76 54 32 10"
                className="flex-1 px-3.5 py-3 text-sm outline-none"
              />
            </div>
            <button
              onClick={() => setStep('code')}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-extrabold text-sm hover:bg-primary-dark transition-colors"
            >
              Recevoir mon code SMS
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-text-light mb-4">Code envoyé au +223 {tel}</p>
            <label className="block text-sm font-bold mb-2">Code de vérification</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="_ _ _ _ _ _"
              maxLength={6}
              className="w-full px-4 py-3 border-2 border-bg-card rounded-xl text-2xl font-head font-extrabold tracking-[0.3em] text-center outline-none focus:border-primary mb-4"
            />
            <button
              onClick={() => setLoggedIn(true)}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-extrabold text-sm hover:bg-primary-dark transition-colors mb-2.5"
            >
              Se connecter
            </button>
            <button
              onClick={() => setStep('tel')}
              className="w-full py-3 bg-white border-2 border-bg-card rounded-xl font-semibold text-sm"
            >
              ← Changer de numéro
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-screen-md mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div className="flex items-center gap-4 mb-7">
        <div className="w-13 h-13 bg-primary rounded-full flex items-center justify-center text-white font-head font-extrabold text-xl">
          M
        </div>
        <div>
          <h2 className="font-head font-extrabold text-lg">Mamadou Coulibaly</h2>
          <p className="text-sm text-text-light">+223 {tel || '76 54 32 10'}</p>
        </div>
      </div>

      <h3 className="font-head font-extrabold text-base mb-4">Mes commandes</h3>
      <div className="space-y-3">
        {MOCK_ORDERS.map((order) => (
          <div key={order.id} className="bg-white rounded-xl px-5 py-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-head font-extrabold text-sm">{order.id}</p>
              <p className="text-xs text-text-light mt-0.5">
                {order.date} · {order.items} article{order.items > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-head font-extrabold text-primary text-sm">{formatPrice(order.total)}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status]}`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
