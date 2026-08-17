import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MdAttachMoney, MdLocalShipping, MdPendingActions,
  MdTrendingUp, MdPeopleAlt, MdRestaurantMenu, MdSmartToy,
  MdCheckCircle, MdCancel, MdTimer, MdLocalPhone, MdLanguage,
} from 'react-icons/md';
import analyticsService from '../../services/analyticsService';

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.28, delay: i * 0.07, ease: 'easeOut' } }),
};

function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await analyticsService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#a1a1aa' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: 12 }}>Loading analytics…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--admin-danger)' }}>
        <div style={{ fontSize: '1rem' }}>{error}</div>
      </div>
    );
  }

  if (!stats) return null;

  const averageOrderValue = stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : 0;
  const activeCustomers = stats.totalCustomers || 0;

  const STAT_CARDS = [
    { key: 'totalRevenue',    label: 'Total Revenue',       value: `₨ ${(stats.totalRevenue || 0).toLocaleString()}`,        icon: <MdAttachMoney />, color: 'var(--admin-gold)', dim: 'var(--admin-gold-dim)' },
    { key: 'todayRevenue',    label: "Today's Revenue",     value: `₨ ${(stats.todayRevenue || 0).toLocaleString()}`,        icon: <MdTrendingUp />,  color: 'var(--admin-success)', dim: 'var(--admin-success-dim)' },
    { key: 'totalOrders',     label: 'Total Orders',        value: stats.totalOrders || 0,                                    icon: <MdLocalShipping />, color: 'var(--admin-info)', dim: 'var(--admin-info-dim)' },
    { key: 'averageOrderValue', label: 'Avg Order Value',   value: `₨ ${averageOrderValue.toLocaleString()}`,                icon: <MdAttachMoney />,   color: 'var(--admin-warning)', dim: 'var(--admin-warning-dim)' },
    { key: 'totalCustomers',  label: 'Total Customers',     value: activeCustomers || 0,                                      icon: <MdPeopleAlt />,    color: 'var(--admin-info)', dim: 'var(--admin-info-dim)' },
    { key: 'completedOrders', label: 'Completed Orders',    value: stats.completedOrders || 0,                               icon: <MdCheckCircle />, color: 'var(--admin-success)', dim: 'var(--admin-success-dim)' },
    { key: 'pendingOrders',   label: 'Pending Orders',      value: stats.pendingOrders || 0,                                  icon: <MdPendingActions />, color: 'var(--admin-warning)', dim: 'var(--admin-warning-dim)' },
    { key: 'cancelledOrders', label: 'Cancelled Orders',    value: stats.cancelledOrders || 0,                               icon: <MdCancel />, color: 'var(--admin-danger)', dim: 'var(--admin-danger-dim)' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>📊 Analytics</h1>
        <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: 4 }}>Revenue, orders, and restaurant insights.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {STAT_CARDS.map((c, i) => (
          <motion.div
            key={c.key}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={i}
            whileHover={{ scale: 1.02, y: -2 }}
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 16,
              padding: 18,
              boxShadow: '0 14px 40px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}>
              <span style={{ color: c.color, fontSize: '1.8rem', display: 'flex' }}>{c.icon}</span>
            </div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: c.color,
              marginBottom: 4,
            }}>
              {c.value}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{c.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Grid: Recent Orders + Popular Dishes ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20,
      }}>
        {/* ── Recent Orders ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: 18,
            boxShadow: '0 14px 40px rgba(0,0,0,0.45)',
          }}
        >
          <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>📋 Recent Orders</h3>
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <div style={{ color: '#efe8df', marginBottom: 2 }}>{order.customerName}</div>
                    <div style={{ color: '#71717a', fontSize: '0.75rem' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--admin-gold)', fontWeight: 700 }}>₨ {order.total.toLocaleString()}</div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        background: order.status === 'Delivered' ? 'var(--admin-success-dim)' : 'var(--admin-warning-dim)',
                        color: order.status === 'Delivered' ? 'var(--admin-success)' : 'var(--admin-warning)',
                        padding: '2px 6px',
                        borderRadius: 3,
                        marginTop: 2,
                      }}
                    >
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#71717a', fontSize: '0.85rem' }}>No recent orders.</p>
          )}
        </motion.div>

        {/* ── Popular Dishes ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={7}
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: 18,
            boxShadow: '0 14px 40px rgba(0,0,0,0.45)',
          }}
        >
          <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>🔥 Top Dishes</h3>
          {stats.popularDishes && stats.popularDishes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.popularDishes.map((dish, idx) => (
                <div
                  key={dish.dishName || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <div style={{ color: '#efe8df', marginBottom: 2 }}>{dish.dishName}</div>
                    <div style={{ color: '#71717a', fontSize: '0.75rem' }}>{dish.orders} orders</div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-gold)' }}>₨ {dish.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#71717a', fontSize: '0.85rem' }}>No data yet.</p>
          )}
        </motion.div>

        {/* ── Order Status Breakdown ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={8}
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: 18,
            boxShadow: '0 14px 40px rgba(0,0,0,0.45)',
          }}
        >
          <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>📦 Order Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Pending',   count: stats.pendingOrders, color: 'var(--admin-warning)' },
              { label: 'Preparing', count: stats.preparingOrders, color: 'var(--admin-info)' },
              { label: 'Ready',     count: stats.readyOrders, color: 'var(--admin-success)' },
              { label: 'Delivered', count: stats.completedOrders, color: 'var(--admin-gold)' },
              { label: 'Cancelled', count: stats.cancelledOrders, color: 'var(--admin-danger)' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#efe8df', fontSize: '0.85rem' }}>{s.label}</span>
                <span style={{ color: s.color, fontWeight: 700 }}>{s.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Sales Last 7 Days ── */}
      {stats.salesLast7Days && stats.salesLast7Days.length > 0 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={9}
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: 18,
            boxShadow: '0 14px 40px rgba(0,0,0,0.45)',
            marginTop: 20,
          }}
        >
          <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>📈 Last 7 Days Sales</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.salesLast7Days.map((day) => (
              <div key={day.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#efe8df', fontSize: '0.85rem' }}>{day.date}</div>
                  <div style={{ color: '#71717a', fontSize: '0.75rem' }}>{day.orders} orders</div>
                </div>
                <div style={{
                  height: 28,
                  background: 'linear-gradient(90deg, #ffd166, #ff8c42)',
                  borderRadius: 4,
                  width: `${Math.min((day.revenue / (stats.totalRevenue || 1)) * 200, 200)}px`,
                }} />
                <div style={{ color: 'var(--admin-gold)', fontWeight: 700, minWidth: '90px', textAlign: 'right' }}>
                  ₨ {day.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Website vs Voice Orders ── */}
      {stats.orderSources && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={10}
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: 18,
            boxShadow: '0 14px 40px rgba(0,0,0,0.45)',
            marginTop: 20,
          }}
        >
          <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>🎙️ Website vs Voice Orders</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16,
          }}>
            {/* Website Orders */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 12,
              padding: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <MdLanguage style={{ color: 'var(--admin-info)', fontSize: '1.2rem' }} />
                <span style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 600 }}>Website</span>
              </div>
              <div style={{ color: 'var(--admin-info)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>
                {stats.orderSources.Website.count || 0}
              </div>
              <div style={{ color: '#71717a', fontSize: '0.75rem' }}>
                ₨ {(stats.orderSources.Website.revenue || 0).toLocaleString()}
              </div>
            </div>

            {/* Voice Orders */}
            <div style={{
              background: 'rgba(244, 197, 66, 0.1)',
              border: '1px solid rgba(244, 197, 66, 0.3)',
              borderRadius: 12,
              padding: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <MdLocalPhone style={{ color: 'var(--admin-gold)', fontSize: '1.2rem' }} />
                <span style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 600 }}>Voice AI</span>
              </div>
              <div style={{ color: 'var(--admin-gold)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>
                {stats.orderSources.Voice.count || 0}
              </div>
              <div style={{ color: '#71717a', fontSize: '0.75rem' }}>
                ₨ {(stats.orderSources.Voice.revenue || 0).toLocaleString()}
              </div>
            </div>

            {/* Breakdown Chart */}
            {(stats.orderSources.Website.count > 0 || stats.orderSources.Voice.count > 0) && (
              <div style={{
                gridColumn: '1 / -1',
                display: 'flex',
                height: 40,
                gap: 2,
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 8,
                padding: 2,
              }}>
                {stats.orderSources.Website.count > 0 && (
                  <div
                    style={{
                      flex: stats.orderSources.Website.count,
                      background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                      borderRadius: 6,
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}>
                      {Math.round((stats.orderSources.Website.count / (stats.orderSources.Website.count + stats.orderSources.Voice.count)) * 100)}% Website
                    </div>
                  </div>
                )}
                {stats.orderSources.Voice.count > 0 && (
                  <div
                    style={{
                      flex: stats.orderSources.Voice.count,
                      background: 'linear-gradient(90deg, #f4c542, #d4a620)',
                      borderRadius: 6,
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#000',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}>
                      {Math.round((stats.orderSources.Voice.count / (stats.orderSources.Website.count + stats.orderSources.Voice.count)) * 100)}% Voice
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Category Performance ── */}
      {stats.categoryPerformance && stats.categoryPerformance.length > 0 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={11}
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: 18,
            boxShadow: '0 14px 40px rgba(0,0,0,0.45)',
            marginTop: 20,
          }}
        >
          <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>📂 Category Performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.categoryPerformance.map((cat, idx) => {
              const maxRevenue = Math.max(...stats.categoryPerformance.map((c) => c.revenue || 0)) || 1;
              const barWidth = (cat.revenue / maxRevenue) * 100;
              return (
                <div key={cat.category || idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#efe8df', fontSize: '0.85rem', fontWeight: 500 }}>{cat.category || 'Uncategorized'}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--admin-gold)', fontSize: '0.85rem', fontWeight: 700 }}>₨ {(cat.revenue || 0).toLocaleString()}</div>
                      <div style={{ color: '#71717a', fontSize: '0.7rem' }}>{cat.orders || 0} orders</div>
                    </div>
                  </div>
                  <div style={{
                    height: 8,
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #ffd166, #ff9f1c)',
                        width: `${barWidth}%`,
                        transition: 'width 0.3s ease',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Analytics;
