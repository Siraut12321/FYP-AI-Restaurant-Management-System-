import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdAttachMoney, MdShoppingBag, MdPendingActions,
  MdCheckCircle, MdCancel, MdPeople, MdRestaurantMenu,
  MdStar, MdAdd, MdVisibility, MdLocalOffer,
  MdBarChart, MdTrendingUp,
} from 'react-icons/md';
import DashboardCard      from '../../admin/components/DashboardCard/DashboardCard';
import analyticsService   from '../../services/analyticsService';
import styles             from './Dashboard.module.css';

/* ── Fake SVG sparkline paths for chart placeholders ── */
function FakeLineChart({ color = '#F4C542', color2 = '#FF9F1C' }) {
  return (
    <svg className={styles.chartSvg} viewBox="0 0 400 160" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color}  stopOpacity="0.4" />
          <stop offset="100%" stopColor={color}  stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d="M0,130 C40,110 80,90 120,70 S200,30 240,40 S320,20 400,10"
        fill="none" stroke={color} strokeWidth="2.5" />
      <path d="M0,130 C40,110 80,90 120,70 S200,30 240,40 S320,20 400,10 L400,160 L0,160 Z"
        fill="url(#grad1)" />
      <path d="M0,150 C60,140 100,120 160,100 S260,80 300,70 S360,55 400,50"
        fill="none" stroke={color2} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
    </svg>
  );
}

function FakeBarChart() {
  const bars = [55, 80, 65, 90, 75, 95, 70, 100, 85, 110, 95, 124];
  const max  = Math.max(...bars);
  return (
    <svg className={styles.chartSvg} viewBox="0 0 400 160" preserveAspectRatio="none">
      {bars.map((v, i) => {
        const h = (v / max) * 130;
        const x = i * (400 / bars.length) + 6;
        const w = (400 / bars.length) - 10;
        return (
          <rect key={i} x={x} y={160 - h} width={w} height={h}
            rx="3" fill={i === bars.length - 1 ? '#F4C542' : '#FF9F1C'} opacity={0.35 + (i / bars.length) * 0.4} />
        );
      })}
    </svg>
  );
}

const ITEM_EMOJI = ['🍛', '🍢', '🥘', '🥭', '🍮'];

const fadeUp = {
  hidden:  { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.32, delay: i * 0.06, ease: 'easeOut' } }),
};

/* ── Status badge normaliser ── */
const statusKey = (s = '') => {
  const map = { Pending: 'pending', Preparing: 'preparing', Delivered: 'completed', Cancelled: 'cancelled', Ready: 'preparing' };
  return map[s] ?? 'pending';
};

const QUICK_ACTIONS = [
  { label: 'Add Menu Item', icon: <MdAdd />,        to: '/admin/menu',      bg: 'rgba(244,197,66,0.15)', color: '#F4C542'  },
  { label: 'View Orders',   icon: <MdVisibility />, to: '/admin/orders',    bg: 'rgba(59,130,246,0.15)', color: '#3b82f6'  },
  { label: 'Add Coupon',    icon: <MdLocalOffer />, to: '/admin/coupons',   bg: 'rgba(34,197,94,0.15)',  color: '#22c55e'  },
  { label: 'Analytics',     icon: <MdBarChart />,   to: '/admin/analytics', bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
];

function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    analyticsService.getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err?.response?.data?.message ?? 'Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
        <div style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid var(--admin-border)',
            borderTop: '3px solid var(--admin-gold)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
          }} />
          <span style={{ fontSize: '0.85rem' }}>Loading dashboard…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: 320, color: 'var(--admin-danger)', fontSize: '0.9rem',
      }}>
        ⚠️ {error}
      </div>
    );
  }

  /* ── Empty state ── */
  if (!stats || stats.totalOrders === 0) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: 320, color: 'var(--admin-text-muted)', fontSize: '0.9rem',
      }}>
        📊 No analytics available yet.
      </div>
    );
  }

  const maxOrders = Math.max(...(stats.popularDishes.map((d) => d.orders)), 1);

  const CARDS = [
    {
      icon: <MdAttachMoney />, label: "Today's Revenue",
      value: `₨ ${stats.todayRevenue.toLocaleString()}`,
      change: null,
      iconBg: 'rgba(244,197,66,0.15)', iconColor: '#F4C542',
      sparkData: [42, 58, 51, 73, 89, stats.todayRevenue > 0 ? 92 : 0],
    },
    {
      icon: <MdAttachMoney />, label: 'Total Revenue',
      value: `₨ ${stats.totalRevenue.toLocaleString()}`,
      change: null,
      iconBg: 'rgba(255,159,28,0.15)', iconColor: '#FF9F1C',
      sparkData: [30, 50, 45, 70, 85, stats.totalRevenue > 0 ? 100 : 0],
    },
    {
      icon: <MdShoppingBag />, label: 'Total Orders',
      value: stats.totalOrders,
      change: null,
      iconBg: 'rgba(59,130,246,0.15)', iconColor: '#3b82f6',
      sparkData: [68, 95, 82, 110, 134, stats.totalOrders],
    },
    {
      icon: <MdPendingActions />, label: 'Pending Orders',
      value: stats.pendingOrders,
      change: null,
      iconBg: 'rgba(245,158,11,0.15)', iconColor: '#f59e0b',
      sparkData: [3, 5, 2, 7, 4, stats.pendingOrders],
    },
    {
      icon: <MdCheckCircle />, label: 'Completed',
      value: stats.completedOrders,
      change: null,
      iconBg: 'rgba(34,197,94,0.15)', iconColor: '#22c55e',
      sparkData: [20, 35, 28, 42, 38, stats.completedOrders],
    },
    {
      icon: <MdPeople />, label: 'Customers',
      value: stats.totalCustomers,
      change: null,
      iconBg: 'rgba(168,85,247,0.15)', iconColor: '#a855f7',
      sparkData: [120, 185, 240, 310, 420, stats.totalCustomers],
    },
    {
      icon: <MdRestaurantMenu />, label: 'Menu Items',
      value: stats.totalMenuItems,
      change: null,
      iconBg: 'rgba(59,130,246,0.12)', iconColor: '#3b82f6',
      sparkData: [10, 14, 18, 20, 22, stats.totalMenuItems],
    },
    {
      icon: <MdStar />, label: 'Featured Items',
      value: stats.featuredItems,
      change: null,
      iconBg: 'rgba(244,197,66,0.12)', iconColor: '#F4C542',
      sparkData: [2, 4, 5, 6, 7, stats.featuredItems],
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.greeting}>Good evening, Admin 👋</div>
          <div className={styles.greetingSub}>Here's what's happening at Hot & Spicy today.</div>
        </div>
        <span className={styles.dateLabel}>{today}</span>
      </div>

      {/* ── Summary cards ── */}
      <div className={styles.cardsGrid}>
        {CARDS.map((c, i) => (
          <DashboardCard key={c.label} index={i} {...c} />
        ))}
      </div>

      {/* ── Quick actions ── */}
      <motion.div
        className={styles.quickGrid}
        variants={fadeUp} initial="hidden" animate="visible" custom={0}
      >
        {QUICK_ACTIONS.map((q) => (
          <motion.div key={q.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link to={q.to} className={styles.quickCard}>
              <div className={styles.quickIcon} style={{ background: q.bg }}>
                <span style={{ color: q.color, display: 'flex', fontSize: '1.25rem' }}>{q.icon}</span>
              </div>
              <span className={styles.quickLabel}>{q.label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Revenue chart + Orders chart ── */}
      <div className={styles.row}>
        <motion.div className={styles.panel} variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Revenue Overview</span>
            <Link to="/admin/analytics" className={styles.panelLink}>View Analytics</Link>
          </div>
          <div className={styles.chartPlaceholder} style={{ minHeight: 200 }}>
            <FakeLineChart />
            <div className={styles.chartLabel}>
              <MdTrendingUp className={styles.chartIcon} />
              <span>₨ {stats.totalRevenue.toLocaleString()} total revenue</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 3, background: '#F4C542', borderRadius: 2, display: 'inline-block' }} />
              Revenue
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 3, background: '#FF9F1C', borderRadius: 2, display: 'inline-block', opacity: 0.6 }} />
              Target
            </span>
          </div>
        </motion.div>

        <motion.div className={styles.panel} variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Monthly Orders</span>
            <Link to="/admin/orders" className={styles.panelLink}>View All</Link>
          </div>
          <div className={styles.chartPlaceholder} style={{ minHeight: 200 }}>
            <FakeBarChart />
            <div className={styles.chartLabel}>
              <MdShoppingBag className={styles.chartIcon} />
              <span>{stats.totalOrders} total orders</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Recent orders + Popular items ── */}
      <div className={styles.rowWide}>
        {/* Recent orders table */}
        <motion.div className={styles.panel} variants={fadeUp} initial="hidden" animate="visible" custom={3}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Recent Orders</span>
            <Link to="/admin/orders" className={styles.panelLink}>View All</Link>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '20px 0' }}>
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td><span className={styles.orderId}>#{String(o.id).slice(-6).toUpperCase()}</span></td>
                      <td><span className={styles.customerName}>{o.customerName}</span></td>
                      <td>₨ {o.total.toLocaleString()}</td>
                      <td>
                        <span className={`${styles.status} ${styles[statusKey(o.status)]}`}>
                          <span className={styles.statusDot} />
                          {o.status}
                        </span>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleDateString('en-PK')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Popular items */}
        <motion.div className={styles.panel} variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Popular Items</span>
            <Link to="/admin/menu" className={styles.panelLink}>Menu</Link>
          </div>
          <div className={styles.popularList}>
            {stats.popularDishes.length === 0 ? (
              <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.83rem', textAlign: 'center', padding: '20px 0' }}>
                No orders yet.
              </div>
            ) : (
              stats.popularDishes.map((item, i) => (
                <div key={item.dishName} className={styles.popularItem}>
                  <span className={`${styles.popularRank} ${i < 3 ? styles.top : ''}`}>#{i + 1}</span>
                  <span className={styles.popularEmoji}>{ITEM_EMOJI[i] ?? '🍽️'}</span>
                  <div className={styles.popularInfo}>
                    <div className={styles.popularName}>{item.dishName}</div>
                    <div className={styles.popularOrders}>{item.orders} orders</div>
                  </div>
                  <div className={styles.popularBar}>
                    <div
                      className={styles.popularBarFill}
                      style={{ width: `${(item.orders / maxOrders) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
