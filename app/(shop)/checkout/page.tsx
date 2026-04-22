'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { CartItem } from '@/lib/cart'
import { calcSubtotal } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { getDeliveryFee, QUARTIERS } from '@/lib/delivery'
import { isMalianPhone } from '@/lib/validate'
import { generateOrderNumber } from '@/lib/orders'

interface FormState {
  nom: string
  tel: string
  quartier: string
  indications: string
  livraison: 'standard' | 'express'
  payment: 'ORANGE_MONEY' | 'CASH_ON_DELIVERY'
  omTel: string
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
  const [form, setForm] = useState<FormState>({
    nom: '',
    tel: '',
    quartier: '',
    indications: '',
    livraison: 'standard',
    payment: 'ORANGE_MONEY',
    omTel: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    const raw = localStorage.getItem('suguly_cart')
    const items = raw ? JSON.parse(raw) : []
    if (items.length === 0) {
      router.replace('/panier')
      return
    }
    setCart(items)
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

  const handleConfirm = async () => {
    setSubmitting(true)
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

      if (res.ok) {
        const { order } = await res.json()
        localStorage.removeItem('suguly_cart')
        window.dispatchEvent(new Event('cart-updated'))
        localStorage.setItem(
          'suguly_last_order',
          JSON.stringify({ ...order, nom: form.nom, tel: form.tel })
        )
        router.push(`/confirmation/${order.orderNumber}`)
      } else {
        // Fallback: create a local order number for demo
        const orderNumber = generateOrderNumber()
        localStorage.removeItem('suguly_cart')
        window.dispatchEvent(new Event('cart-updated'))
        localStorage.setItem(
          'suguly_last_order',
          JSON.stringify({ orderNumber, nom: form.nom, tel: form.tel, total })
        )
        router.push(`/confirmation/${orderNumber}`)
      }
    } catch {
      // Offline fallback
      const orderNumber = generateOrderNumber()
      localStorage.removeItem('suguly_cart')
      window.dispatchEvent(new Event('cart-updated'))
      localStorage.setItem(
        'suguly_last_order',
        JSON.stringify({ orderNumber, nom: form.nom, tel: form.tel, total })
      )
      router.push(`/confirmation/${orderNumber}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0) return null

  return (
    <div className="max-w-screen-md mx-auto px-4 sm:px-8 py-6 sm:py-8">
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            {s > 1 && (
              <div className={`flex-1 h-0.5 w-12 ${step >= s ? 'bg-primary' : 'bg-bg-card'} transition-colors`} />
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold text-white transition-colors ${
                step >= s ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            <span className={`text-sm font-semibold ${step >= s ? 'text-text' : 'text-text-light'}`}>
              {s === 1 ? 'Livraison' : 'Paiement'}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form */}
        <div className="flex-1">
          {step === 1 && (
            <div>
              <h2 className="font-head text-xl font-extrabold mb-6">Coordonnées & Livraison</h2>

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
                <div className={`flex border-2 rounded-xl overflow-hidden ${errors.tel ? 'border-rose-500' : 'border-bg-card'}`}>
                  <span className="px-3.5 py-3 bg-bg border-r border-bg-card text-sm font-semibold text-text-light whitespace-nowrap">
                    +223
                  </span>
                  <input
                    type="tel"
                    value={form.tel}
                    onChange={(e) => { setF('tel', e.target.value); setErrors((er) => ({ ...er, tel: undefined })) }}
                    placeholder="76 54 32 10"
                    className="flex-1 px-3.5 py-3 bg-white text-sm outline-none"
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
              <div className="mb-5">
                <p className="text-sm font-bold mb-2.5">Mode de livraison</p>
                {([
                  ['standard', 'Standard', '24–48h', getDeliveryFee(form.quartier || 'Autre quartier', false)],
                  ['express', 'Express', '12–24h', getDeliveryFee(form.quartier || 'Autre quartier', true)],
                ] as [string, string, string, number][]).map(([id, label, delay, fee]) => (
                  <label
                    key={id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 mb-2 cursor-pointer transition-all ${
                      form.livraison === id ? 'border-primary bg-primary-light' : 'border-bg-card bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="livraison"
                      checked={form.livraison === id}
                      onChange={() => setF('livraison', id as 'standard' | 'express')}
                      className="accent-primary"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm">{label}</span>
                      <span className="text-text-light text-xs ml-1.5">· {delay}</span>
                    </div>
                    <span className="font-extrabold text-primary text-sm">{formatPrice(fee)}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={() => validateStep1() && setStep(2)}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-extrabold text-sm hover:bg-primary-dark transition-colors"
              >
                Continuer vers le paiement →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-head text-xl font-extrabold mb-6">Paiement</h2>

              {([
                ['ORANGE_MONEY', '🟠 Orange Money (prépaiement)', 'Paiement immédiat, commande traitée en priorité'],
                ['CASH_ON_DELIVERY', '💵 Paiement à la livraison', 'Payez en cash ou Orange Money à la réception'],
              ] as [string, string, string][]).map(([id, label, desc]) => (
                <label
                  key={id}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 mb-3 cursor-pointer transition-all ${
                    form.payment === id ? 'border-primary bg-primary-light' : 'border-bg-card bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={form.payment === id}
                    onChange={() => setF('payment', id as 'ORANGE_MONEY' | 'CASH_ON_DELIVERY')}
                    className="accent-primary mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-sm mb-0.5">{label}</p>
                    <p className="text-xs text-text-light">{desc}</p>
                  </div>
                </label>
              ))}

              {form.payment === 'ORANGE_MONEY' && (
                <div className="bg-[#fff8f0] border-2 border-primary rounded-xl p-4 mb-5">
                  <p className="text-sm font-bold mb-3">Votre numéro Orange Money</p>
                  <div className="flex border border-bg-card rounded-xl overflow-hidden bg-white">
                    <span className="px-3.5 py-3 bg-bg border-r border-bg-card text-sm font-bold text-[#FF6600]">OM</span>
                    <input
                      type="tel"
                      value={form.omTel}
                      onChange={(e) => setF('omTel', e.target.value)}
                      placeholder="76 54 32 10"
                      className="flex-1 px-3.5 py-3 text-sm outline-none"
                    />
                  </div>
                  <p className="text-xs text-text-light mt-2.5 leading-relaxed">
                    Vous recevrez un SMS de validation. Approuvez la transaction pour finaliser.
                  </p>
                </div>
              )}

              <div className="flex gap-2.5 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 bg-white border-2 border-bg-card rounded-xl font-bold text-sm hover:border-text-light transition-colors"
                >
                  ← Retour
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-primary text-white rounded-xl font-extrabold text-sm hover:bg-primary-dark disabled:opacity-60 transition-colors"
                >
                  {submitting ? 'Traitement...' : '✓ Confirmer ma commande'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order recap */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl p-5 shadow-sm sticky top-24">
            <h3 className="font-head font-extrabold text-sm mb-4">Votre commande</h3>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center mb-2.5 gap-2">
                <span className="text-xs text-text flex-1 leading-snug">
                  {item.title} <span className="text-text-light">×{item.quantity}</span>
                </span>
                <span className="text-xs font-bold flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-bg-card pt-3 mt-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-light">Livraison</span>
                <span className="font-semibold">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-base">
                <span>Total</span>
                <span className="text-primary font-head">{formatPrice(total)}</span>
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
    <div className="mb-4">
      <label className="block text-sm font-bold mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-600 font-semibold">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return `w-full px-3.5 py-3 rounded-xl border-2 text-sm outline-none bg-white ${
    hasError ? 'border-rose-500' : 'border-bg-card focus:border-primary'
  } transition-colors`
}

function selectClass(hasError: boolean) {
  return `w-full px-3.5 py-3 rounded-xl border-2 text-sm outline-none bg-white ${
    hasError ? 'border-rose-500' : 'border-bg-card focus:border-primary'
  } transition-colors`
}
