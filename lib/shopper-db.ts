import { prisma } from './db'
import { isValidStatusTransition } from './orders'
import type { AppUserRole } from './customer-role'
import type { ShopperAssignee, ShopperOrder, ShopperProfile } from './shopper-data'

interface OrderRow {
  orderId: number
  orderNumber: string
  customerId: number | null
  customerName: string | null
  customerPhone: string | null
  guestName: string | null
  guestPhone: string | null
  quartier: string
  address: string | null
  deliveryFee: number
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
  assignedShopperId: number | null
}

interface OrderItemRow {
  id: number
  orderNumber: string
  title: string
  quantity: number
  unitPrice: number
  available: number
}

interface OrderNoteRow {
  orderNumber: string
  noteId: number
  body: string
  createdAt: string
  authorName: string | null
}

interface ShopperRow {
  id: number
  name: string | null
  phone: string
}

function initialsFromName(name: string) {
  const cleanedInitials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => {
      const cleaned = part.replace(/[^A-Za-z0-9]/g, '')
      return cleaned[0]?.toUpperCase() ?? ''
    })
    .filter(Boolean)
    .join('')

  if (cleanedInitials) return cleanedInitials

  const digits = name.replace(/\D/g, '')
  if (digits.length >= 2) return digits.slice(-2)

  return 'SG'
}

function normalizePaymentMethod(method: string): ShopperOrder['payment']['method'] {
  return method === 'ORANGE_MONEY' ? 'Orange Money' : 'À la livraison'
}

function normalizePaymentStatus(status: string): ShopperOrder['payment']['status'] {
  if (status === 'PAID') return 'Payé'
  if (status === 'CANCELLED' || status === 'PAYMENT_FAILED') return 'Annulé'
  return 'En attente'
}

function isUrgent(row: OrderRow) {
  const ageMinutes = Math.floor((Date.now() - new Date(row.createdAt).getTime()) / 60000)
  const active = ['NEW', 'PREPARING', 'READY', 'DELIVERING'].includes(row.orderStatus)
  return active && (row.deliveryFee >= 3000 || ageMinutes >= 45)
}

export async function listShopperAssignees(): Promise<ShopperAssignee[]> {
  const rows = await prisma.$queryRaw<ShopperRow[]>`
    SELECT id, name, phone
    FROM "Customer"
    WHERE role = 'SHOPPER'
    ORDER BY COALESCE(name, phone) ASC
  `

  const workloadRows = await prisma.$queryRaw<Array<{ assignedShopperId: number; activeOrders: number }>>`
    SELECT "assignedShopperId", COUNT(*) as "activeOrders"
    FROM "Order"
    WHERE "assignedShopperId" IS NOT NULL
      AND "orderStatus" IN ('NEW', 'PREPARING', 'READY', 'DELIVERING')
    GROUP BY "assignedShopperId"
  `

  const workload = new Map(workloadRows.map((row) => [row.assignedShopperId, Number(row.activeOrders)]))

  return rows.map((row) => {
    const name = row.name?.trim() || row.phone
    return {
      id: `SHP-${row.id}`,
      name,
      phone: row.phone.replace(/^\+223/, ''),
      initials: initialsFromName(name),
      activeOrders: workload.get(row.id) ?? 0,
    }
  })
}

export async function getShopperProfile(customerId: number, fallbackName: string | null, phone: string): Promise<ShopperProfile> {
  const rows = await prisma.$queryRaw<Array<{ completed: number; revenue: number | null }>>`
    SELECT
      COUNT(CASE WHEN "orderStatus" = 'DELIVERED' AND DATE("updatedAt") = CURRENT_DATE THEN 1 END) as completed,
      SUM(CASE WHEN "orderStatus" = 'DELIVERED' AND DATE("updatedAt") = CURRENT_DATE THEN total - "deliveryFee" ELSE 0 END) as revenue
    FROM "Order"
    WHERE "assignedShopperId" = ${customerId}
  `

  const stats = rows[0] ?? { completed: 0, revenue: 0 }
  const name = fallbackName?.trim() || phone

  return {
    id: `SHP-${customerId}`,
    name,
    phone: phone.replace(/^\+223/, ''),
    initials: initialsFromName(name),
    stats: {
      todayCompleted: Number(stats.completed) || 0,
      todayRevenue: Number(stats.revenue) || 0,
      avgTime: '34 min',
      rating: 4.8,
    },
  }
}

export async function listShopperOrders(role: AppUserRole, currentUserId: number): Promise<ShopperOrder[]> {
  const rows = await prisma.$queryRaw<OrderRow[]>`
    SELECT
      o.id as "orderId",
      o."orderNumber",
      o."customerId",
      c.name as "customerName",
      c.phone as "customerPhone",
      o."guestName",
      o."guestPhone",
      o.quartier,
      o.address,
      o."deliveryFee",
      o.total,
      o."paymentMethod",
      o."paymentStatus",
      o."orderStatus",
      o."createdAt",
      o."assignedShopperId"
    FROM "Order" o
    LEFT JOIN "Customer" c ON c.id = o."customerId"
    ORDER BY o."createdAt" DESC
  `

  if (rows.length === 0) return []

  const orderNumbers = rows.map((row) => row.orderNumber)
  const itemRows = await prisma.$queryRawUnsafe<OrderItemRow[]>(
    `
      SELECT oi.id, o."orderNumber", p.title, oi.quantity, oi."unitPrice", oi.available
      FROM "OrderItem" oi
      INNER JOIN "Order" o ON o.id = oi."orderId"
      INNER JOIN "Product" p ON p.id = oi."productId"
      WHERE o."orderNumber" IN (${orderNumbers.map(() => '?').join(', ')})
      ORDER BY oi."orderId" ASC, oi.id ASC
    `,
    ...orderNumbers
  )

  const itemsByOrder = new Map<string, OrderItemRow[]>()
  for (const item of itemRows) {
    const bucket = itemsByOrder.get(item.orderNumber) ?? []
    bucket.push(item)
    itemsByOrder.set(item.orderNumber, bucket)
  }

  const noteRows = await prisma.$queryRawUnsafe<OrderNoteRow[]>(
    `
      SELECT o."orderNumber", n.id as "noteId", n.body, n."createdAt", c.name as "authorName"
      FROM "OrderNote" n
      INNER JOIN "Order" o ON o.id = n."orderId"
      LEFT JOIN "Customer" c ON c.id = n."authorId"
      WHERE o."orderNumber" IN (${orderNumbers.map(() => '?').join(', ')})
      ORDER BY n."createdAt" DESC, n.id DESC
    `,
    ...orderNumbers
  )

  const notesByOrder = new Map<string, OrderNoteRow[]>()
  for (const note of noteRows) {
    const bucket = notesByOrder.get(note.orderNumber) ?? []
    bucket.push(note)
    notesByOrder.set(note.orderNumber, bucket)
  }

  const visibleRows = role === 'SHOPPER'
    ? rows.filter((row) =>
        row.assignedShopperId === null ||
        row.assignedShopperId === currentUserId ||
        ['NEW', 'PREPARING', 'READY', 'DELIVERING'].includes(row.orderStatus)
      )
    : rows

  return visibleRows.map((row) => ({
    id: row.orderNumber,
    status: row.orderStatus as ShopperOrder['status'],
    createdAt: new Date(row.createdAt).toISOString(),
    client: {
      name: row.customerName?.trim() || row.guestName?.trim() || 'Client Suguly',
      phone: (row.customerPhone || row.guestPhone || '').replace(/^\+223/, ''),
      quartier: row.quartier,
    },
    address: row.address || 'Adresse non précisée',
    payment: {
      method: normalizePaymentMethod(row.paymentMethod),
      status: normalizePaymentStatus(row.paymentStatus),
      amount: row.total,
    },
    items: (itemsByOrder.get(row.orderNumber) ?? []).map((item) => ({
      id: item.id,
      name: item.title,
      qty: item.quantity,
      price: item.unitPrice,
      available: !!item.available,
    })),
    livraison: {
      mode: row.deliveryFee >= 3000 ? 'Express' : 'Standard',
      frais: row.deliveryFee,
    },
    assignedTo: row.assignedShopperId ? `SHP-${row.assignedShopperId}` : null,
    notes: (notesByOrder.get(row.orderNumber) ?? []).map((note) => ({
      id: note.noteId,
      text: note.body,
      time: new Date(note.createdAt).toISOString(),
      authorName: note.authorName,
    })),
    urgent: isUrgent(row),
  }))
}

export async function getShopperOrder(orderNumber: string, role: AppUserRole, currentUserId: number) {
  const orders = await listShopperOrders(role, currentUserId)
  return orders.find((order) => order.id === orderNumber) ?? null
}

export async function assignOrderToShopper(orderNumber: string, shopperCustomerId: number) {
  await prisma.$executeRaw`
    UPDATE "Order"
    SET "assignedShopperId" = ${shopperCustomerId}, "updatedAt" = CURRENT_TIMESTAMP
    WHERE "orderNumber" = ${orderNumber}
  `
}

async function getOrderNumericId(orderNumber: string) {
  const rows = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id
    FROM "Order"
    WHERE "orderNumber" = ${orderNumber}
    LIMIT 1
  `
  return rows[0]?.id ?? null
}

export async function addOrderNote(orderNumber: string, body: string, authorId: number) {
  const orderId = await getOrderNumericId(orderNumber)
  if (!orderId) throw new Error('ORDER_NOT_FOUND')

  await prisma.$executeRaw`
    INSERT INTO "OrderNote" ("orderId", "authorId", "body", "createdAt")
    VALUES (${orderId}, ${authorId}, ${body}, CURRENT_TIMESTAMP)
  `
}

export async function setOrderItemAvailability(orderNumber: string, itemId: number, available: boolean, authorId: number) {
  const rows = await prisma.$queryRaw<Array<{ orderId: number; title: string; available: number }>>`
    SELECT oi."orderId", p.title, oi.available
    FROM "OrderItem" oi
    INNER JOIN "Order" o ON o.id = oi."orderId"
    INNER JOIN "Product" p ON p.id = oi."productId"
    WHERE o."orderNumber" = ${orderNumber} AND oi.id = ${itemId}
    LIMIT 1
  `

  const item = rows[0]
  if (!item) throw new Error('ORDER_ITEM_NOT_FOUND')

  await prisma.$executeRaw`
    UPDATE "OrderItem"
    SET available = ${available ? 1 : 0}
    WHERE id = ${itemId}
  `

  const noteText = available
    ? `Article remis disponible: ${item.title}`
    : `Article marqué introuvable: ${item.title}`
  await addOrderNote(orderNumber, noteText, authorId)
}

export async function updateShopperOrderStatus(orderNumber: string, nextStatus: string, actingUserId: number, role: AppUserRole) {
  const rows = await prisma.$queryRaw<Array<{ orderStatus: string; assignedShopperId: number | null }>>`
    SELECT "orderStatus", "assignedShopperId"
    FROM "Order"
    WHERE "orderNumber" = ${orderNumber}
    LIMIT 1
  `

  const current = rows[0]
  if (!current) throw new Error('ORDER_NOT_FOUND')
  if (!isValidStatusTransition(current.orderStatus, nextStatus)) throw new Error('INVALID_STATUS_TRANSITION')
  if (role === 'SHOPPER' && current.assignedShopperId && current.assignedShopperId !== actingUserId) {
    throw new Error('ORDER_NOT_ASSIGNED_TO_USER')
  }

  await prisma.$executeRaw`
    UPDATE "Order"
    SET
      "orderStatus" = ${nextStatus},
      "assignedShopperId" = CASE
        WHEN "assignedShopperId" IS NULL AND ${nextStatus} = 'PREPARING' THEN ${actingUserId}
        ELSE "assignedShopperId"
      END,
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "orderNumber" = ${orderNumber}
  `
}
