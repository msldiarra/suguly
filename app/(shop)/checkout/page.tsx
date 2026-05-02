'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { CartItem } from '@/lib/cart'
import { calcSubtotal } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { getDeliveryFee, QUARTIERS } from '@/lib/delivery'
import { isMalianPhone } from '@/lib/validate'

interface FormState {
  nom: string
  tel: string
  quartier: string
  indications: string
  livraison: 'standard' | 'express'
  payment: 'ORANGE_MONEY' | 'CASH_ON_DELIVERY'
}

interface FieldErrors {
  nom?: string
  tel?: string
  quartier?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [form, setForm] = useState<FormState>({
    nom: '',
    tel: '',
    quartier: '',
    indications: '',
    livraison: 'standard',
    payment: 'ORANGE_MONEY',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [cancelError, setCancelError] = useState(false)

  useEffect(() => {
    const initCheckout = async () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        if (params.get('error') === 'cancelled') {
          setStep(2)
          setCancelError(true)
          window.history.replaceState({}, '', '/checkout')
        }
      }

      const raw = localStorage.getItem('suguly_cart')
      const items = raw ? JSON.parse(raw) : []
      if (items.length === 0) {
        router.replace('/panier')
        return
      }

      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()

        if (!res.ok || !data.authenticated) {
          router.replace('/compte?redirect=/checkout')
          return
        }

        setCart(items)
        setForm((current) => ({
          ...current,
          nom: current.nom || data.customer?.name || '',
          tel: current.tel || data.customer?.phone?.replace('+223', '') || '',
        }))
        setAuthChecked(true)
      } catch {
        router.replace('/compte?redirect=/checkout')
      }
    }

    void initCheckout()
  }, [router])

  const setF = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const deliveryFee = getDeliveryFee(form.quartier || 'Autre quartier', form.livraison === 'express')
  const subtotal = calcSubtotal(cart)
  const total = subtotal + deliveryFee

  const validateStep1 = (): boolean => {
    const e: FieldErrors = {}
    if (!form.nom.trim()) e.nom = 'Nom requis'
    if (!isMalianPhone(form.tel)) e.tel = 'Numéro malien (8 chiffres)'
    if (!form.quartier) e.quartier = 'Quartier requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const [apiError, setApiError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setSubmitting(true)
    setApiError(null)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: form.nom,
          guestPhone: form.tel,
          quartier: form.quartier,
          address: form.indications,
          deliveryType: form.livraison,
          paymentMethod: form.payment,
          items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Server returned an error (including OM initiation failure)
        setApiError(data.error || 'Une erreur est survenue. Veuillez réessayer.')
        return
      }

      const { order, paymentUrl } = data

      localStorage.setItem(
        'suguly_last_order',
        JSON.stringify({ ...order, nom: form.nom, tel: form.tel })
      )

      if (paymentUrl) {
        // Redirect to Orange Money gateway — do NOT clear the cart yet
        // Cart will be cleared by the confirmation page once payment is verified
        window.location.href = paymentUrl
      } else {
        // Cash on delivery — clear cart and go to confirmation
        localStorage.removeItem('suguly_cart')
        window.dispatchEvent(new Event('cart-updated'))
        router.push(`/confirmation/${order.orderNumber}`)
      }
    } catch {
      setApiError('Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!authChecked || cart.length === 0) return null

  return (
    <div className="max-w-screen-md mx-auto px-4 sm:px-8 py-6 sm:py-8">
      {/* Step indicators */}
      <div className="flex items-center gap-6 mb-10 text-[10px] uppercase tracking-widest font-semibold">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-text' : 'text-text-light'}`}>
          <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${step >= 1 ? 'border-text bg-text text-white' : 'border-[#D1D5DB] text-text-light'}`}>
            {step > 1 ? '✓' : '1'}
          </span>
          Livraison
        </div>
        <div className="w-8 h-px bg-[#E5E5E5]" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-text' : 'text-text-light'}`}>
          <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${step >= 2 ? 'border-text bg-text text-white' : 'border-[#D1D5DB] text-text-light'}`}>
            2
          </span>
          Paiement
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form */}
        <div className="flex-1">
          {step === 1 && (
            <div>
              <h2 className="font-head text-2xl font-semibold mb-8">Coordonnées & Livraison</h2>

              <Field label="Nom complet *" error={errors.nom}>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => { setF('nom', e.target.value); setErrors((er) => ({ ...er, nom: undefined })) }}
                  placeholder="Ex : Mamadou Coulibaly"
                  className={inputClass(!!errors.nom)}
                />
              </Field>

              <Field label="Téléphone *" error={errors.tel}>
                <div className={`flex border rounded-xl overflow-hidden ${errors.tel ? 'border-rose-500' : 'border-[#A3A3A3]'}`}>
                  <span className="px-3.5 py-3 bg-[#F7F7F8] border-r border-[#A3A3A3] text-xs font-semibold text-text-light whitespace-nowrap">
                    +223
                  </span>
                  <input
                    type="tel"
                    value={form.tel}
                    onChange={(e) => { setF('tel', e.target.value); setErrors((er) => ({ ...er, tel: undefined })) }}
                    placeholder="76 54 32 10"
                    className="flex-1 px-3.5 py-3 bg-white text-sm outline-none placeholder:text-[#999]"
                  />
                </div>
              </Field>

              <Field label="Quartier *" error={errors.quartier}>
                <select
                  value={form.quartier}
                  onChange={(e) => { setF('quartier', e.target.value); setErrors((er) => ({ ...er, quartier: undefined })) }}
                  className={selectClass(!!errors.quartier)}
                >
                  <option value="">Choisir un quartier...</option>
                  {QUARTIERS.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              </Field>

              <Field label="Indications complémentaires (optionnel)">
                <textarea
                  value={form.indications}
                  onChange={(e) => setF('indications', e.target.value)}
                  placeholder="Ex : Près de la grande mosquée, 2e portail bleu..."
                  rows={3}
                  className={`${inputClass(false)} resize-none`}
                />
              </Field>

              {/* Delivery mode */}
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest font-semibold text-text mb-4">Mode de livraison</p>
                {([
                  ['standard', 'Standard', '24–48h', getDeliveryFee(form.quartier || 'Autre quartier', false)],
                  ['express', 'Express', '12–24h', getDeliveryFee(form.quartier || 'Autre quartier', true)],
                ] as [string, string, string, number][]).map(([id, label, delay, fee]) => (
                  <label
                    key={id}
                    className={`flex items-center gap-3 p-4 rounded-xl border mb-3 cursor-pointer transition-all ${form.livraison === id ? 'border-text bg-[#F7F7F8]' : 'border-[#A3A3A3] bg-white hover:border-text'
                      }`}
                  >
                    <input
                      type="radio"
                      name="livraison"
                      checked={form.livraison === id}
                      onChange={() => setF('livraison', id as 'standard' | 'express')}
                      className="accent-text"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-sm">{label}</span>
                      <span className="text-text-light text-xs ml-2">· {delay}</span>
                    </div>
                    <span className="font-head font-semibold text-text text-sm">{formatPrice(fee)}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={() => validateStep1() && setStep(2)}
                className="w-full py-4 bg-text text-white rounded-xl font-medium text-sm hover:bg-black transition-colors"
              >
                Continuer vers le paiement
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-head text-2xl font-semibold mb-8">Paiement</h2>

              {cancelError && (
                <div className="mb-6 p-4 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl flex gap-3 items-start">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-sm text-[#E11D48] font-medium leading-relaxed">
                    Le paiement a été annulé, vous pouvez réessayer ou choisir de payer à la livraison.
                  </p>
                </div>
              )}

              {apiError && (
                <div className="mb-6 p-4 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl flex gap-3 items-start">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-sm text-[#E11D48] font-medium leading-relaxed">
                    {apiError}
                  </p>
                </div>
              )}

              {([
                ['ORANGE_MONEY', 'Orange Money', 'Paiement immédiat, commande traitée en priorité'],
                ['CASH_ON_DELIVERY', 'Paiement à la livraison', 'Payez en cash ou Orange Money à la réception'],
              ] as [string, string, string][]).map(([id, label, desc]) => (
                <label
                  key={id}
                  className={`flex items-start gap-3 p-5 rounded-xl border mb-4 cursor-pointer transition-all ${form.payment === id ? 'border-text bg-[#F7F7F8]' : 'border-[#A3A3A3] bg-white hover:border-text'
                    }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={form.payment === id}
                    onChange={() => setF('payment', id as 'ORANGE_MONEY' | 'CASH_ON_DELIVERY')}
                    className="accent-text mt-1"
                  />
                  <div>
                    <p className="font-semibold text-sm mb-1">{label}</p>
                    <p className="text-xs text-text-light leading-relaxed">{desc}</p>
                  </div>
                </label>
              ))}

              {form.payment === 'ORANGE_MONEY' && (
                <div className="bg-white border border-[#D1D1D1] rounded-xl p-5 mb-8">
                  <p className="text-[11px] text-text-light leading-relaxed">
                    Vous serez redirigé vers le portail sécurisé d'Orange Money pour saisir votre numéro et valider votre paiement.
                  </p>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 bg-white border border-[#E5E5E5] rounded-xl font-medium text-sm hover:border-text transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 py-4 bg-text text-white rounded-xl font-medium text-sm hover:bg-black disabled:opacity-60 transition-colors"
                >
                  {submitting ? 'Traitement...' : 'Confirmer ma commande'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order recap */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] shadow-sm sticky top-24">
            <h3 className="font-head font-semibold text-sm mb-6">Votre commande</h3>
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text leading-snug line-clamp-2 mb-1">{item.title}</p>
                    <p className="text-[10px] text-text-light font-medium uppercase tracking-wider">Qté: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E5E5E5] pt-6">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-text-light">Livraison</span>
                <span className="font-medium text-text">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-dashed border-[#E5E5E5]">
                <span className="font-semibold text-base">Total</span>
                <span className="text-text font-head font-semibold text-xl">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <label className="block text-xs uppercase tracking-widest font-semibold text-text mb-2">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-[10px] text-rose-600 font-bold uppercase tracking-wide">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return `w-full px-3.5 py-3 rounded-xl border text-sm outline-none bg-white transition-all placeholder:text-[#999] ${hasError ? 'border-rose-500' : 'border-[#A3A3A3] focus:border-text'
    }`
}

function selectClass(hasError: boolean) {
  return `w-full px-3.5 py-3 rounded-xl border text-sm outline-none bg-white transition-all appearance-none cursor-pointer placeholder:text-[#999] ${hasError ? 'border-rose-500' : 'border-[#A3A3A3] focus:border-text'
    }`
}
