
// ─── Shopper UI Components ──────────────────────────────────────────────────

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, size = 'md' }) {
  const s = SHOPPER_DATA.statuses.find(st => st.id === status) || SHOPPER_DATA.statuses[0];
  const pad = size === 'sm' ? '3px 8px' : '5px 12px';
  const fs = size === 'sm' ? 11 : 12;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: pad, borderRadius: 99, fontSize: fs, fontWeight: 700,
      background: s.bg, color: s.color, lineHeight: 1, whiteSpace: 'nowrap',
      border: `1.5px solid ${s.color}20`
    }}>{s.label}</span>
  );
}

// ─── Payment Badge ────────────────────────────────────────────────────────────
function PaymentBadge({ status }) {
  const isPaid = status === 'Payé';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700,
      background: isPaid ? '#E8F8F1' : '#FEF3C7',
      color: isPaid ? '#1a936f' : '#92400e', lineHeight: 1
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: isPaid ? '#1a936f' : '#f59e0b' }}></span>
      {status}
    </span>
  );
}

// ─── Urgency indicator ────────────────────────────────────────────────────────
function UrgencyDot({ urgent, age }) {
  if (!urgent && age < 30) return null;
  const isOld = age >= 30;
  return (
    <span style={{
      width: 8, height: 8, borderRadius: 99, flexShrink: 0,
      background: urgent ? '#dc2626' : isOld ? '#f59e0b' : 'transparent',
      boxShadow: urgent ? '0 0 0 3px #dc262630' : 'none',
      animation: urgent ? 'pulse 2s infinite' : 'none'
    }}></span>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onTap, compact }) {
  const age = Math.floor((Date.now() - order.createdAt.getTime()) / 60000);
  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
  const isActive = ['NEW', 'PREPARING', 'READY', 'DELIVERING'].includes(order.status);

  return (
    <div
      onClick={() => onTap(order)}
      style={{
        background: '#fff', borderRadius: 14, padding: '14px 16px',
        cursor: 'pointer', transition: 'all 0.2s ease',
        border: order.urgent && isActive ? '1.5px solid #dc262640' : '1px solid #f0ede8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      {/* Top row: order ID + status + time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UrgencyDot urgent={order.urgent && isActive} age={age} />
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{order.id}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge status={order.status} size="sm" />
          <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>{timeAgo(order.createdAt)}</span>
        </div>
      </div>

      {/* Client + quartier */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 99, flexShrink: 0,
            background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: 'var(--text-light)'
          }}>
            {order.client.name.split(' ').map(w => w[0]).join('')}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.client.name}</p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-light)', fontWeight: 500 }}>{order.client.quartier}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 14, color: 'var(--primary)' }}>{formatCFA(order.payment.amount)}</p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-light)' }}>{itemCount} article{itemCount > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Bottom row: payment + livraison */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <PaymentBadge status={order.payment.status} />
        <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>
          {order.payment.method === 'Orange Money' ? '🟠 OM' : '💵 Cash'}
        </span>
        {order.livraison.mode === 'Express' && (
          <span style={{ fontSize: 10, fontWeight: 800, color: '#7c3aed', background: '#F5F3FF', padding: '2px 7px', borderRadius: 99 }}>⚡ Express</span>
        )}
        {order.assignedTo && (
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-light)', marginLeft: 'auto' }}>Assignée</span>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '12px 14px',
      border: '1px solid #f0ede8', flex: '1 1 0', minWidth: 70
    }}>
      <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 18, color: accent || 'var(--text)' }}>{value}</p>
    </div>
  );
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────
function BottomNav({ active, onNavigate, newCount }) {
  const tabs = [
    { id: 'dashboard', label: 'Commandes', icon: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
    { id: 'my-orders', label: 'Mes tâches', icon: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
    { id: 'profile', label: 'Profil', icon: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: '#fff', borderTop: '1px solid #f0ede8',
      display: 'flex', justifyContent: 'space-around', padding: '6px 0 env(safe-area-inset-bottom, 8px)',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.05)'
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        const color = isActive ? 'var(--primary)' : '#999';
        return (
          <button key={tab.id} onClick={() => onNavigate(tab.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 16px',
              position: 'relative'
            }}>
            {tab.icon(color)}
            {tab.id === 'dashboard' && newCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 8,
                background: '#dc2626', color: '#fff', borderRadius: 99,
                fontSize: 9, fontWeight: 800, minWidth: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px'
              }}>{newCount}</span>
            )}
            <span style={{ fontSize: 10, fontWeight: isActive ? 800 : 600, color }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Action Button (full-width CTA) ──────────────────────────────────────────
function ActionButton({ label, onClick, color, icon, secondary, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      width: '100%', padding: '14px 20px', borderRadius: 12,
      border: secondary ? `2px solid ${color || 'var(--primary)'}` : 'none',
      background: disabled ? '#e0dbd4' : secondary ? '#fff' : (color || 'var(--primary)'),
      color: secondary ? (color || 'var(--primary)') : '#fff',
      fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-body)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'all 0.15s', opacity: disabled ? 0.5 : 1
    }}>
      {icon}{label}
    </button>
  );
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, confirmColor, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 env(safe-area-inset-bottom, 0)'
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 24px 24px',
        width: '100%', maxWidth: 420, boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
        animation: 'slideUp 0.25s ease'
      }}>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: 'var(--text)' }}>{title}</h3>
        <p style={{ fontSize: 14, color: 'var(--text-light)', margin: '0 0 24px', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e0dbd4',
            background: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: 'var(--font-body)', color: 'var(--text)'
          }}>Annuler</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '13px', borderRadius: 12, border: 'none',
            background: confirmColor || 'var(--primary)', fontWeight: 800, fontSize: 14,
            cursor: 'pointer', fontFamily: 'var(--font-body)', color: '#fff'
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Unavailable Sheet ────────────────────────────────────────────────
function UnavailableSheet({ item, onAction, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 24px 24px',
        width: '100%', maxWidth: 420, boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
        animation: 'slideUp 0.25s ease'
      }}>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 800, margin: '0 0 6px', color: 'var(--text)' }}>Produit indisponible</h3>
        <p style={{ fontSize: 13, color: 'var(--text-light)', margin: '0 0 20px' }}>« {item.name} » n'est pas trouvé en magasin.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => onAction('skip')} style={{
            padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e0dbd4',
            background: '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}>
            <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Signaler manquant</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-light)' }}>Continuer avec les autres articles</p>
          </button>
          <button onClick={() => onAction('replace')} style={{
            padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e0dbd4',
            background: '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}>
            <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Proposer un remplacement</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-light)' }}>Notifier le client via WhatsApp</p>
          </button>
          <button onClick={() => onAction('cancel')} style={{
            padding: '12px 16px', borderRadius: 12, border: '1.5px solid #dc262640',
            background: '#FEF2F2', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}>
            <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14, color: '#dc2626' }}>Annuler la commande</p>
            <p style={{ margin: 0, fontSize: 12, color: '#dc262699' }}>Si tous les articles sont introuvables</p>
          </button>
        </div>

        <button onClick={onCancel} style={{
          width: '100%', padding: '12px', borderRadius: 12, border: 'none',
          background: 'var(--bg)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          fontFamily: 'var(--font-body)', color: 'var(--text-light)', marginTop: 12
        }}>Fermer</button>
      </div>
    </div>
  );
}

Object.assign(window, {
  StatusBadge, PaymentBadge, UrgencyDot, OrderCard, StatCard,
  BottomNav, ActionButton, ConfirmModal, UnavailableSheet, formatCFA, timeAgo
});
