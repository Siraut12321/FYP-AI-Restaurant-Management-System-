import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MdPeople, MdVerifiedUser,
  MdStar, MdAttachMoney, MdShoppingBag,
} from 'react-icons/md';
import { customerService } from '../../services/customerService';
import styles from './Customers.module.css';

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.07, ease: 'easeOut' } }),
};

function Customers() {
  const customers = useMemo(() => customerService.listCustomers(), []);

  const total    = customers.length;
  const active   = customers.filter((c) => c.status === 'active').length;
  const inactive = customers.filter((c) => c.status === 'inactive').length;
  const totalOrders   = customers.reduce((s, c) => s + c.orders, 0);
  const totalSpending = customers.reduce((s, c) => s + c.spending, 0);
  const avgSpending   = total ? Math.round(totalSpending / total) : 0;
  const topSpender    = customers.reduce((a, b) => (a.spending > b.spending ? a : b), customers[0] || {});

  const COUNTERS = [
    {
      icon: <MdPeople />,      label: 'Total Customers', value: total,
      color: 'var(--admin-gold)',    dim: 'var(--admin-gold-dim)',
      sub: 'All registered diners',
    },
    {
      icon: <MdVerifiedUser />, label: 'Active',          value: active,
      color: 'var(--admin-success)', dim: 'var(--admin-success-dim)',
      sub: 'Ordered in last 30 days',
    },
    {
      icon: <MdPeople />,      label: 'Inactive',        value: inactive,
      color: 'var(--admin-danger)',  dim: 'var(--admin-danger-dim)',
      sub: 'No recent activity',
    },
    {
      icon: <MdShoppingBag />, label: 'Total Orders',    value: totalOrders,
      color: 'var(--admin-info)',    dim: 'var(--admin-info-dim)',
      sub: 'Across all customers',
    },
    {
      icon: <MdAttachMoney />, label: 'Total Revenue',   value: `₨ ${totalSpending.toLocaleString()}`,
      color: 'var(--admin-orange)',  dim: 'var(--admin-orange-dim)',
      sub: 'Lifetime customer spend',
    },
    {
      icon: <MdAttachMoney />, label: 'Avg. Spending',   value: `₨ ${avgSpending.toLocaleString()}`,
      color: 'var(--admin-gold)',    dim: 'var(--admin-gold-dim)',
      sub: 'Per customer lifetime',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Customers</div>
          <div className={styles.pageSub}>Overview of your customer base and spending.</div>
        </div>
      </div>

      {/* Counter cards */}
      <div className={styles.countersGrid}>
        {COUNTERS.map((c, i) => (
          <motion.div
            key={c.label}
            className={styles.counterCard}
            variants={fadeUp} initial="hidden" animate="visible" custom={i}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <div className={styles.counterIcon} style={{ background: c.dim }}>
              <span style={{ color: c.color, display: 'flex', fontSize: '1.3rem' }}>{c.icon}</span>
            </div>
            <div className={styles.counterValue} style={{ color: c.color }}>{c.value}</div>
            <div className={styles.counterLabel}>{c.label}</div>
            <div className={styles.counterSub}>{c.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Top spender highlight */}
      {topSpender?.name && (
        <motion.div
          className={styles.topSpenderCard}
          variants={fadeUp} initial="hidden" animate="visible" custom={6}
        >
          <div className={styles.topSpenderLeft}>
            <div className={styles.topSpenderAvatar}>
              {topSpender.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className={styles.topSpenderLabel}>
                <MdStar style={{ color: 'var(--admin-gold)', marginRight: 5 }} />
                Top Spender
              </div>
              <div className={styles.topSpenderName}>{topSpender.name}</div>
              <div className={styles.topSpenderMeta}>{topSpender.email} · {topSpender.orders} orders</div>
            </div>
          </div>
          <div className={styles.topSpenderAmount}>
            ₨ {topSpender.spending.toLocaleString()}
          </div>
        </motion.div>
      )}

      {/* Customer list */}
      <motion.div
        className={styles.listPanel}
        variants={fadeUp} initial="hidden" animate="visible" custom={7}
      >
        <div className={styles.listHeader}>
          <span className={styles.listTitle}>All Customers</span>
          <span className={styles.listCount}>{total} total</span>
        </div>
        <div className={styles.listBody}>
          {customers.map((c, i) => (
            <motion.div
              key={c.id}
              className={styles.listRow}
              variants={fadeUp} initial="hidden" animate="visible" custom={i}
            >
              <div className={styles.rowAvatar}>
                {c.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className={styles.rowInfo}>
                <div className={styles.rowName}>{c.name}</div>
                <div className={styles.rowMeta}>{c.email} · {c.phone}</div>
              </div>
              <div className={styles.rowStats}>
                <span className={styles.rowStat}>
                  <MdShoppingBag style={{ fontSize: '0.85rem' }} /> {c.orders} orders
                </span>
                <span className={styles.rowStat} style={{ color: 'var(--admin-gold)' }}>
                  ₨ {c.spending.toLocaleString()}
                </span>
              </div>
              <span
                className={styles.statusBadge}
                style={{
                  background: c.status === 'active' ? 'var(--admin-success-dim)' : 'var(--admin-danger-dim)',
                  color:      c.status === 'active' ? 'var(--admin-success)'     : 'var(--admin-danger)',
                }}
              >
                {c.status}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Customers;
