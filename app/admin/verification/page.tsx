'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/format'

type VerificationStatus = 'PENDING' | 'WAITING_DOCS' | 'DOCS_RECEIVED' | 'APPROVED' | 'REJECTED'

interface BusinessVerification {
  id: number
  businessName: string
  ownerName: string
  phone: string
  quartier: string | null
  description: string | null
  status: VerificationStatus
  whatsappSentAt: string | null
  docsReceivedAt: string | null
  resolvedAt: string | null
  adminNote: string | null
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG: Record<VerificationStatus, { label: string; color: string; icon: string }> = {
  PENDING:       { label: 'Non traitée',            color: 'bg-gray-100 text-gray-600',       icon: '⏳' },
  WAITING_DOCS:  { label: 'En attente justificatif', color: 'bg-amber-100 text-amber-700',     icon: '📲' },
  DOCS_RECEIVED: { label: 'Documents reçus',         color: 'bg-blue-100 text-blue-700',       icon: '📄' },
  APPROVED:      { label: 'Approuvée',               color: 'bg-emerald-100 text-emerald-700', icon: '✅' },
  REJECTED:      { label: 'Rejetée',                 color: 'bg-rose-100 text-rose-700',       icon: '❌' },
}

const STATUS_ORDER: VerificationStatus[] = ['PENDING', 'WAITING_DOCS', 'DOCS_RECEIVED', 'APPROVED', 'REJECTED']

const FILTER_LABELS: Record<string, string> = {
  all:           'Toutes',
  PENDING:       'Non traitées',
  WAITING_DOCS:  'En attente',
  DOCS_RECEIVED: 'Docs reçus',
  APPROVED:      'Approuvées',
  REJECTED:      'Rejetées',
}

export default function VerificationPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<BusinessVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<BusinessVerification | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [updating, setUpdating] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newForm, setNewForm] = useState({ businessName: '', ownerName: '', phone: '', quartier: '', description: '' })
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/verification')
      if (res.status === 403) { router.replace('/compte'); return }
      const data = await res.json()
      setRequests(data.requests)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: number, status: VerificationStatus, adminNote?: string) => {
    setUpdating(true)
    try {
      await fetch(`/api/admin/verification/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote }),
      })
      await load()
      if (selected?.id === id) {
        setSelected((prev) => prev ? { ...prev, status, adminNote: adminNote ?? prev.adminNote } : null)
      }
    } finally {
      setUpdating(false)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    try {
      await fetch('/api/admin/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      })
      setNewForm({ businessName: '', ownerName: '', phone: '', quartier: '', description: '' })
      setShowAddForm(false)
      await load()
    } finally {
      setAdding(false)
    }
  }

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  const counts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = requests.filter((r) => r.status === s).length
    return acc
  }, {})
  const actionable = (counts.PENDING ?? 0) + (counts.DOCS_RECEIVED ?? 0)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-head text-2xl font-extrabold">Vérifications entreprises</h1>
          {actionable > 0 && (
            <p className="text-sm text-amber-600 font-semibold mt-0.5">
              {actionable} demande{actionable > 1 ? 's' : ''} nécessitent une action
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors"
        >
          + Nouvelle demande
        </button>
      </div>

      {/* Status summary chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', ...STATUS_ORDER] as string[]).map((s) => {
          const count = s === 'all' ? requests.length : (counts[s] ?? 0)
          const cfg = s !== 'all' ? STATUS_CONFIG[s as VerificationStatus] : null
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                filter === s
                  ? 'border-primary bg-primary text-white'
                  : 'border-bg-card bg-white text-text hover:border-primary hover:text-primary'
              }`}
            >
              {cfg?.icon} {FILTER_LABELS[s]}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${filter === s ? 'bg-white/20' : 'bg-bg-card'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-text-light">
          <p className="font-semibold">Aucune demande dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((req) => {
            const cfg = STATUS_CONFIG[req.status]
            return (
              <div
                key={req.id}
                onClick={() => { setSelected(req); setNoteInput(req.adminNote ?? '') }}
                className="bg-white rounded-xl px-5 py-4 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-sm">{req.businessName}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-text-light">
                    {req.ownerName} · {req.phone}
                    {req.quartier && ` · ${req.quartier}`}
                  </p>
                  {req.status === 'WAITING_DOCS' && req.whatsappSentAt && (
                    <p className="text-xs text-amber-600 mt-0.5 font-semibold">
                      📲 WhatsApp envoyé le {formatDate(req.whatsappSentAt)}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-text-light">{formatDate(req.createdAt)}</p>
                  {/* Quick action button */}
                  {req.status === 'PENDING' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateStatus(req.id, 'WAITING_DOCS') }}
                      disabled={updating}
                      className="mt-1.5 px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      📲 WhatsApp envoyé
                    </button>
                  )}
                  {req.status === 'WAITING_DOCS' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateStatus(req.id, 'DOCS_RECEIVED') }}
                      disabled={updating}
                      className="mt-1.5 px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      📄 Docs reçus
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-head font-extrabold text-lg">{selected.businessName}</h2>
                <p className="text-sm text-text-light">{selected.ownerName} · {selected.phone}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-text-light text-xl leading-none">×</button>
            </div>

            {/* Status timeline */}
            <div className="mb-5">
              <p className="text-xs font-bold text-text-light uppercase tracking-wide mb-2">Statut actuel</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_ORDER.map((s) => {
                  const cfg = STATUS_CONFIG[s]
                  const isCurrent = selected.status === s
                  return (
                    <button
                      key={s}
                      onClick={() => !isCurrent && updateStatus(selected.id, s, noteInput || undefined)}
                      disabled={isCurrent || updating}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? `${cfg.color} ring-2 ring-offset-1 ring-current`
                          : 'bg-bg-card text-text-light hover:bg-bg cursor-pointer'
                      }`}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-5 text-sm">
              {selected.quartier && (
                <div className="flex gap-2"><span className="text-text-light w-28">Quartier</span><span>{selected.quartier}</span></div>
              )}
              {selected.description && (
                <div className="flex gap-2"><span className="text-text-light w-28">Description</span><span className="flex-1">{selected.description}</span></div>
              )}
              <div className="flex gap-2"><span className="text-text-light w-28">Demande créée</span><span>{formatDate(selected.createdAt)}</span></div>
              {selected.whatsappSentAt && (
                <div className="flex gap-2"><span className="text-text-light w-28">WhatsApp envoyé</span><span className="text-amber-600 font-semibold">{formatDate(selected.whatsappSentAt)}</span></div>
              )}
              {selected.docsReceivedAt && (
                <div className="flex gap-2"><span className="text-text-light w-28">Docs reçus</span><span className="text-blue-600 font-semibold">{formatDate(selected.docsReceivedAt)}</span></div>
              )}
              {selected.resolvedAt && (
                <div className="flex gap-2"><span className="text-text-light w-28">Résolu</span><span>{formatDate(selected.resolvedAt)}</span></div>
              )}
            </div>

            {/* Admin note */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-text-light uppercase tracking-wide mb-1.5">Note interne</label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                rows={3}
                placeholder="Ajouter une note..."
                className="w-full px-3 py-2.5 border-2 border-bg-card rounded-xl text-sm outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {selected.status === 'PENDING' && (
                <button
                  onClick={() => updateStatus(selected.id, 'WAITING_DOCS', noteInput || undefined)}
                  disabled={updating}
                  className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  📲 WhatsApp envoyé — En attente
                </button>
              )}
              {selected.status === 'WAITING_DOCS' && (
                <button
                  onClick={() => updateStatus(selected.id, 'DOCS_RECEIVED', noteInput || undefined)}
                  disabled={updating}
                  className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  📄 Documents reçus
                </button>
              )}
              {selected.status === 'DOCS_RECEIVED' && (
                <>
                  <button
                    onClick={() => updateStatus(selected.id, 'APPROVED', noteInput || undefined)}
                    disabled={updating}
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    ✅ Approuver
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, 'REJECTED', noteInput || undefined)}
                    disabled={updating}
                    className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-colors disabled:opacity-50"
                  >
                    ❌ Rejeter
                  </button>
                </>
              )}
              {noteInput !== (selected.adminNote ?? '') && (
                <button
                  onClick={() => updateStatus(selected.id, selected.status, noteInput)}
                  disabled={updating}
                  className="px-4 py-2.5 bg-bg-card text-text rounded-xl font-bold text-sm hover:bg-bg transition-colors disabled:opacity-50"
                >
                  Sauvegarder note
                </button>
              )}
            </div>

            <a
              href={`https://wa.me/223${selected.phone.replace(/\s/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Ouvrir WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Add form modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-head font-extrabold text-lg mb-5">Nouvelle demande</h2>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <input
                required
                value={newForm.businessName}
                onChange={(e) => setNewForm((f) => ({ ...f, businessName: e.target.value }))}
                placeholder="Nom de l'entreprise *"
                className="w-full px-3.5 py-3 border-2 border-bg-card rounded-xl text-sm outline-none focus:border-primary"
              />
              <input
                required
                value={newForm.ownerName}
                onChange={(e) => setNewForm((f) => ({ ...f, ownerName: e.target.value }))}
                placeholder="Nom du propriétaire *"
                className="w-full px-3.5 py-3 border-2 border-bg-card rounded-xl text-sm outline-none focus:border-primary"
              />
              <input
                required
                value={newForm.phone}
                onChange={(e) => setNewForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Téléphone (WhatsApp) *"
                className="w-full px-3.5 py-3 border-2 border-bg-card rounded-xl text-sm outline-none focus:border-primary"
              />
              <input
                value={newForm.quartier}
                onChange={(e) => setNewForm((f) => ({ ...f, quartier: e.target.value }))}
                placeholder="Quartier"
                className="w-full px-3.5 py-3 border-2 border-bg-card rounded-xl text-sm outline-none focus:border-primary"
              />
              <textarea
                value={newForm.description}
                onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (optionnel)"
                rows={2}
                className="w-full px-3.5 py-3 border-2 border-bg-card rounded-xl text-sm outline-none focus:border-primary resize-none"
              />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-3 bg-bg-card rounded-xl font-bold text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={adding} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark disabled:opacity-50">
                  {adding ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
