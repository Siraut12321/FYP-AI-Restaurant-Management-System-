import { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdMenu,
  MdSearch,
  MdKeyboardArrowDown,
  MdPerson,
  MdSettings,
  MdLogout,
  MdAdminPanelSettings,
} from 'react-icons/md';
import { AuthContext } from '../../../context/AuthContext';
import styles from './TopNavbar.module.css';

/* ── Notifications: currently empty, will be fetched from API in Phase 7 ── */
// const NOTIFICATIONS = [];

/* ── Route → readable title map ── */
const TITLES = {
  '/admin/dashboard':    'Dashboard',
  '/admin/orders':       'Orders',
  '/admin/customers':    'Customers',
  '/admin/menu':         'Menu Management',
  '/admin/reservations': 'Reservations',
  '/admin/coupons':      'Coupons',
  '/admin/reviews':      'Reviews',
  '/admin/analytics':    'Analytics',
  '/admin/ai-orders':    'AI Orders',
  '/admin/settings':     'Settings',
};

/* ── Dropdown animation ── */
const dropVariants = {
  initial: { opacity: 0, scale: 0.94, y: -6 },
  animate: { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.94, y: -6, transition: { duration: 0.14 } },
};

function TopNavbar({ onToggleSidebar, collapsed }) {
  const { user, logout }    = useContext(AuthContext);
  const navigate             = useNavigate();
  const { pathname }         = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handler(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const pageTitle = TITLES[pathname] ?? 'Admin';

  return (
    <header className={`${styles.navbar} ${collapsed ? styles.collapsed : ''}`}>

      {/* Hamburger */}
      <button className={styles.hamburger} onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <MdMenu />
      </button>

      {/* Page title */}
      <span className={styles.pageTitle}>{pageTitle}</span>

      {/* Search */}
      <div className={styles.searchWrap}>
        <MdSearch className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search orders, customers, menu…"
          aria-label="Search"
        />
      </div>

      {/* Right cluster */}
      <div className={styles.right}>

        <div className={styles.vDivider} />

        {/* Avatar + Profile dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            className={styles.avatarBtn}
            onClick={() => setProfileOpen((v) => !v)}
            aria-label="Profile menu"
          >
            <div className={styles.avatar}>A</div>
            <div className={styles.avatarInfo}>
              <span className={styles.avatarName}>Admin</span>
              <span className={styles.avatarRole}>Administrator</span>
            </div>
            <MdKeyboardArrowDown className={`${styles.chevron} ${profileOpen ? styles.open : ''}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                className={styles.dropdown}
                variants={dropVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {/* Header */}
                <div className={styles.dropHeader}>
                  <div className={styles.dropName}>Admin</div>
                  <div className={styles.dropEmail}>{user?.email ?? 'admin@hotandspicy.local'}</div>
                </div>

                {/* Items */}
                <div className={styles.dropList}>
                  <Link
                    to="/admin/dashboard"
                    className={styles.dropItem}
                    onClick={() => setProfileOpen(false)}
                  >
                    <MdAdminPanelSettings /> Dashboard
                  </Link>
                  <Link
                    to="/admin/settings"
                    className={styles.dropItem}
                    onClick={() => setProfileOpen(false)}
                  >
                    <MdPerson /> Profile
                  </Link>
                  <Link
                    to="/admin/settings"
                    className={styles.dropItem}
                    onClick={() => setProfileOpen(false)}
                  >
                    <MdSettings /> Settings
                  </Link>

                  <div className={styles.dropDivider} />

                  <button
                    className={`${styles.dropItem} ${styles.danger}`}
                    onClick={handleLogout}
                  >
                    <MdLogout /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}

export default TopNavbar;
