'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatDate } from '@/lib/format'
import {
  formatCFA,
  timeAgo,
  type ShopperAssignee,
  type ShopperOrder,
  type ShopperOrderStatus,
  type ShopperProfile,
} from '@/lib/shopper-data'
import type { AppUserRole } from '@/lib/customer-role'
import { ShopperStatusBadge } from './ShopperStatusBadge'

const NEXT_ACTIONS: Partial<Record<ShopperOrderStatus, { label: string; next: ShopperOrderStatus; tone: string }>> = {
  NEW: { label: 'Passer en préparation', next: 'PREPARING', tone: 'bg-text hover:bg-black' },
  PREPARING: { label: 'Commande prête', next: 'READY', tone: 'bg-text hover:bg-black' },
  READY: { label: 'Lancer la livraison', next: 'DELIVERING', tone: 'bg-text hover:bg-black' },
  DELIVERING: { label: 'Confirmer la livraison', next: 'DELIVERED', tone: 'bg-text hover:bg-black' },
}

function paymentBadge(status: ShopperOrder['payment']['status']) {
  if (status === 'Payé') return 'bg-[#F2F6F2] text-[#4D6A54] border border-[#D7E3D8]'
  if (status === 'Annulé') return 'bg-[#FBF1F1] text-[#A35B5B] border border-[#E8D3D3]'
  return 'bg-[#F7F4EE] text-[#7A6C5D] border border-[#E2D7CB]'
}

export function ShopperOrderDetail({
  initialOrder,
  shopper,
  assignees,
  currentUserRole,
}: {
  initialOrder: ShopperOrder
  shopper: ShopperProfile
  assignees: ShopperAssignee[]
  currentUserRole: AppUserRole
}) {
  const [order, setOrder] = useState(initialOrder)
  const [noteText, setNoteText] = useState('')
  const [showAssignPanel, setShowAssignPanel] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')
  const action = NEXT_ACTIONS[order.status]
  const isAssignedToMe = order.assignedTo === shopper.id
  const canOperate = !['DELIVERED', 'CANCELLED'].includes(order.status)
  const assignLabel = currentUserRole === 'ADMIN' ? 'M’assigner temporairement' : 'M’assigner'
  const assignedShopper = assignees.find((candidate) => candidate.id === order.assignedTo) ?? null

  async function sendOrderAction(url: string, body: object, method: 'PATCH' | 'POST' = 'PATCH') {
    setSubmitting(true)
    setActionError('')
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const raw = await res.text()
      const data = raw ? JSON.parse(raw) : {}
      if (!res.ok) {
        throw new Error(data.error || 'Action impossible')
      }
      if (data.order) {
        setOrder(data.order as ShopperOrder)
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Action impossible')
    } finally {
      setSubmitting(false)
    }
  }

  async function assignToMe() {
    await sendOrderAction(`/api/shopper/orders/${order.id}/assign`, {
      shopperId: Number(shopper.id.replace('SHP-', '')),
    })
  }

  async function assignToShopper(target: ShopperAssignee) {
    await sendOrderAction(`/api/shopper/orders/${order.id}/assign`, {
      shopperId: Number(target.id.replace('SHP-', '')),
    })
    setShowAssignPanel(false)
  }

  async function goNext() {
    if (!action) return
    await sendOrderAction(`/api/shopper/orders/${order.id}/status`, { status: action.next })
  }

  async function cancelOrder() {
    await sendOrderAction(`/api/shopper/orders/${order.id}/status`, { status: 'CANCELLED' })
  }

  async function addNote() {
    if (!noteText.trim()) return
    await sendOrderAction(`/api/shopper/orders/${order.id}/notes`, { text: noteText.trim() }, 'POST')
    setNoteText('')
  }

  async function toggleAvailability(itemId: number, available: boolean) {
    await sendOrderAction(`/api/shopper/orders/${order.id}/items/${itemId}/availability`, { available })
  }

  return (
    <div className="max-w-screen-md mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/shopper" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D1D1D1] bg-white text-xl text-text transition-colors hover:bg-[#F7F7F8]">
          ‹
        </Link>
        <div className="min-w-0">
          <p className="font-head text-lg font-semibold text-text">{order.id}</p>
          <p className="text-xs text-text-light">
            Créée le {formatDate(order.createdAt)} · {timeAgo(order.createdAt)}
          </p>
        </div>
        <div className="ml-auto">
          <ShopperStatusBadge status={order.status} />
        </div>
      </div>

      {order.urgent && !['DELIVERED', 'CANCELLED'].includes(order.status) && (
        <div className="mb-4 rounded-2xl border border-[#E5C9C9] bg-[#FBF1F1] px-4 py-3">
          <p className="text-sm font-bold text-[#8F5D57]">Commande urgente</p>
          <p className="text-xs text-[#A4756A]">Priorité haute sur cette commande.</p>
        </div>
      )}

      <div className="mb-4 rounded-2xl border border-[#D1D1D1] bg-white p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text">{order.client.name}</p>
            <p className="text-xs text-text-light">{order.client.phone}</p>
          </div>
          <a
            href={`https://wa.me/223${order.client.phone.replace(/\s/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[#D1D1D1] bg-white px-3 py-2 text-xs font-bold text-text transition-colors hover:bg-[#F7F7F8]"
          >
            WhatsApp
          </a>
        </div>

        <div className="rounded-xl bg-[#F7F7F8] px-4 py-3">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-text-light">Livraison</p>
          <p className="text-sm font-semibold text-text">
            {order.client.quartier} — {order.address}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-text-light">{order.livraison.mode}</span>
            {order.livraison.mode === 'Express' && (
              <span className="rounded-full border border-[#DDD6CC] bg-[#F3F0EA] px-2.5 py-1 text-[10px] font-bold text-[#6B6256]">Express</span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-[#D1D1D1] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-light">
            Articles ({order.items.reduce((sum, item) => sum + item.qty, 0)})
          </p>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${paymentBadge(order.payment.status)}`}>
            {order.payment.status}
          </span>
        </div>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.name} className="flex items-start justify-between gap-3 border-t border-[#EFEAE3] pt-3 first:border-t-0 first:pt-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">{item.name}</p>
                <p className="text-xs text-text-light">
                  Qté: {item.qty} × {formatCFA(item.price)}
                </p>
                {!item.available && (
                  <span className="mt-1 inline-flex rounded-full border border-[#E8D3D3] bg-[#FBF1F1] px-2.5 py-1 text-[10px] font-bold text-[#A35B5B]">
                    Introuvable
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="whitespace-nowrap text-sm font-bold text-text">
                  {formatCFA(item.price * item.qty)}
                </span>
                {order.status === 'PREPARING' && (
                  <button
                    onClick={() => toggleAvailability(item.id, !item.available)}
                    disabled={submitting}
                    className={[
                      'rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors disabled:opacity-60',
                      item.available
                        ? 'border border-[#E8D3D3] bg-[#FBF1F1] text-[#A35B5B]'
                        : 'border border-[#D1D1D1] bg-[#F7F7F8] text-text',
                    ].join(' ')}
                  >
                    {item.available ? 'Marquer introuvable' : 'Remettre disponible'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-[#D1D1D1] bg-white p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-light">Opérations</p>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#F7F7F8] px-3 py-1.5 text-xs font-semibold text-text-light">
            Paiement: {order.payment.method}
          </span>
          <span className="rounded-full bg-[#F7F7F8] px-3 py-1.5 text-xs font-semibold text-text-light">
            Total: {formatCFA(order.payment.amount)}
          </span>
          <span className="rounded-full bg-[#F7F7F8] px-3 py-1.5 text-xs font-semibold text-text-light">
            Assignée: {order.assignedTo ? 'Oui' : 'Non'}
          </span>
          {order.assignedTo === shopper.id && (
            <span className="rounded-full border border-[#D5E2DA] bg-[#EEF4F0] px-3 py-1.5 text-xs font-semibold text-primary">
              Sur votre file
            </span>
          )}
          {assignedShopper && order.assignedTo !== shopper.id && (
            <span className="rounded-full border border-[#D1D1D1] bg-[#F7F7F8] px-3 py-1.5 text-xs font-semibold text-text">
              {assignedShopper.name}
            </span>
          )}
        </div>

        {canOperate && currentUserRole === 'ADMIN' && (
          <button
            onClick={() => setShowAssignPanel((open) => !open)}
            className="mb-2 w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3 text-sm font-bold text-text transition-colors hover:bg-[#F7F7F8]"
          >
            {showAssignPanel ? 'Fermer l’assignation' : 'Assigner à un shopper'}
          </button>
        )}

        {showAssignPanel && currentUserRole === 'ADMIN' && canOperate && (
          <div className="mb-3 rounded-xl border border-[#D1D1D1] bg-[#FAF9F6] p-3">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-text-light">Choisir un shopper</p>
            <div className="space-y-2">
              {assignees.map((candidate) => {
                const active = candidate.id === order.assignedTo
                return (
                  <button
                    key={candidate.id}
                    onClick={() => assignToShopper(candidate)}
                    disabled={submitting}
                    className={[
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors disabled:opacity-60',
                      active
                        ? 'border-[#D1D1D1] bg-[#F7F7F8]'
                        : 'border-[#E9E3DA] bg-white hover:border-text',
                    ].join(' ')}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-text text-xs font-bold text-white">
                      {candidate.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text">{candidate.name}</p>
                      <p className="text-xs text-text-light">
                        {candidate.phone} · {candidate.activeOrders} commande{candidate.activeOrders > 1 ? 's' : ''} active{candidate.activeOrders > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span
                      className={[
                        'rounded-full px-2.5 py-1 text-[10px] font-bold',
                        active ? 'bg-text text-white' : 'bg-[#F7F7F8] text-text-light',
                      ].join(' ')}
                    >
                      {active ? 'Assignée' : 'Assigner'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {canOperate && !order.assignedTo && currentUserRole !== 'ADMIN' && (
          <button
            onClick={assignToMe}
            className="mb-2 w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3 text-sm font-bold text-text transition-colors hover:bg-[#F7F7F8]"
          >
            {assignLabel}
          </button>
        )}

        {canOperate && (
          <p className="mb-3 text-xs text-text-light">
            {currentUserRole === 'ADMIN'
              ? 'En tant qu’admin, vous pouvez l’assigner à un shopper précis. Le changement de statut fait avancer le traitement.'
              : order.assignedTo
                ? 'L’assignation réserve cette commande à une personne. Le changement de statut fait avancer le traitement.'
                : 'Vous pouvez d’abord vous assigner la commande, ou la faire avancer directement si vous commencez le traitement.'}
          </p>
        )}

        {action && (
          <button
            onClick={goNext}
            disabled={submitting}
            className={`mb-3 w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors disabled:opacity-60 ${action.tone}`}
          >
            {action.label}
          </button>
        )}

        {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
          <button
            onClick={cancelOrder}
            disabled={submitting}
            className="w-full rounded-xl border border-[#E8D3D3] bg-[#FBF1F1] px-4 py-3 text-sm font-bold text-[#A35B5B] transition-colors hover:bg-[#F7EAEA] disabled:opacity-60"
          >
            Annuler la commande
          </button>
        )}

        {actionError && (
          <div className="mt-3 rounded-xl border border-[#E8D3D3] bg-[#FBF1F1] px-4 py-3 text-sm font-medium text-[#8F5D57]">
            {actionError}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#D1D1D1] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-light">Notes shopper</p>
          {order.assignedTo === shopper.id && (
            <span className="text-xs font-semibold text-primary">Assignée à vous</span>
          )}
        </div>

        <div className="mb-4 space-y-3">
          {order.notes.length === 0 ? (
            <div className="rounded-xl bg-[#F7F7F8] px-4 py-5 text-center text-sm text-text-light">
              Aucune note opérationnelle pour cette commande.
            </div>
          ) : (
            order.notes.map((note) => (
              <div key={note.id} className="rounded-xl bg-[#F7F7F8] px-4 py-3">
                <p className="mb-1 text-sm font-medium text-text">{note.text}</p>
                <p className="text-[11px] font-semibold text-text-light">
                  {note.authorName ? `${note.authorName} · ` : ''}{timeAgo(note.time)}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Ajouter une note sur la disponibilité, le client ou la préparation..."
            rows={3}
            className="w-full rounded-xl border border-[#D1D1D1] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#999] focus:border-text"
          />
          <button
            onClick={addNote}
            disabled={submitting}
            className="rounded-xl bg-text px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-black"
          >
            Ajouter la note
          </button>
        </div>
      </div>
    </div>
  )
}
