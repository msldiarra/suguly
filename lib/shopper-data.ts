import { formatPrice } from './format'

export type ShopperOrderStatus =
  | 'NEW'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED'

export interface ShopperNote {
  id: number
  text: string
  time: string
  authorName?: string | null
}

export interface ShopperOrderItem {
  id: number
  name: string
  qty: number
  price: number
  available: boolean
}

export interface ShopperOrder {
  id: string
  status: ShopperOrderStatus
  createdAt: string
  client: {
    name: string
    phone: string
    quartier: string
  }
  address: string
  payment: {
    method: 'Orange Money' | 'À la livraison'
    status: 'Payé' | 'En attente' | 'Annulé'
    amount: number
  }
  items: ShopperOrderItem[]
  livraison: {
    mode: 'Standard' | 'Express'
    frais: number
  }
  assignedTo: string | null
  notes: ShopperNote[]
  urgent: boolean
}

export interface ShopperProfile {
  id: string
  name: string
  phone: string
  initials: string
  stats: {
    todayCompleted: number
    todayRevenue: number
    avgTime: string
    rating: number
  }
}

export interface ShopperAssignee {
  id: string
  name: string
  phone: string
  initials: string
  activeOrders: number
}

export const SHOPPER_STATUS_META: Record<
  ShopperOrderStatus,
  { label: string; className: string }
> = {
  NEW: { label: 'Nouvelle', className: 'bg-[#F7F7F8] text-text border border-[#D1D1D1]' },
  PREPARING: { label: 'En cours', className: 'bg-[#EEF4F0] text-primary border border-[#D5E2DA]' },
  READY: { label: 'Prête', className: 'bg-[#F4F1EB] text-[#695846] border border-[#DDD3C7]' },
  DELIVERING: { label: 'En livraison', className: 'bg-[#F3F0EA] text-[#6B6256] border border-[#DDD6CC]' },
  DELIVERED: { label: 'Livrée', className: 'bg-[#F2F6F2] text-[#4D6A54] border border-[#D7E3D8]' },
  CANCELLED: { label: 'Annulée', className: 'bg-[#FBF1F1] text-[#A35B5B] border border-[#E8D3D3]' },
}

export const SHOPPER_SAMPLE_PROFILE: ShopperProfile = {
  id: 'SHP-001',
  name: 'Abdoulaye Diallo',
  phone: '76 12 34 56',
  initials: 'AD',
  stats: { todayCompleted: 7, todayRevenue: 8750, avgTime: '34 min', rating: 4.8 },
}

export const SHOPPER_SAMPLE_ASSIGNEES: ShopperAssignee[] = [
  {
    id: 'SHP-001',
    name: 'Abdoulaye Diallo',
    phone: '76 12 34 56',
    initials: 'AD',
    activeOrders: 4,
  },
  {
    id: 'SHP-002',
    name: 'Aissata Traoré',
    phone: '67 40 11 22',
    initials: 'AT',
    activeOrders: 3,
  },
  {
    id: 'SHP-003',
    name: 'Mamadou Koné',
    phone: '74 88 09 31',
    initials: 'MK',
    activeOrders: 2,
  },
]

export const SHOPPER_SAMPLE_ORDERS: ShopperOrder[] = [
  {
    id: 'SGY-42891',
    status: 'NEW',
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    client: { name: 'Fatoumata Keita', phone: '78 90 12 34', quartier: 'Badalabougou' },
    address: 'Près du marché, 3e ruelle à droite, portail vert',
    payment: { method: 'Orange Money', status: 'Payé', amount: 42400 },
    items: [
      { id: 1, name: 'Écouteurs sans fil Bluetooth', qty: 2, price: 15900, available: true },
      { id: 2, name: 'Chargeur rapide USB-C 65W', qty: 1, price: 8500, available: true },
      { id: 3, name: 'Fil électrique multiprise 5m', qty: 1, price: 6800, available: true },
    ],
    livraison: { mode: 'Express', frais: 3000 },
    assignedTo: null,
    notes: [],
    urgent: true,
  },
  {
    id: 'SGY-42888',
    status: 'NEW',
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
    client: { name: 'Moussa Traoré', phone: '66 45 67 89', quartier: 'Hamdallaye' },
    address: 'ACI 2000, derrière la pharmacie Kènèya',
    payment: { method: 'À la livraison', status: 'En attente', amount: 28500 },
    items: [{ id: 4, name: 'Montre connectée Sport', qty: 1, price: 28500, available: true }],
    livraison: { mode: 'Standard', frais: 1500 },
    assignedTo: null,
    notes: [],
    urgent: false,
  },
  {
    id: 'SGY-42885',
    status: 'PREPARING',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    client: { name: 'Aminata Coulibaly', phone: '76 33 22 11', quartier: 'Kalaban-Coro' },
    address: 'Route de Koulikoro, face station Total, maison blanche 2 étages',
    payment: { method: 'Orange Money', status: 'Payé', amount: 35400 },
    items: [
      { id: 5, name: 'Robe Bogolan moderne', qty: 1, price: 12500, available: true },
      { id: 6, name: 'Sac à main cuir synthétique', qty: 1, price: 17500, available: true },
      { id: 7, name: 'Ceinture en cuir tressé', qty: 1, price: 6500, available: true },
    ],
    livraison: { mode: 'Standard', frais: 1500 },
    assignedTo: 'SHP-001',
    notes: [{ id: 1, text: 'Robe dispo en brun uniquement, cliente OK', time: new Date(Date.now() - 20 * 60000).toISOString() }],
    urgent: false,
  },
  {
    id: 'SGY-42880',
    status: 'PREPARING',
    createdAt: new Date(Date.now() - 55 * 60000).toISOString(),
    client: { name: 'Ibrahim Sanogo', phone: '69 88 77 66', quartier: 'Magnambougou' },
    address: 'Magnambougou Faso Kanu, près de la mosquée du vendredi',
    payment: { method: 'Orange Money', status: 'Payé', amount: 24700 },
    items: [
      { id: 8, name: 'Powerbank 20000 mAh', qty: 1, price: 19900, available: true },
      { id: 9, name: 'Ventilateur portable USB', qty: 1, price: 7200, available: true },
    ],
    livraison: { mode: 'Express', frais: 3000 },
    assignedTo: 'SHP-001',
    notes: [],
    urgent: true,
  },
  {
    id: 'SGY-42870',
    status: 'READY',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    client: { name: 'Mariam Diarra', phone: '78 11 22 33', quartier: 'Hippodrome' },
    address: 'Hippodrome, rue 305, porte 18',
    payment: { method: 'Orange Money', status: 'Payé', amount: 23300 },
    items: [
      { id: 10, name: 'Lampe LED rechargeable', qty: 2, price: 9800, available: true },
      { id: 11, name: 'Huile de coco pure 500ml', qty: 1, price: 5500, available: true },
    ],
    livraison: { mode: 'Standard', frais: 1500 },
    assignedTo: 'SHP-001',
    notes: [{ id: 2, text: '2 lampes blanches comme demandé', time: new Date(Date.now() - 40 * 60000).toISOString() }],
    urgent: false,
  },
  {
    id: 'SGY-42865',
    status: 'DELIVERING',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    client: { name: 'Oumar Sissoko', phone: '65 44 55 66', quartier: 'Niamakoro' },
    address: 'Niamakoro Cité UNICEF, bloc 12, apt 3',
    payment: { method: 'À la livraison', status: 'En attente', amount: 31500 },
    items: [
      { id: 12, name: 'Sneakers casual unisexe', qty: 1, price: 22000, available: true },
      { id: 13, name: 'Calculatrice scientifique', qty: 1, price: 9500, available: true },
    ],
    livraison: { mode: 'Standard', frais: 1500 },
    assignedTo: 'SHP-001',
    notes: [],
    urgent: false,
  },
  {
    id: 'SGY-42850',
    status: 'DELIVERED',
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    client: { name: 'Kadiatou Bah', phone: '76 99 88 77', quartier: 'Sogoniko' },
    address: 'Sogoniko, près du commissariat, villa jaune',
    payment: { method: 'Orange Money', status: 'Payé', amount: 14500 },
    items: [{ id: 14, name: 'Palette maquillage 18 couleurs', qty: 1, price: 14500, available: true }],
    livraison: { mode: 'Standard', frais: 1500 },
    assignedTo: 'SHP-001',
    notes: [],
    urgent: false,
  },
  {
    id: 'SGY-42840',
    status: 'DELIVERED',
    createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
    client: { name: 'Seydou Konaté', phone: '69 11 22 33', quartier: 'Lafiabougou' },
    address: 'Lafiabougou, derrière le lycée Askia Mohamed',
    payment: { method: 'Orange Money', status: 'Payé', amount: 19900 },
    items: [{ id: 15, name: 'Powerbank 20000 mAh', qty: 1, price: 19900, available: true }],
    livraison: { mode: 'Standard', frais: 1500 },
    assignedTo: 'SHP-001',
    notes: [],
    urgent: false,
  },
  {
    id: 'SGY-42830',
    status: 'CANCELLED',
    createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
    client: { name: 'Awa Sidibé', phone: '78 55 66 77', quartier: 'Quinzambougou' },
    address: 'Quinzambougou, rue 40',
    payment: { method: 'À la livraison', status: 'Annulé', amount: 8900 },
    items: [{ id: 16, name: 'Crème éclaircissante naturelle', qty: 1, price: 8900, available: false }],
    livraison: { mode: 'Standard', frais: 1500 },
    assignedTo: null,
    notes: [{ id: 3, text: 'Client injoignable, annulée après 3 tentatives', time: new Date(Date.now() - 280 * 60000).toISOString() }],
    urgent: false,
  },
]

export function getShopperOrderById(id: string) {
  return SHOPPER_SAMPLE_ORDERS.find((order) => order.id === id) ?? null
}

export function timeAgo(dateString: string) {
  const mins = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h${mins % 60 > 0 ? String(mins % 60).padStart(2, '0') : ''}`
  return `${Math.floor(hrs / 24)}j`
}

export function formatCFA(amount: number) {
  return formatPrice(amount).replace(' FCFA', ' F')
}
