
// ─── Shopper Pages ──────────────────────────────────────────────────────────

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function PageDashboard({ orders, onTapOrder, shopper, filter, setFilter }) {
  const newCount = orders.filter(o => o.status === 'NEW').length;
  const prepCount = orders.filter(o => o.status === 'PREPARING').length;
  const readyCount = orders.filter(o => o.status === 'READY').length;

  const tabs = [
    { id: 'active', label: 'Actives', count: orders.filter(o => ['NEW','PREPARING','READY','DELIVERING'].includes(o.status)).length },
    { id: 'new', label: 'Nouvelles', count: newCount },
    { id: 'mine', label: 'Mes tâches', count: orders.filter(o => o.assignedTo === shopper.id && !['DELIVERED','CANCELLED'].includes(o.status)).length },
    { id: 'done', label: 'Terminées', count: orders.filter(o => ['DELIVERED','CANCELLED'].includes(o.status)).length },
  ];

  let filtered = orders;
  if (filter === 'new') filtered = orders.filter(o => o.status === 'NEW');
  else if (filter === 'mine') filtered = orders.filter(o => o.assignedTo === shopper.id && !['DELIVERED','CANCELLED'].includes(o.status));
  else if (filter === 'done') filtered = orders.filter(o => ['DELIVERED','CANCELLED'].includes(o.status));
  else filtered = orders.filter(o => ['NEW','PREPARING','READY','DELIVERING'].includes(o.status));

  // Sort: urgent first, then by creation time (newest first)
  filtered = [...filtered].sort((a, b) => {
    const aActive = ['NEW','PREPARING','READY','DELIVERING'].includes(a.status);
    const bActive = ['NEW','PREPARING','READY','DELIVERING'].includes(b.status);
    if (a.urgent && aActive && !(b.urgent && bActive)) return -1;
    if (b.urgent && bActive && !(a.urgent && aActive)) return 1;
    return b.createdAt - a.createdAt;
  });

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: 13, color: 'var(--text-light)', fontWeight: 500 }}>Bonjour,</p>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{shopper.name.split(' ')[0]} 👋</h1>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 99, background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-head)'
        }}>{shopper.initials}</div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <StatCard label="Aujourd'hui" value={shopper.stats.todayCompleted} accent="var(--primary)" />
        <StatCard label="Revenus" value={formatCFA(shopper.stats.todayRevenue)} />
        <StatCard label="Temps moy." value={shopper.stats.avgTime} />
      </div>

      {/* Alert banner for new orders */}
      {newCount > 0 && (
        <div onClick={() => setFilter('new')} style={{
          background: '#EFF6FF', border: '1.5px solid #2563EB30', borderRadius: 12,
          padding: '12px 16px', marginBottom: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 99, background: '#2563EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>{newCount}</span>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1e40af' }}>
              {newCount} nouvelle{newCount > 1 ? 's' : ''} commande{newCount > 1 ? 's' : ''}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#3b82f6' }}>Appuyez pour voir</p>
          </div>
          <svg style={{ marginLeft: 'auto' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
            padding: '8px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
            background: filter === tab.id ? 'var(--text)' : '#fff',
            color: filter === tab.id ? '#fff' : 'var(--text)',
            fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: filter === tab.id ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'all 0.15s'
          }}>
            {tab.label}
            <span style={{
              fontSize: 11, fontWeight: 800, padding: '1px 6px', borderRadius: 99,
              background: filter === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--bg)',
              color: filter === tab.id ? '#fff' : 'var(--text-light)'
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Order list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: 12 }}>
              <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-light)', margin: '0 0 4px' }}>Aucune commande</p>
            <p style={{ fontSize: 13, color: '#bbb', margin: 0 }}>Les nouvelles commandes apparaîtront ici</p>
          </div>
        ) : (
          filtered.map(order => (
            <OrderCard key={order.id} order={order} onTap={onTapOrder} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── ORDER DETAIL ─────────────────────────────────────────────────────────────
function PageOrderDetail({ order, onBack, onUpdateStatus, onAssign, onAddNote, shopper }) {
  const [showConfirm, setShowConfirm] = React.useState(null);
  const [showUnavailable, setShowUnavailable] = React.useState(null);
  const [noteText, setNoteText] = React.useState('');
  const [showNoteInput, setShowNoteInput] = React.useState(false);

  const status = SHOPPER_DATA.statuses.find(s => s.id === order.status);
  const age = Math.floor((Date.now() - order.createdAt.getTime()) / 60000);
  const isAssignedToMe = order.assignedTo === shopper.id;
  const isActive = ['NEW', 'PREPARING', 'READY', 'DELIVERING'].includes(order.status);

  const nextAction = {
    'NEW': { label: 'Je prends cette commande', next: 'PREPARING', color: 'var(--primary)', needsAssign: true },
    'PREPARING': { label: 'Commande prête ✓', next: 'READY', color: '#16a34a' },
    'READY': { label: 'Lancer la livraison', next: 'DELIVERING', color: '#7c3aed' },
    'DELIVERING': { label: 'Confirmer la livraison ✓', next: 'DELIVERED', color: '#1a936f' },
  }[order.status];

  const handleNext = () => {
    if (nextAction.next === 'DELIVERED') {
      setShowConfirm({
        title: 'Confirmer la livraison',
        message: `La commande ${order.id} a été livrée à ${order.client.name} ?`,
        confirmLabel: 'Oui, livrée',
        confirmColor: '#1a936f',
        action: () => { onUpdateStatus(order.id, 'DELIVERED'); setShowConfirm(null); }
      });
    } else {
      if (nextAction.needsAssign) onAssign(order.id);
      onUpdateStatus(order.id, nextAction.next);
    }
  };

  const handleCancel = () => {
    setShowConfirm({
      title: 'Annuler la commande',
      message: `Êtes-vous sûr de vouloir annuler ${order.id} ? Cette action est irréversible.`,
      confirmLabel: 'Annuler la commande',
      confirmColor: '#dc2626',
      action: () => { onUpdateStatus(order.id, 'CANCELLED'); setShowConfirm(null); }
    });
  };

  const handleAddNote = () => {
    if (noteText.trim()) {
      onAddNote(order.id, noteText.trim());
      setNoteText('');
      setShowNoteInput(false);
    }
  };

  return (
    <div style={{ padding: '0 0 120px', background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#fff', padding: '12px 16px',
        borderBottom: '1px solid #f0ede8',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>{order.id}</span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div style={{ padding: '16px' }}>
        {/* Urgency banner */}
        {order.urgent && isActive && (
          <div style={{
            background: '#FEF2F2', border: '1.5px solid #dc262630', borderRadius: 12,
            padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ fontSize: 14 }}>🔴</span>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
              Commande urgente · {timeAgo(order.createdAt)}
            </p>
          </div>
        )}

        {/* Client info card */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 12, border: '1px solid #f0ede8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 99, background: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14, color: 'var(--text-light)'
              }}>{order.client.name.split(' ').map(w => w[0]).join('')}</div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{order.client.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-light)' }}>{order.client.phone}</p>
              </div>
            </div>
            {/* WhatsApp button */}
            <a href={`https://wa.me/223${order.client.phone.replace(/\s/g, '')}`}
              style={{
                width: 40, height: 40, borderRadius: 12, background: '#25D366',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', flexShrink: 0
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>

          {/* Address */}
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Livraison</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
              {order.client.quartier} — {order.address}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)' }}>{order.livraison.mode}</span>
              {order.livraison.mode === 'Express' && <span style={{ fontSize: 10, fontWeight: 800, color: '#7c3aed', background: '#F5F3FF', padding: '2px 7px', borderRadius: 99 }}>⚡ Express</span>}
            </div>
          </div>
        </div>

        {/* Products */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 12, border: '1px solid #f0ede8' }}>
          <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Articles ({order.items.reduce((s, i) => s + i.qty, 0)})</p>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: i > 0 ? '1px solid #f0ede8' : 'none', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{item.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-light)' }}>Qté: {item.qty} × {formatCFA(item.price)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap' }}>{formatCFA(item.price * item.qty)}</span>
                {isActive && order.status === 'PREPARING' && (
                  <button onClick={() => setShowUnavailable(item)} style={{
                    background: 'none', border: '1.5px solid #e0dbd4', borderRadius: 8,
                    padding: '4px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 700,
                    color: '#dc2626', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap'
                  }}>Manquant</button>
                )}
              </div>
            </div>
          ))}
          <div style={{ borderTop: '2px solid #f0ede8', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-light)' }}>Livraison: {formatCFA(order.livraison.frais)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: 18, color: 'var(--primary)' }}>{formatCFA(order.payment.amount + order.livraison.frais)}</p>
            </div>
          </div>
        </div>

        {/* Payment info */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 12, border: '1px solid #f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              {order.payment.method === 'Orange Money' ? '🟠' : '💵'} {order.payment.method}
            </span>
          </div>
          <PaymentBadge status={order.payment.status} />
        </div>

        {/* Notes */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 16, border: '1px solid #f0ede8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes internes</p>
            {!showNoteInput && (
              <button onClick={() => setShowNoteInput(true)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
                fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-body)'
              }}>+ Ajouter</button>
            )}
          </div>
          {order.notes.length === 0 && !showNoteInput && (
            <p style={{ margin: 0, fontSize: 13, color: '#ccc', fontStyle: 'italic' }}>Aucune note pour le moment</p>
          )}
          {order.notes.map((note, i) => (
            <div key={i} style={{ padding: '8px 0', borderTop: i > 0 ? '1px solid #f0ede8' : 'none' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{note.text}</p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-light)' }}>{timeAgo(note.time)}</p>
            </div>
          ))}
          {showNoteInput && (
            <div style={{ marginTop: 8 }}>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="Ajouter une note..."
                rows={2}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e0dbd4',
                  fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--text)',
                  outline: 'none', resize: 'none', boxSizing: 'border-box'
                }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => setShowNoteInput(false)} style={{
                  padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e0dbd4',
                  background: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', color: 'var(--text-light)'
                }}>Annuler</button>
                <button onClick={handleAddNote} style={{
                  padding: '8px 14px', borderRadius: 8, border: 'none',
                  background: 'var(--primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', color: '#fff'
                }}>Enregistrer</button>
              </div>
            </div>
          )}
        </div>

        {/* Meta info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          <span style={{ padding: '4px 10px', background: '#fff', borderRadius: 8, fontSize: 11, fontWeight: 600, color: 'var(--text-light)', border: '1px solid #f0ede8' }}>
            Créée il y a {timeAgo(order.createdAt)}
          </span>
          {order.assignedTo && (
            <span style={{ padding: '4px 10px', background: '#fff', borderRadius: 8, fontSize: 11, fontWeight: 600, color: 'var(--text-light)', border: '1px solid #f0ede8' }}>
              Assignée à {order.assignedTo === shopper.id ? 'moi' : order.assignedTo}
            </span>
          )}
        </div>

        {/* Action buttons */}
        {nextAction && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ActionButton label={nextAction.label} onClick={handleNext} color={nextAction.color} />
            {isActive && order.status !== 'NEW' && (
              <ActionButton label="Annuler la commande" onClick={handleCancel} color="#dc2626" secondary />
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showConfirm && (
        <ConfirmModal
          title={showConfirm.title}
          message={showConfirm.message}
          confirmLabel={showConfirm.confirmLabel}
          confirmColor={showConfirm.confirmColor}
          onConfirm={showConfirm.action}
          onCancel={() => setShowConfirm(null)}
        />
      )}
      {showUnavailable && (
        <UnavailableSheet
          item={showUnavailable}
          onAction={(action) => { setShowUnavailable(null); }}
          onCancel={() => setShowUnavailable(null)}
        />
      )}
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function PageProfile({ shopper }) {
  return (
    <div style={{ padding: '16px 16px 100px' }}>
      {/* Profile header */}
      <div style={{ textAlign: 'center', marginBottom: 28, paddingTop: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 99, background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 26, fontFamily: 'var(--font-head)',
          margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(244,123,32,0.3)'
        }}>{shopper.initials}</div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800, margin: '0 0 4px', color: 'var(--text)' }}>{shopper.name}</h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-light)' }}>Shopper · +223 {shopper.phone}</p>
      </div>

      {/* Stats */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 16, border: '1px solid #f0ede8' }}>
        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Performance du jour</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            ['Commandes', shopper.stats.todayCompleted, 'var(--primary)'],
            ['Revenus', formatCFA(shopper.stats.todayRevenue), '#1a936f'],
            ['Temps moyen', shopper.stats.avgTime, '#2563EB'],
            ['Note', '⭐ ' + shopper.stats.rating, '#f59e0b'],
          ].map(([label, value, color]) => (
            <div key={label} style={{ padding: '12px', background: 'var(--bg)', borderRadius: 10 }}>
              <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ margin: 0, fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 18, color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings list */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0ede8', overflow: 'hidden' }}>
        {['Disponibilité', 'Historique des commandes', 'Notifications', 'Aide & Support', 'Conditions d\'utilisation'].map((item, i) => (
          <div key={item} style={{
            padding: '14px 16px', borderTop: i > 0 ? '1px solid #f0ede8' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        ))}
      </div>

      <button style={{
        width: '100%', marginTop: 20, padding: '13px', borderRadius: 12,
        border: '1.5px solid #dc262640', background: '#FEF2F2',
        fontWeight: 700, fontSize: 14, cursor: 'pointer',
        fontFamily: 'var(--font-body)', color: '#dc2626'
      }}>Se déconnecter</button>
    </div>
  );
}

Object.assign(window, { PageDashboard, PageOrderDetail, PageProfile });
