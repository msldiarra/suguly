'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/format'

const STATUS_COLORS: Record<string, string> = {
  Livrée: 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]',
  'En cours': 'bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]',
  Annulée: 'bg-[#FFF1F2] text-[#E11D48] border border-[#FFE4E6]',
}

type Step = 'tel' | 'login-pin' | 'otp' | 'create-pin'

export default function ComptePage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  
  const [step, setStep] = useState<Step>('tel')
  const [tel, setTel] = useState('')
  const [code, setCode] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState('')

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.authenticated) {
          setCustomerInfo(data.customer)
          setTel(data.customer.phone.replace('+223', ''))
          setLoggedIn(true)
        }
      } catch (err) {
        console.error('Session check failed', err)
      } finally {
        setIsPageLoading(false)
      }
    }
    checkSession()
  }, [])

  // Fetch orders when logged in
  useEffect(() => {
    if (loggedIn) {
      const fetchOrders = async () => {
        try {
          const res = await fetch('/api/orders/mine')
          const data = await res.json()
          if (data.orders) {
            setOrders(data.orders)
          }
        } catch (err) {
          console.error('Failed to fetch orders', err)
        }
      }
      fetchOrders()
    }
  }, [loggedIn])

  const handleContinue = async () => {
    if (tel.length < 8) {
      setError('Numéro invalide')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const fullPhone = `+223${tel}`
      const res = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      if (data.hasPin) {
        setStep('login-pin')
      } else {
        // New user or no PIN, send OTP automatically
        await handleSendOtp()
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOtp = async (isRetry = false) => {
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+223${tel}` })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      setStep('otp')
      if (isRetry) setError('') // Clear errors on successful retry
    } catch (err: any) {
      setError(err.message || 'Erreur réseau')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (code.length !== 6) return
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+223${tel}`, code })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      setCustomerInfo(data.customer)
      
      if (data.hasPin) {
        setLoggedIn(true)
      } else {
        setStep('create-pin')
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginPin = async () => {
    if (pin.length !== 4) return
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+223${tel}`, pin })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      setCustomerInfo(data.customer)
      setLoggedIn(true)
    } catch (err: any) {
      setError(err.message || 'Erreur réseau')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePin = async () => {
    if (pin.length !== 4 || pin !== confirmPin) {
      setError('Les PIN ne correspondent pas ou sont invalides')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      setLoggedIn(true)
    } catch (err: any) {
      setError(err.message || 'Erreur réseau')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setLoggedIn(false)
      setCustomerInfo(null)
      setOrders([])
      setStep('tel')
      setPin('')
      setCode('')
      setTel('')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-text border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div className="max-w-sm mx-auto py-12 sm:py-16 px-4">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#F7F7F8] border border-[#E5E5E5] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="font-head text-2xl font-semibold mb-1.5">Mon compte</h1>
          <p className="text-sm text-text-light">
            {step === 'tel' && "Connectez-vous avec votre numéro"}
            {step === 'login-pin' && "Saisissez votre code secret"}
            {step === 'otp' && "Vérification par WhatsApp"}
            {step === 'create-pin' && "Sécurisez votre compte"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FFF1F2] border border-[#FFE4E6] text-[#E11D48] text-sm font-medium rounded-xl text-center">
            {error}
          </div>
        )}

        {step === 'tel' && (
          <>
            <label className="block text-sm font-medium mb-2">Numéro de téléphone</label>
            <div className="flex border border-[#E5E5E5] rounded-xl overflow-hidden mb-5 focus-within:border-text transition-colors">
              <span className="px-3.5 py-3 bg-[#F7F7F8] border-r border-[#E5E5E5] text-sm font-medium text-text-light">+223</span>
              <input
                type="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="76 54 32 10"
                className="flex-1 px-3.5 py-3 text-sm outline-none bg-white"
                autoFocus
              />
            </div>
            <button
              onClick={handleContinue}
              disabled={isLoading || tel.length < 8}
              className="w-full py-3 bg-text text-white rounded-xl font-medium text-sm hover:bg-black transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Vérification...' : 'Continuer'}
            </button>
          </>
        )}

        {step === 'login-pin' && (
          <>
            <p className="text-sm text-text-light mb-4 text-center">Bienvenue ! Veuillez saisir votre code PIN à 4 chiffres.</p>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-2xl font-head font-semibold tracking-[1em] text-center outline-none focus:border-text mb-4 transition-colors"
              autoFocus
            />
            <button
              onClick={handleLoginPin}
              disabled={isLoading || pin.length !== 4}
              className="w-full py-3 bg-text text-white rounded-xl font-medium text-sm hover:bg-black transition-colors mb-4 disabled:opacity-50"
            >
              {isLoading ? 'Vérification...' : 'Se connecter'}
            </button>
            <div className="flex justify-between items-center gap-2">
              <button
                onClick={() => { setStep('tel'); setPin(''); setError('') }}
                className="flex-1 py-3 bg-white border border-[#E5E5E5] rounded-xl font-medium text-sm text-text-light hover:bg-[#F7F7F8] transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={() => handleSendOtp(true)}
                className="flex-1 py-3 bg-white border border-[#E5E5E5] rounded-xl font-medium text-sm text-text-light hover:bg-[#F7F7F8] transition-colors"
              >
                Se connecter par WhatsApp
              </button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <p className="text-sm text-text-light mb-4 text-center">Code envoyé par WhatsApp au +223 {tel}</p>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="_ _ _ _ _ _"
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-2xl font-head font-semibold tracking-[0.3em] text-center outline-none focus:border-text mb-4 transition-colors"
              autoFocus
            />
            <button
              onClick={handleVerifyOtp}
              disabled={isLoading || code.length !== 6}
              className="w-full py-3 bg-text text-white rounded-xl font-medium text-sm hover:bg-black transition-colors mb-2.5 disabled:opacity-50"
            >
              {isLoading ? 'Vérification...' : 'Valider le code'}
            </button>
            <button
              onClick={() => { setStep('tel'); setCode(''); setError('') }}
              className="w-full py-3 bg-white border border-[#E5E5E5] rounded-xl font-medium text-sm text-text-light hover:bg-[#F7F7F8] transition-colors"
            >
              ← Changer de numéro
            </button>
          </>
        )}

        {step === 'create-pin' && (
          <>
            <p className="text-sm text-text-light mb-4 text-center">Créez un code PIN à 4 chiffres pour vous connecter instantanément la prochaine fois.</p>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Code PIN (4 chiffres)"
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-center outline-none focus:border-text mb-3 transition-colors font-medium tracking-widest"
              autoFocus
            />
            <input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Confirmer le code PIN"
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-center outline-none focus:border-text mb-5 transition-colors font-medium tracking-widest"
            />
            <button
              onClick={handleCreatePin}
              disabled={isLoading || pin.length !== 4 || confirmPin.length !== 4}
              className="w-full py-3 bg-text text-white rounded-xl font-medium text-sm hover:bg-black transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Création...' : 'Créer et se connecter'}
            </button>
            <button
              onClick={() => setLoggedIn(true)}
              className="w-full py-3 mt-2 font-medium text-sm text-text-light hover:underline"
            >
              Ignorer pour le moment
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-screen-md mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div className="flex items-center gap-4 mb-7">
        <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white font-head font-medium text-lg uppercase">
          {(customerInfo?.name || 'C')[0]}
        </div>
        <div>
          <h2 className="font-head font-semibold text-lg">{customerInfo?.name || 'Client Suguly'}</h2>
          <p className="text-sm text-text-light">+223 {tel}</p>
        </div>
      </div>

      <h3 className="font-head font-semibold text-base mb-4">Mes commandes</h3>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-[#F7F7F8] rounded-2xl border border-dashed border-[#D1D1D1]">
            <p className="text-sm text-text-light font-medium">Vous n'avez pas encore de commande.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white border border-[#D1D1D1] rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="font-semibold text-sm">{order.id}</p>
                <p className="text-xs text-text-light mt-0.5">
                  {order.date} · {order.items} article{order.items > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-sm text-text">{formatPrice(order.total)}</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-12 pt-8 border-t border-[#D1D1D1]">
        <button 
          onClick={handleLogout}
          className="py-2 px-4 rounded-xl text-[10px] font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-600 transition-all uppercase tracking-widest"
        >
          Déconnexion
        </button>
      </div>
    </div>
  )
}

