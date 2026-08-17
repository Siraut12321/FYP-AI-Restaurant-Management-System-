import { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdMenu,
  MdSearch,
  MdNotifications,
  MdMessage,
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

/* ── Helper: get initials from name ── */
function getInitials(name) {
  if (!name) return 'A';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function TopNavbar({ onToggleSidebar, collapsed }) {
  const { user, logout }    = useContext(AuthContext);
  const navigate             = useNavigate();
  const { pathname }         = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [notifs,      setNotifs]      = useState([]);
  // TODO: Fetch real notifications from /api/v1/notifications when endpoint is available

  const profileRef = useRef(null);
  const notifRef   = useRef(null);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handler(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const pageTitle = TITLES[pathname] ?? 'Admin';
  const initials  = getInitials(user?.name);

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

        {/* Messages */}
        <button className={styles.iconBtn} aria-label="Messages">
          <MdMessage />
          <span className={styles.dot} />
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className={styles.iconBtn}
            aria-label="Notifications"
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
          >
            <MdNotifications />
            {notifs.length > 0 && <span className={styles.dot} />}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                className={styles.notifPanel}
                variants={dropVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className={styles.notifHeader}>
                  <span className={styles.notifTitle}>Notifications ({notifs.length})</span>
                  <button className={styles.notifClear} onClick={() => setNotifs([])}>
                    Clear all
                  </button>
                </div>
                <div className={styles.notifList}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '20px 16px', color: 'var(--admin-text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifs.map((n) => (
                      <div key={n.id} className={styles.notifItem}>
                        <span className={styles.notifDot} style={{ background: n.color }} />
                        <div>
                          <div className={styles.notifText}>{n.text}</div>
                          <div className={styles.notifTime}>{n.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.vDivider} />

        {/* Avatar + Profile dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            className={styles.avatarBtn}
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
            aria-label="Profile menu"
          >
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.avatarInfo}>
              <span className={styles.avatarName}>{user?.name ?? 'Admin'}</span>
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
                  <div className={styles.dropName}>{user?.name ?? 'Administrator'}</div>
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
