import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdDashboard,
  MdRestaurantMenu,
  MdShoppingBag,
  MdPeople,
  MdStar,
  MdBarChart,
  MdSettings,
  MdLogout,
  MdClose,
  MdSmartToy,
  MdForum,
} from 'react-icons/md';
import { AuthContext } from '../../../context/AuthContext';
import api from '../../../api/api';
import styles from './Sidebar.module.css';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/admin/dashboard', icon: <MdDashboard />,     label: 'Dashboard'  },
      { to: '/admin/orders',    icon: <MdShoppingBag />,   label: 'Orders'     },
      { to: '/admin/customers', icon: <MdPeople />,        label: 'Customers'  },
    ],
  },
  {
    label: 'Restaurant',
    items: [
      { to: '/admin/menu',    icon: <MdRestaurantMenu />, label: 'Menu Management' },
      { to: '/admin/reviews', icon: <MdStar />,           label: 'Reviews'         },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/admin/analytics', icon: <MdBarChart />,  label: 'Analytics' },
      { to: '/admin/ai-orders', icon: <MdSmartToy />,  label: 'AI Orders' },
      { to: '/admin/conversations', icon: <MdForum />, label: 'Conversations' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/settings', icon: <MdSettings />, label: 'Settings' },
    ],
  },
];

const sidebarVariants = {
  expanded:  { width: 260 },
  collapsed: { width: 72  },
};

function Sidebar({ collapsed, mobileOpen, onClose }) {
  const { logout } = useContext(AuthContext);
  const navigate   = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(({ data }) => setPendingCount(data.data?.pendingOrders ?? 0))
      .catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const sidebarClass = [
    styles.sidebar,
    collapsed  ? styles.collapsed  : '',
    mobileOpen ? styles.mobileOpen : '',
  ].filter(Boolean).join(' ');

  return (
    <motion.aside
      className={sidebarClass}
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {/* ── Brand ── */}
      <NavLink to='/admin/dashboard' className={styles.brand} onClick={onClose}>
        <div className={styles.brandIcon}>🍽️</div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Hot & Spicy</span>
          <span className={styles.brandSub}>Admin Panel</span>
        </div>
      </NavLink>

      {/* ── Mobile close button ── */}
      {mobileOpen && (
        <button
          className={styles.navItem}
          style={{ position: 'absolute', top: 14, right: 12, width: 'auto', padding: '6px 8px' }}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <span className={styles.navIcon}><MdClose /></span>
        </button>
      )}

      {/* ── Navigation ── */}
      <nav className={styles.nav}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className={styles.sectionLabel}>{section.label}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.to === '/admin/orders' && pendingCount > 0 && (
                  <span className={styles.badge}>{pendingCount}</span>
                )}
                {/* Tooltip shown only when collapsed on desktop */}
                <span className={styles.tooltip}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.divider} />

      {/* ── Footer: Logout ── */}
      <div className={styles.sidebarFooter}>
        <button className={styles.navItem} onClick={handleLogout}>
          <span className={styles.navIcon}><MdLogout /></span>
          <span className={styles.navLabel}>Logout</span>
          <span className={styles.tooltip}>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
