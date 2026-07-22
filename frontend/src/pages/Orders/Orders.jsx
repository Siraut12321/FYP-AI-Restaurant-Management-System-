import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MdCheckCircle, MdPendingActions, MdAutorenew,
  MdCancel, MdAttachMoney, MdVisibility, MdDelete, MdLocalShipping,
} from 'react-icons/md';
import orderService from '../../services/orderService';
import styles from './Orders.module.css';

// ─── Status meta (backend enum values) ───────────────────────────────────────
const STATUS_META = {
  Pending:   { label: 'Pending',   color: 'var(--admin-warning)', dim: 'var(--admin-warning-dim)', icon: <MdPendingActions /> },
  Preparing: { label: 'Preparing', color: 'var(--admin-info)',    dim: 'var(--admin-info-dim)',    icon: <MdAutorenew />     },
  Ready:     { label: 'Ready',     color: 'var(--admin-success)', dim: 'var(--admin-success-dim)', icon: <MdCheckCircle />   },
  Delivered: { label: 'Delivered', color: 'var(--admin-gold)',    dim: 'var(--admin-gold-dim)',    icon: <MdLocalShipping /> },
  Cancelled: { label: 'Cancelled', color: 'var(--admin-danger)',  dim: 'var(--admin-danger-dim)',  icon: <MdCancel />        },
};

const FILTERS = ['All', 'Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.28, delay: i * 0.07, ease: 'easeOut' } }),
};

function Orders() {
  const [orders, setOrders]         = useState([]);
  const [total, setTotal]           = useState(0);
  const [pages, setPages]           = useState(1);
  const [page, setPage]             = useState(1);
  const [activeFilter, setFilter]   = useState('All');
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // ─── Fetch orders from backend ──────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (activeFilter !== 'All') params.orderStatus = activeFilter;
      if (search) params.search = search;

      const res = await orderService.getAllOrders(params);
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ─── Reset to page 1 when filter/search changes ─────────────────────────────
  useEffect(() => { setPage(1); }, [activeFilter, search]);

  // ─── Delete order ────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await orderService.deleteOrder(id);
      if (selected?._id === id) setSelected(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete order.');
    }
  }

  // ─── Update order status ─────────────────────────────────────────────────────
  async function handleStatusChange(id, orderStatus) {
    setStatusLoading(true);
    try {
      const res = await orderService.updateOrderStatus(id, orderStatus);
      // Update the selected panel instantly
      setSelected((prev) => prev?._id === id ? { ...prev, orderStatus: res.data.orderStatus } : prev);
      // Refresh list
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  }

  // ─── Search submit ───────────────────────────────────────────────────────────
  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearch(searchInput.trim());
  }

  // ─── Derived stats from current page (full stats need separate endpoint) ────
  const statusCounts = FILTERS.slice(1).reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.orderStatus === s).length;
    return acc;
  }, {});

  const revenue = orders
    .filter((o) => o.orderStatus === 'Delivered')
    .reduce((s, o) => s + o.totalAmount, 0);

  const STAT_CARDS = [
    { key: 'revenue',   label: 'Page Revenue',  value: `₨ ${revenue.toLocaleString()}`,  icon: <MdAttachMoney />,   color: 'var(--admin-gold)',    dim: 'var(--admin-gold-dim)'    },
    { key: 'Pending',   label: 'Pending',        value: statusCounts.Pending   || 0,      icon: <MdPendingActions />,color: 'var(--admin-warning)', dim: 'var(--admin-warning-dim)' },
    { key: 'Preparing', label: 'Preparing',      value: statusCounts.Preparing || 0,      icon: <MdAutorenew />,     color: 'var(--admin-info)',    dim: 'var(--admin-info-dim)'    },
    { key: 'Delivered', label: 'Delivered',      value: statusCounts.Delivered || 0,      icon: <MdLocalShipping />, color: 'var(--admin-success)', dim: 'var(--admin-success-dim)' },
    { key: 'Cancelled', label: 'Cancelled',      value: statusCounts.Cancelled || 0,      icon: <MdCancel />,        color: 'var(--admin-danger)',  dim: 'var(--admin-danger-dim)'  },
  ];

  return (
    <div>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Orders</div>
          <div className={styles.pageSub}>Track and manage all customer orders.</div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name…"
            style={{
              padding: '7px 14px', borderRadius: 999,
              border: '1px solid var(--admin-border)',
              background: 'var(--admin-surface)',
              color: 'var(--admin-text-primary)', fontSize: '0.82rem',
            }}
          />
          <button type="submit" style={{
            padding: '7px 16px', borderRadius: 999,
            background: 'var(--admin-gold-dim)', color: 'var(--admin-gold)',
            border: '1px solid var(--admin-gold-glow)', cursor: 'pointer', fontSize: '0.82rem',
          }}>
            Search
          </button>
        </form>
      </div>

      {/* ── Stat cards ── */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((c, i) => (
          <motion.div
            key={c.key}
            className={styles.statCard}
            variants={fadeUp} initial="hidden" animate="visible" custom={i}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <div className={styles.statIcon} style={{ background: c.dim }}>
              <span style={{ color: c.color, display: 'flex', fontSize: '1.3rem' }}>{c.icon}</span>
            </div>
            <div className={styles.statValue} style={{ color: c.color }}>{c.value}</div>
            <div className={styles.statLabel}>{c.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div className={styles.filterBar}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${activeFilter === f ? styles.active : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
            <span className={styles.filterCount}>
              {f === 'All' ? total : (statusCounts[f] || 0)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <p style={{ color: 'var(--admin-danger)', marginBottom: 16, fontSize: '0.85rem' }}>{error}</p>
      )}

      {/* ── Table + detail panel ── */}
      <div className={`${styles.tableLayout} ${selected ? styles.withPanel : ''}`}>
        <motion.div className={styles.panel} variants={fadeUp} initial="hidden" animate="visible" custom={0}>

          {/* Loading spinner */}
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--admin-text-muted)' }}>
              Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--admin-text-muted)' }}>
              No orders found.
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const meta = STATUS_META[o.orderStatus] || STATUS_META.Pending;
                    const itemNames = o.orderItems.map((i) => `${i.dishName} x${i.quantity}`).join(', ');
                    const date = new Date(o.createdAt).toLocaleString('en-PK', {
                      dateStyle: 'medium', timeStyle: 'short',
                    });
                    return (
                      <tr
                        key={o._id}
                        className={selected?._id === o._id ? styles.rowSelected : ''}
                      >
                        <td><span className={styles.orderId}>{o._id.slice(-8).toUpperCase()}</span></td>
                        <td><span className={styles.customerName}>{o.customer?.name || o.shippingAddress.fullName}</span></td>
                        <td className={styles.itemsCell}>{itemNames}</td>
                        <td><span className={styles.amount}>₨ {o.totalAmount.toLocaleString()}</span></td>
                        <td><span className={styles.payment}>{o.paymentMethod}</span></td>
                        <td>
                          <span className={styles.statusBadge} style={{ background: meta.dim, color: meta.color }}>
                            <span className={styles.statusDot} style={{ background: meta.color }} />
                            {meta.label}
                          </span>
                        </td>
                        <td className={styles.dateCell}>{date}</td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              className={styles.actionBtn}
                              onClick={() => setSelected(selected?._id === o._id ? null : o)}
                              title="View details"
                            >
                              <MdVisibility />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.danger}`}
                              onClick={() => handleDelete(o._id)}
                              title="Delete"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 0' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
                  border: '1px solid var(--admin-border)',
                  background: 'transparent', color: 'var(--admin-text-secondary)',
                }}
              >
                ← Prev
              </button>
              <span style={{ padding: '6px 12px', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                style={{
                  padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
                  border: '1px solid var(--admin-border)',
                  background: 'transparent', color: 'var(--admin-text-secondary)',
                }}
              >
                Next →
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Detail panel ── */}
        {selected && (
          <motion.div
            className={styles.detailPanel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className={styles.detailHeader}>
              <span className={styles.detailTitle}>Order Details</span>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className={styles.detailBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Order ID</span>
                <span className={styles.detailVal} style={{ fontFamily: 'monospace' }}>
                  {selected._id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Customer</span>
                <span className={styles.detailVal}>{selected.customer?.name || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Email</span>
                <span className={styles.detailVal}>{selected.customer?.email || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Phone</span>
                <span className={styles.detailVal}>{selected.shippingAddress.phone}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Address</span>
                <span className={styles.detailVal} style={{ textAlign: 'right' }}>
                  {selected.shippingAddress.address}, {selected.shippingAddress.city}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Items</span>
                <span className={styles.detailVal} style={{ textAlign: 'right' }}>
                  {selected.orderItems.map((i) => `${i.dishName} x${i.quantity}`).join(', ')}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Total</span>
                <span className={styles.detailVal} style={{ color: 'var(--admin-gold)', fontWeight: 700 }}>
                  ₨ {selected.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Payment</span>
                <span className={styles.detailVal}>{selected.paymentMethod}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Pay Status</span>
                <span className={styles.detailVal}>{selected.paymentStatus}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Date</span>
                <span className={styles.detailVal}>
                  {new Date(selected.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>

              <div className={styles.detailDivider} />

              <div className={styles.detailKey} style={{ marginBottom: 8 }}>Update Status</div>
              <div className={styles.statusBtns}>
                {Object.entries(STATUS_META).map(([key, meta]) => (
                  <button
                    key={key}
                    disabled={statusLoading}
                    className={`${styles.statusChangeBtn} ${selected.orderStatus === key ? styles.statusActive : ''}`}
                    style={selected.orderStatus === key
                      ? { background: meta.dim, color: meta.color, borderColor: meta.color }
                      : {}}
                    onClick={() => handleStatusChange(selected._id, key)}
                  >
                    <span style={{ display: 'flex', fontSize: '1rem' }}>{meta.icon}</span>
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Orders;
