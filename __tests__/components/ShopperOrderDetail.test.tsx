import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShopperOrderDetail } from '@/components/shopper/ShopperOrderDetail'
import type { ShopperOrder, ShopperProfile } from '@/lib/shopper-data'
import type { AppUserRole } from '@/lib/customer-role'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const shopper: ShopperProfile = {
  id: 'SHP-001',
  name: 'Aissata Traore',
  phone: '70 00 11 11',
  initials: 'AT',
  stats: {
    todayCompleted: 0,
    todayRevenue: 0,
    avgTime: '0 min',
    rating: 5,
  },
}

const order: ShopperOrder = {
  id: 'SGY-10001',
  status: 'PREPARING',
  createdAt: new Date('2026-04-25T10:00:00.000Z').toISOString(),
  client: {
    name: 'Client Test',
    phone: '73 03 46 03',
    quartier: 'ACI 2000',
  },
  address: 'Adresse test',
  payment: {
    method: 'Orange Money',
    status: 'Payé',
    amount: 17000,
  },
  items: [
    {
      id: 42,
      name: 'Mixeur Electrique Haley 500W',
      qty: 1,
      price: 17000,
      available: true,
    },
  ],
  livraison: {
    mode: 'Standard',
    frais: 1500,
  },
  assignedTo: 'SHP-001',
  notes: [],
  urgent: false,
}

describe('ShopperOrderDetail', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ order }),
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('envoie available=false quand on clique sur Marquer introuvable', async () => {
    render(
      <ShopperOrderDetail
        initialOrder={order}
        shopper={shopper}
        assignees={[]}
        currentUserRole={'SHOPPER' satisfies AppUserRole}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Marquer introuvable' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/shopper/orders/SGY-10001/items/42/availability',
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: false }),
      })
    )
  })

  it('envoie la note en POST', async () => {
    render(
      <ShopperOrderDetail
        initialOrder={order}
        shopper={shopper}
        assignees={[]}
        currentUserRole={'SHOPPER' satisfies AppUserRole}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Ajouter une note sur la disponibilité, le client ou la préparation...'), {
      target: { value: 'Client appelle avant remplacement' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter la note' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/shopper/orders/SGY-10001/notes',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Client appelle avant remplacement' }),
      })
    )
  })
})
