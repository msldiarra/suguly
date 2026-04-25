'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  formatCFA,
  timeAgo,
  type ShopperOrder,
  type ShopperProfile,
} from '@/lib/shopper-data'
import type { AppUserRole } from '@/lib/customer-role'
import { ShopperStatusBadge } from './ShopperStatusBadge'

type DashboardFilter = 'active' | 'new' | 'mine' | 'done'
type AdminQuickFilter = 'all' | 'unassigned' | 'urgent' | 'incident' | 'new' | 'preparing'

function paymentBadge(status: ShopperOrder['payment']['status']) {
  if (status === 'Payé') return 'bg-[#F2F6F2] text-[#4D6A54] border border-[#D7E3D8]'
  if (status === 'Annulé') return 'bg-[#FBF1F1] text-[#A35B5B] border border-[#E8D3D3]'
  return 'bg-[#F7F4EE] text-[#7A6C5D] border border-[#E2D7CB]'
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex-1 min-w-[88px] rounded-xl border border-[#D1D1D1] bg-white px-4 py-3">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-text-light">{label}</p>
      <p className="font-head text-lg font-semibold text-text" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
    </div>
  )
}

function OrderCard({ order }: { order: ShopperOrder }) {
  const ageMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0)
  const isActive = ['NEW', 'PREPARING', 'READY', 'DELIVERING'].includes(order.status)
  const hasUnavailableItem = order.items.some((item) => !item.available)

  return (
    <Link
      href={`/shopper/commande/${order.id}`}
      className={[
        'block rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md',
        order.urgent && isActive ? 'border-[#E5C9C9]' : 'border-[#D1D1D1]',
      ].join(' ')}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {(order.urgent || ageMinutes >= 30) && (
            <span
              className={[
                'h-2.5 w-2.5 rounded-full flex-shrink-0',
                order.urgent ? 'bg-[#C07A6C] shadow-[0_0_0_4px_rgba(192,122,108,0.12)]' : 'bg-[#C7A572]',
              ].join(' ')}
            />
          )}
          <span className="truncate font-head text-sm font-semibold text-text">{order.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShopperStatusBadge status={order.status} small />
          <span className="text-[11px] font-semibold text-text-light">{timeAgo(order.createdAt)}</span>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">{order.client.name}</p>
          <p className="text-xs text-text-light">{order.client.quartier}</p>
        </div>
        <div className="text-right">
          <p className="font-head text-sm font-semibold text-text">{formatCFA(order.payment.amount)}</p>
          <p className="text-[11px] text-text-light">
            {itemCount} article{itemCount > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${paymentBadge(order.payment.status)}`}>
          {order.payment.status}
        </span>
        <span className="text-[11px] font-semibold text-text-light">
          {order.payment.method === 'Orange Money' ? 'OM' : 'Cash'}
        </span>
        {order.livraison.mode === 'Express' && (
          <span className="rounded-full border border-[#DDD6CC] bg-[#F3F0EA] px-2.5 py-1 text-[10px] font-bold text-[#6B6256]">Express</span>
        )}
        {order.assignedTo && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.08em] text-text-light">Assignée</span>
        )}
        {!order.assignedTo && (
          <span className="ml-auto rounded-full border border-[#D5E2DA] bg-[#EEF4F0] px-2.5 py-1 text-[10px] font-bold text-primary">
            Non assignée
          </span>
        )}
        {hasUnavailableItem && (
          <span className="rounded-full border border-[#E8D3D3] bg-[#FBF1F1] px-2.5 py-1 text-[10px] font-bold text-[#A35B5B]">
            Incident produit
          </span>
        )}
      </div>
    </Link>
  )
}

export function ShopperDashboard({
  orders: initialOrders,
  shopper: initialShopper,
  heading = 'Espace shopper',
  navigationLabel = 'Commandes, tâches et compte shopper',
  primaryHref = '/shopper',
  primaryLabel = 'Commandes',
  currentUserRole = 'SHOPPER',
}: {
  orders: ShopperOrder[]
  shopper: ShopperProfile
  heading?: string
  navigationLabel?: string
  primaryHref?: string
  primaryLabel?: string
  currentUserRole?: AppUserRole
}) {
  const [orders, setOrders] = useState(initialOrders)
  const [shopper, setShopper] = useState(initialShopper)
  const [filter, setFilter] = useState<DashboardFilter>('active')
  const [search, setSearch] = useState('')
  const [adminQuickFilter, setAdminQuickFilter] = useState<AdminQuickFilter>('all')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const isAdminView = currentUserRole === 'ADMIN'

  useEffect(() => {
    setOrders(initialOrders)
    setShopper(initialShopper)
  }, [initialOrders, initialShopper])

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const res = await fetch('/api/shopper/orders', { cache: 'no-store' })
        const data = await res.json()
        if (res.ok && data.orders && data.shopper) {
          setOrders(data.orders)
          setShopper(data.shopper)
          setLastUpdated(new Date().toISOString())
        }
      } catch {
        // Silent fail: polling is best-effort for the pilot.
      }
    }, 20000)

    return () => window.clearInterval(interval)
  }, [])

  const counts = useMemo(() => {
    const activeStatuses = ['NEW', 'PREPARING', 'READY', 'DELIVERING']
    return {
      newCount: orders.filter((o) => o.status === 'NEW').length,
      activeCount: orders.filter((o) => activeStatuses.includes(o.status)).length,
      mineCount: orders.filter((o) => o.assignedTo === shopper.id && !['DELIVERED', 'CANCELLED'].includes(o.status)).length,
      doneCount: orders.filter((o) => ['DELIVERED', 'CANCELLED'].includes(o.status)).length,
      unassignedCount: orders.filter((o) => !o.assignedTo && activeStatuses.includes(o.status)).length,
      urgentCount: orders.filter((o) => o.urgent && activeStatuses.includes(o.status)).length,
      incidentCount: orders.filter((o) => o.items.some((item) => !item.available) && activeStatuses.includes(o.status)).length,
      preparingCount: orders.filter((o) => o.status === 'PREPARING').length,
    }
  }, [orders, shopper.id])

  const filteredOrders = useMemo(() => {
    let result = orders
    if (filter === 'new') result = orders.filter((o) => o.status === 'NEW')
    else if (filter === 'mine') {
      result = orders.filter((o) => o.assignedTo === shopper.id && !['DELIVERED', 'CANCELLED'].includes(o.status))
    } else if (filter === 'done') {
      result = orders.filter((o) => ['DELIVERED', 'CANCELLED'].includes(o.status))
    } else {
      result = orders.filter((o) => ['NEW', 'PREPARING', 'READY', 'DELIVERING'].includes(o.status))
    }

    if (isAdminView) {
      if (adminQuickFilter === 'unassigned') {
        result = result.filter((o) => !o.assignedTo)
      } else if (adminQuickFilter === 'urgent') {
        result = result.filter((o) => o.urgent)
      } else if (adminQuickFilter === 'incident') {
        result = result.filter((o) => o.items.some((item) => !item.available))
      } else if (adminQuickFilter === 'new') {
        result = result.filter((o) => o.status === 'NEW')
      } else if (adminQuickFilter === 'preparing') {
        result = result.filter((o) => o.status === 'PREPARING')
      }
    }

    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter((o) => {
        const haystack = [
          o.id,
          o.client.name,
          o.client.phone,
          o.client.quartier,
          o.address,
          ...o.items.map((item) => item.name),
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(query)
      })
    }

    return [...result].sort((a, b) => {
      const aActive = ['NEW', 'PREPARING', 'READY', 'DELIVERING'].includes(a.status)
      const bActive = ['NEW', 'PREPARING', 'READY', 'DELIVERING'].includes(b.status)
      if (a.urgent && aActive && !(b.urgent && bActive)) return -1
      if (b.urgent && bActive && !(a.urgent && aActive)) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [adminQuickFilter, filter, isAdminView, orders, search, shopper.id])

  const tabs: Array<{ id: DashboardFilter; label: string; count: number }> = [
    { id: 'active', label: 'Actives', count: counts.activeCount },
    { id: 'new', label: 'Nouvelles', count: counts.newCount },
    { id: 'mine', label: 'Mes tâches', count: counts.mineCount },
    { id: 'done', label: 'Terminées', count: counts.doneCount },
  ]

  const adminFilters: Array<{ id: AdminQuickFilter; label: string; count: number }> = [
    { id: 'all', label: 'Toutes', count: counts.activeCount },
    { id: 'unassigned', label: 'Non assignées', count: counts.unassignedCount },
    { id: 'urgent', label: 'Urgentes', count: counts.urgentCount },
    { id: 'incident', label: 'Incident produit', count: counts.incidentCount },
    { id: 'new', label: 'Nouvelles', count: counts.newCount },
    { id: 'preparing', label: 'Préparation', count: counts.preparingCount },
  ]

  return (
    <div className="max-w-screen-md mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium text-text-light">{heading}</p>
          <h1 className="font-head text-2xl font-semibold text-text">
            {shopper.name.split(' ')[0]}
          </h1>
        </div>
      </div>

      <div className="mb-4 text-right text-xs text-text-light">
        <span>{lastUpdated ? `Mis à jour ${timeAgo(lastUpdated)}` : 'Mise à jour auto toutes les 20s'}</span>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-none pb-1">
        <StatCard label="Aujourd'hui" value={shopper.stats.todayCompleted} accent="#7A9E8A" />
        <StatCard label="Revenus" value={formatCFA(shopper.stats.todayRevenue)} />
      </div>

      {counts.newCount > 0 && (
        <button
          onClick={() => setFilter('new')}
          className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-[#D5E2DA] bg-[#EEF4F0] px-4 py-3 text-left transition-colors hover:bg-[#E6EFE9]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-text text-sm font-bold text-white">
            {counts.newCount}
          </div>
          <div>
            <p className="text-sm font-bold text-text">
              {counts.newCount} nouvelle{counts.newCount > 1 ? 's' : ''} commande{counts.newCount > 1 ? 's' : ''}
            </p>
            <p className="text-xs font-medium text-text-light">Appuyez pour prioriser</p>
          </div>
          <span className="ml-auto text-xl text-text-light">›</span>
        </button>
      )}

      <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {tabs.map((tab) => {
          const active = filter === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={[
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                active ? 'bg-text text-white' : 'border border-[#D1D1D1] bg-white text-text hover:border-text',
              ].join(' ')}
            >
              {tab.label}
              <span
                className={[
                  'rounded-full px-2 py-0.5 text-[11px] font-bold',
                  active ? 'bg-white/15 text-white' : 'bg-[#F7F7F8] text-text-light',
                ].join(' ')}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {isAdminView && (
        <>
          <div className="mb-4">
            <label htmlFor="admin-order-search" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-text-light">
              Recherche
            </label>
            <input
              id="admin-order-search"
              type="text"
              autoComplete="off"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Commande, client, téléphone, quartier, produit"
              className="w-full rounded-2xl border border-[#D1D1D1] bg-white px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-[#9A948A] focus:border-text"
            />
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {adminFilters.map((tab) => {
              const active = adminQuickFilter === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminQuickFilter(tab.id)}
                  className={[
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                    active ? 'bg-text text-white' : 'border border-[#D1D1D1] bg-white text-text hover:border-text',
                  ].join(' ')}
                >
                  {tab.label}
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-[11px] font-bold',
                      active ? 'bg-white/15 text-white' : 'bg-[#F7F7F8] text-text-light',
                    ].join(' ')}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}

      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D1D1D1] bg-[#F7F7F8] px-5 py-16 text-center">
            <p className="mb-1 text-sm font-semibold text-text-light">Aucune commande ici</p>
            <p className="text-xs text-[#9A948A]">Les nouvelles commandes apparaîtront dès qu’elles seront créées.</p>
          </div>
        ) : (
          filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-[#D1D1D1] bg-white px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-light">Navigation</p>
          <p className="text-sm font-semibold text-text">{navigationLabel}</p>
        </div>
        <div className="flex gap-2">
          <Link href={primaryHref} className="rounded-full bg-text px-3 py-2 text-xs font-bold text-white">
            {primaryLabel}
          </Link>
          <Link href="/compte" className="rounded-full border border-[#D1D1D1] px-3 py-2 text-xs font-bold text-text">
            Profil
          </Link>
        </div>
      </div>
    </div>
  )
}
