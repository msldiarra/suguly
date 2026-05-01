
const SHOPPER_DATA = {
  shopper: {
    id: 'SHP-001',
    name: 'Abdoulaye Diallo',
    phone: '76 12 34 56',
    initials: 'AD',
    stats: { todayCompleted: 7, todayRevenue: 8750, avgTime: '34 min', rating: 4.8 }
  },
  statuses: [
    { id: 'NEW', label: 'Nouvelle', color: '#2563EB', bg: '#EFF6FF', icon: 'new' },
    { id: 'PREPARING', label: 'En cours', color: '#F47B20', bg: '#FFF7ED', icon: 'preparing' },
    { id: 'READY', label: 'Prête', color: '#16a34a', bg: '#F0FDF4', icon: 'ready' },
    { id: 'DELIVERING', label: 'En livraison', color: '#7c3aed', bg: '#F5F3FF', icon: 'delivering' },
    { id: 'DELIVERED', label: 'Livrée', color: '#1a936f', bg: '#E8F8F1', icon: 'delivered' },
    { id: 'CANCELLED', label: 'Annulée', color: '#dc2626', bg: '#FEF2F2', icon: 'cancelled' },
  ],
  orders: [
    {
      id: 'SUG-42891', status: 'NEW', createdAt: new Date(Date.now() - 8 * 60000),
      client: { name: 'Fatoumata Keita', phone: '78 90 12 34', quartier: 'Badalabougou' },
      address: 'Près du marché, 3e ruelle à droite, portail vert',
      payment: { method: 'Orange Money', status: 'Payé', amount: 42400 },
      items: [
        { name: 'Écouteurs sans fil Bluetooth', qty: 2, price: 15900 },
        { name: 'Chargeur rapide USB-C 65W', qty: 1, price: 8500 },
        { name: 'Fil électrique multiprise 5m', qty: 1, price: 6800 },
      ],
      livraison: { mode: 'Express', frais: 3000 },
      assignedTo: null, notes: [],
      urgent: true,
    },
    {
      id: 'SUG-42888', status: 'NEW', createdAt: new Date(Date.now() - 22 * 60000),
      client: { name: 'Moussa Traoré', phone: '66 45 67 89', quartier: 'Hamdallaye' },
      address: 'ACI 2000, derrière la pharmacie Kènèya',
      payment: { method: 'À la livraison', status: 'En attente', amount: 28500 },
      items: [
        { name: 'Montre connectée Sport', qty: 1, price: 28500 },
      ],
      livraison: { mode: 'Standard', frais: 1500 },
      assignedTo: null, notes: [],
      urgent: false,
    },
    {
      id: 'SUG-42885', status: 'PREPARING', createdAt: new Date(Date.now() - 45 * 60000),
      client: { name: 'Aminata Coulibaly', phone: '76 33 22 11', quartier: 'Kalaban-Coro' },
      address: 'Route de Koulikoro, face station Total, maison blanche 2 étages',
      payment: { method: 'Orange Money', status: 'Payé', amount: 35400 },
      items: [
        { name: 'Robe Bogolan moderne', qty: 1, price: 12500 },
        { name: 'Sac à main cuir synthétique', qty: 1, price: 17500 },
        { name: 'Ceinture en cuir tressé', qty: 1, price: 6500 },
      ],
      livraison: { mode: 'Standard', frais: 1500 },
      assignedTo: 'SHP-001', notes: [{ text: 'Robe dispo en brun uniquement, cliente OK', time: new Date(Date.now() - 20 * 60000) }],
      urgent: false,
    },
    {
      id: 'SUG-42880', status: 'PREPARING', createdAt: new Date(Date.now() - 55 * 60000),
      client: { name: 'Ibrahim Sanogo', phone: '69 88 77 66', quartier: 'Magnambougou' },
      address: 'Magnambougou Faso Kanu, près de la mosquée du vendredi',
      payment: { method: 'Orange Money', status: 'Payé', amount: 24700 },
      items: [
        { name: 'Powerbank 20000 mAh', qty: 1, price: 19900 },
        { name: 'Ventilateur portable USB', qty: 1, price: 7200 },
      ],
      livraison: { mode: 'Express', frais: 3000 },
      assignedTo: 'SHP-001', notes: [],
      urgent: true,
    },
    {
      id: 'SUG-42870', status: 'READY', createdAt: new Date(Date.now() - 90 * 60000),
      client: { name: 'Mariam Diarra', phone: '78 11 22 33', quartier: 'Hippodrome' },
      address: 'Hippodrome, rue 305, porte 18',
      payment: { method: 'Orange Money', status: 'Payé', amount: 23300 },
      items: [
        { name: 'Lampe LED rechargeable', qty: 2, price: 9800 },
        { name: 'Huile de coco pure 500ml', qty: 1, price: 5500 },
      ],
      livraison: { mode: 'Standard', frais: 1500 },
      assignedTo: 'SHP-001', notes: [{ text: '2 lampes blanches comme demandé', time: new Date(Date.now() - 40 * 60000) }],
      urgent: false,
    },
    {
      id: 'SUG-42865', status: 'DELIVERING', createdAt: new Date(Date.now() - 120 * 60000),
      client: { name: 'Oumar Sissoko', phone: '65 44 55 66', quartier: 'Niamakoro' },
      address: 'Niamakoro Cité UNICEF, bloc 12, apt 3',
      payment: { method: 'À la livraison', status: 'En attente', amount: 31500 },
      items: [
        { name: 'Sneakers casual unisexe', qty: 1, price: 22000 },
        { name: 'Calculatrice scientifique', qty: 1, price: 9500 },
      ],
      livraison: { mode: 'Standard', frais: 1500 },
      assignedTo: 'SHP-001', notes: [],
      urgent: false,
    },
    {
      id: 'SUG-42850', status: 'DELIVERED', createdAt: new Date(Date.now() - 180 * 60000),
      client: { name: 'Kadiatou Bah', phone: '76 99 88 77', quartier: 'Sogoniko' },
      address: 'Sogoniko, près du commissariat, villa jaune',
      payment: { method: 'Orange Money', status: 'Payé', amount: 14500 },
      items: [
        { name: 'Palette maquillage 18 couleurs', qty: 1, price: 14500 },
      ],
      livraison: { mode: 'Standard', frais: 1500 },
      assignedTo: 'SHP-001', notes: [],
      urgent: false,
    },
    {
      id: 'SUG-42840', status: 'DELIVERED', createdAt: new Date(Date.now() - 240 * 60000),
      client: { name: 'Seydou Konaté', phone: '69 11 22 33', quartier: 'Lafiabougou' },
      address: 'Lafiabougou, derrière le lycée Askia Mohamed',
      payment: { method: 'Orange Money', status: 'Payé', amount: 19900 },
      items: [
        { name: 'Powerbank 20000 mAh', qty: 1, price: 19900 },
      ],
      livraison: { mode: 'Standard', frais: 1500 },
      assignedTo: 'SHP-001', notes: [],
      urgent: false,
    },
    {
      id: 'SUG-42830', status: 'CANCELLED', createdAt: new Date(Date.now() - 300 * 60000),
      client: { name: 'Awa Sidibé', phone: '78 55 66 77', quartier: 'Quinzambougou' },
      address: 'Quinzambougou, rue 40',
      payment: { method: 'À la livraison', status: 'Annulé', amount: 8900 },
      items: [
        { name: 'Crème éclaircissante naturelle', qty: 1, price: 8900 },
      ],
      livraison: { mode: 'Standard', frais: 1500 },
      assignedTo: null, notes: [{ text: 'Client injoignable, annulée après 3 tentatives', time: new Date(Date.now() - 280 * 60000) }],
      urgent: false,
    },
  ]
};

function timeAgo(date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return mins + ' min';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h' + (mins % 60 > 0 ? String(mins % 60).padStart(2, '0') : '');
  return Math.floor(hrs / 24) + 'j';
}

function formatCFA(n) { return n.toLocaleString('fr-FR') + ' F'; }
